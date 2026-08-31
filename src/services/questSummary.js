// src/services/questSummary.js
// Ringkasan quest (harian + mingguan) lintas personil (admin), plus kolom bonus
// "Hari Aktif" yang independen dari quest — dihitung langsung dari `activities`,
// supaya lari/gym tanpa quest yang cocok tetap tercatat sebagai nilai plus.
// Agregasi client-side dari `athletes` + `quests` + `quest_claims` + `activities`,
// semuanya sudah terbaca admin lewat RLS is_admin() yang ada. Tanpa RPC/migrasi baru.
import { supabase } from '../lib/supabase.js'
import { toDateStr, dateStrStartISO, dateStrEndISO } from '../lib/normalize.js'

const RUN = ['Run', 'TrailRun', 'VirtualRun']
const GYM = ['WeightTraining', 'Workout', 'Crossfit']

function nameOf(a) {
  return `${a?.firstname ?? ''} ${a?.lastname ?? ''}`.trim()
}

function mondayOf(date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Senin = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Nomor & tahun minggu ISO-8601 (patokan Kamis) — samakan dengan `to_char(d,'IYYY-"W"IW')`
// yang dipakai claim_quest() di database, supaya period_key cocok.
function isoWeekOf(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3)
  const isoWeek = 1 + Math.round((d - firstThursday) / (7 * 86400000))
  return { isoYear: d.getUTCFullYear(), isoWeek }
}

function shortDate(d) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Label tampilan tanggal/minggu target sebuah quest bertanggal — dipakai di form
// pembuatan quest & header kolom monitoring supaya konsisten.
export function questPeriodLabel(scope, dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (scope !== 'mingguan') return shortDate(d)
  const monday = mondayOf(d)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  return `${shortDate(monday)} – ${shortDate(sunday)}`
}

// Daftar minggu ISO (Senin–Minggu) yang overlap [startDateStr, endDateStr] ('YYYY-MM-DD').
export function weeksInRange(startDateStr, endDateStr) {
  const start = mondayOf(new Date(`${startDateStr}T00:00:00`))
  const end = new Date(`${endDateStr}T00:00:00`)
  const weeks = []
  let cursor = start
  while (cursor <= end) {
    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const { isoYear, isoWeek } = isoWeekOf(cursor)
    weeks.push({
      periodKey: `${isoYear}-W${String(isoWeek).padStart(2, '0')}`,
      start: new Date(cursor),
      end: weekEnd,
      label: `${shortDate(cursor)} – ${shortDate(weekEnd)}`,
    })
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() + 7)
  }
  return weeks
}

// Daftar tanggal ('YYYY-MM-DD') dari startDateStr s.d. endDateStr, inklusif —
// period_key quest harian sama persis dengan string tanggalnya (lihat claim_quest()).
function daysInRange(startDateStr, endDateStr) {
  const start = new Date(`${startDateStr}T00:00:00`)
  const end = new Date(`${endDateStr}T00:00:00`)
  const days = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(toDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

// Matriks personil x quest (harian + mingguan aktif) + kolom bonus "Hari Aktif",
// untuk rentang tanggal terpilih. `quests[i].scope` menandai jenis tiap kolom;
// setiap baris personil punya `questCols` sejajar urutannya dengan `quests`,
// ditambah satu kolom bonus di akhir.
export async function fetchQuestSummary(startDateStr, endDateStr) {
  const weeks = weeksInRange(startDateStr, endDateStr)
  const days = daysInRange(startDateStr, endDateStr)
  if (!weeks.length || !days.length) return { weeks: [], quests: [], rows: [] }

  const weekDayLists = weeks.map((w) =>
    days.filter((d) => {
      const t = new Date(`${d}T00:00:00`).getTime()
      return t >= w.start.getTime() && t <= w.end.getTime()
    }),
  )

  const [
    { data: athletes, error: athErr },
    { data: quests, error: qErr },
    { data: claims, error: cErr },
    { data: acts, error: actErr },
  ] = await Promise.all([
    supabase.from('athletes').select('athlete_id, firstname, lastname').order('firstname', { ascending: true }),
    supabase.from('quests').select('id, title, scope, metric, target, unit, created_at, quest_date').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('quest_claims').select('athlete_id, quest_id, period_key')
      .in('period_key', [...weeks.map((w) => w.periodKey), ...days]),
    supabase.from('activities').select('athlete_id, start_date, sport_type, distance, moving_time')
      .gte('start_date', dateStrStartISO(startDateStr)).lte('start_date', dateStrEndISO(endDateStr)),
  ])
  if (athErr) throw athErr
  if (qErr) throw qErr
  if (cErr) throw cErr
  if (actErr) throw actErr

  // claimedSet key: `${athleteId}:${questId}:${periodKey}` (periodKey minggu ATAU tanggal harian)
  const claimedSet = new Set((claims ?? []).map((c) => `${c.athlete_id}:${c.quest_id}:${c.period_key}`))

  // dayActivityMap key: `${athleteId}:${'YYYY-MM-DD'}` -> agregat lari/gym hari itu,
  // lepas dari ada/tidaknya quest yang cocok. Dipakai baik utk kolom bonus lama maupun
  // progress metrik quest (harian/mingguan) & Total Lari/Total GYM di bawah.
  const dayActivityMap = new Map()
  ;(acts ?? []).forEach((a) => {
    const isRun = RUN.includes(a.sport_type)
    const isGym = GYM.includes(a.sport_type)
    if (!isRun && !isGym) return
    const key = `${a.athlete_id}:${toDateStr(new Date(a.start_date))}`
    const entry = dayActivityMap.get(key) ?? { runKm: 0, runSessions: 0, runMinutes: 0, gymMinutes: 0, gymSessions: 0 }
    if (isRun) {
      entry.runKm += (a.distance || 0) / 1000
      entry.runSessions += 1
      entry.runMinutes += (a.moving_time || 0) / 60
    }
    if (isGym) {
      entry.gymMinutes += (a.moving_time || 0) / 60
      entry.gymSessions += 1
    }
    dayActivityMap.set(key, entry)
  })

  // Nilai mentah suatu metrik quest ('run_distance'|'run_sessions'|'gym_sessions'|'gym_duration')
  // dari agregat satu hari (dayActivityMap entry) — dipakai utk progress periode aktif.
  function metricValueFromEntry(metric, entry) {
    if (!entry) return 0
    if (metric === 'run_distance') return entry.runKm
    if (metric === 'run_sessions') return entry.runSessions
    if (metric === 'gym_sessions') return entry.gymSessions
    if (metric === 'gym_duration') return entry.gymMinutes
    return 0
  }

  const questList = quests ?? []

  // Quest bertanggal (quest_date terisi) cuma berlaku pada satu hari (harian) atau
  // satu minggu (mingguan) spesifik — bukan berulang di tiap hari/minggu rentang
  // filter seperti quest lama (quest_date kosong). Dihitung sekali per quest.
  const targetKeyByQuest = new Map(questList.map((q) => {
    if (!q.quest_date) return [q.id, null]
    if (q.scope === 'mingguan') {
      const { isoYear, isoWeek } = isoWeekOf(new Date(`${q.quest_date}T00:00:00`))
      return [q.id, `${isoYear}-W${String(isoWeek).padStart(2, '0')}`]
    }
    return [q.id, q.quest_date]
  }))

  const rows = (athletes ?? []).map((a) => {
    const questCols = questList.map((q) => {
      // Quest cuma "berlaku" sejak dibuat — minggu/hari sebelum created_at bukan
      // kegagalan, tapi memang belum ada quest-nya, jadi dikeluarkan dari total.
      const createdAt = new Date(q.created_at)
      const targetKey = targetKeyByQuest.get(q.id)

      if (q.scope === 'mingguan') {
        const perWeek = weeks.map((w) => {
          if (w.end < createdAt) return null
          if (targetKey && w.periodKey !== targetKey) return null
          return claimedSet.has(`${a.athlete_id}:${q.id}:${w.periodKey}`)
        })
        const applicable = perWeek.filter((v) => v !== null)

        // Progress metrik (Status/Progress quest live) = capaian pada minggu PALING
        // AKHIR yang berlaku dlm rentang filter — beda dari achieved/total di atas
        // (yg menghitung jumlah minggu tercapai sepanjang rentang, dipakai chart & PDF).
        const lastApplicableIdx = perWeek.reduce((last, v, i) => (v !== null ? i : last), -1)
        const metricValue = lastApplicableIdx === -1 ? null : +weekDayLists[lastApplicableIdx].reduce(
          (s, d) => s + metricValueFromEntry(q.metric, dayActivityMap.get(`${a.athlete_id}:${d}`)), 0,
        ).toFixed(2)

        return {
          questId: q.id, title: q.title, scope: 'mingguan', unit: 'minggu',
          achieved: applicable.filter(Boolean).length,
          total: applicable.length,
          perWeek,
          metricValue, metricTarget: q.target, metricUnit: q.unit,
        }
      }
      // harian
      const isApplicableDay = (d) => new Date(`${d}T00:00:00`) >= createdAt && (!targetKey || d === targetKey)
      const perWeek = weekDayLists.map((wd) =>
        wd.filter((d) => isApplicableDay(d) && claimedSet.has(`${a.athlete_id}:${q.id}:${d}`)).length,
      )
      const perWeekTotal = weekDayLists.map((wd) => wd.filter(isApplicableDay).length)

      // Progress metrik = capaian pada hari PALING AKHIR yang berlaku dlm rentang filter.
      const lastApplicableDay = days.filter(isApplicableDay).pop()
      const metricValue = lastApplicableDay === undefined ? null
        : +metricValueFromEntry(q.metric, dayActivityMap.get(`${a.athlete_id}:${lastApplicableDay}`)).toFixed(2)

      return {
        questId: q.id, title: q.title, scope: 'harian', unit: 'hari',
        achieved: perWeek.reduce((s, n) => s + n, 0),
        total: perWeekTotal.reduce((s, n) => s + n, 0),
        perWeek,
        perWeekTotal,
        metricValue, metricTarget: q.target, metricUnit: q.unit,
      }
    })

    // Kolom bonus: hari ada aktivitas lari/gym + jaraknya, independen dari quest apa pun.
    // Masih dihitung (dipakai PDF export), meski tak lagi ditampilkan di daftar quest
    // per-atlet — digantikan baris "Total Lari"/"Total GYM" yg lebih lengkap di bawah.
    const dayDetail = (d) => {
      const entry = dayActivityMap.get(`${a.athlete_id}:${d}`)
      if (!entry) return null
      return { dateStr: d, label: shortDate(new Date(`${d}T00:00:00`)), km: +entry.runKm.toFixed(1), hasGym: entry.gymSessions > 0 }
    }
    const activeDays = days.map(dayDetail).filter(Boolean)
    const totalKm = activeDays.reduce((s, d) => s + d.km, 0)
    const bonusPerWeek = weekDayLists.map((wd) => wd.map(dayDetail).filter(Boolean))
    const bonusPerWeekTotal = weekDayLists.map((wd) => wd.length)
    questCols.push({
      questId: 'bonus-active-days', title: 'Hari Aktif (Bonus)', scope: 'bonus', unit: 'hari',
      achieved: activeDays.length,
      total: days.length,
      totalKm: +totalKm.toFixed(1),
      perWeek: bonusPerWeek,
      perWeekTotal: bonusPerWeekTotal,
    })

    // Total Lari & Total GYM: agregat aktivitas nyata pada seluruh rentang tanggal
    // terpilih, lepas dari sistem quest — dipakai di baris ringkasan bawah per atlet.
    const totals = days.reduce((acc, d) => {
      const entry = dayActivityMap.get(`${a.athlete_id}:${d}`)
      if (entry) {
        acc.lariKm += entry.runKm
        acc.lariSesi += entry.runSessions
        acc.lariMenit += entry.runMinutes
        acc.gymMenit += entry.gymMinutes
        acc.gymSesi += entry.gymSessions
      }
      return acc
    }, { lariKm: 0, lariSesi: 0, lariMenit: 0, gymMenit: 0, gymSesi: 0 })
    totals.lariKm = +totals.lariKm.toFixed(1)
    totals.lariMenit = Math.round(totals.lariMenit)
    totals.gymMenit = Math.round(totals.gymMenit)

    return { athleteId: a.athlete_id, name: nameOf(a), questCols, totals }
  })

  return { weeks, quests: questList, rows }
}
