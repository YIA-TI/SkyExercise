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

// Nomor & tahun minggu ISO-8601 (patokan Kamis) — samakan dengan `to_char(d,'IYYY"W"IW')`
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
      periodKey: `${isoYear}W${String(isoWeek).padStart(2, '0')}`,
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
    supabase.from('quests').select('id, title, scope, created_at').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('quest_claims').select('athlete_id, quest_id, period_key')
      .in('period_key', [...weeks.map((w) => w.periodKey), ...days]),
    supabase.from('activities').select('athlete_id, start_date, sport_type')
      .gte('start_date', dateStrStartISO(startDateStr)).lte('start_date', dateStrEndISO(endDateStr)),
  ])
  if (athErr) throw athErr
  if (qErr) throw qErr
  if (cErr) throw cErr
  if (actErr) throw actErr

  // claimedSet key: `${athleteId}:${questId}:${periodKey}` (periodKey minggu ATAU tanggal harian)
  const claimedSet = new Set((claims ?? []).map((c) => `${c.athlete_id}:${c.quest_id}:${c.period_key}`))

  // activeDaySet key: `${athleteId}:${'YYYY-MM-DD'}` — ada aktivitas lari/gym pada hari itu,
  // lepas dari ada/tidaknya quest yang cocok.
  const activeDaySet = new Set(
    (acts ?? [])
      .filter((a) => RUN.includes(a.sport_type) || GYM.includes(a.sport_type))
      .map((a) => `${a.athlete_id}:${toDateStr(new Date(a.start_date))}`),
  )

  const questList = quests ?? []

  const rows = (athletes ?? []).map((a) => {
    const questCols = questList.map((q) => {
      // Quest cuma "berlaku" sejak dibuat — minggu/hari sebelum created_at bukan
      // kegagalan, tapi memang belum ada quest-nya, jadi dikeluarkan dari total.
      const createdAt = new Date(q.created_at)

      if (q.scope === 'mingguan') {
        const perWeek = weeks.map((w) => (w.end >= createdAt ? claimedSet.has(`${a.athlete_id}:${q.id}:${w.periodKey}`) : null))
        const applicable = perWeek.filter((v) => v !== null)
        return {
          questId: q.id, title: q.title, scope: 'mingguan', unit: 'minggu',
          achieved: applicable.filter(Boolean).length,
          total: applicable.length,
          perWeek,
        }
      }
      // harian
      const perWeek = weekDayLists.map((wd) =>
        wd.filter((d) => new Date(`${d}T00:00:00`) >= createdAt && claimedSet.has(`${a.athlete_id}:${q.id}:${d}`)).length,
      )
      const perWeekTotal = weekDayLists.map((wd) => wd.filter((d) => new Date(`${d}T00:00:00`) >= createdAt).length)
      return {
        questId: q.id, title: q.title, scope: 'harian', unit: 'hari',
        achieved: perWeek.reduce((s, n) => s + n, 0),
        total: perWeekTotal.reduce((s, n) => s + n, 0),
        perWeek,
        perWeekTotal,
      }
    })

    // Kolom bonus: hari ada aktivitas lari/gym, independen dari quest apa pun.
    const bonusPerWeek = weekDayLists.map((wd) => wd.filter((d) => activeDaySet.has(`${a.athlete_id}:${d}`)).length)
    const bonusPerWeekTotal = weekDayLists.map((wd) => wd.length)
    questCols.push({
      questId: 'bonus-active-days', title: 'Hari Aktif (Bonus)', scope: 'bonus', unit: 'hari',
      achieved: bonusPerWeek.reduce((s, n) => s + n, 0),
      total: days.length,
      perWeek: bonusPerWeek,
      perWeekTotal: bonusPerWeekTotal,
    })

    return { athleteId: a.athlete_id, name: nameOf(a), questCols }
  })

  return { weeks, quests: questList, rows }
}
