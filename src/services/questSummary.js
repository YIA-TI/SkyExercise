// src/services/questSummary.js
// Ringkasan quest mingguan lintas personil (admin) — agregasi client-side dari
// `athletes` + `quests` (scope 'mingguan') + `quest_claims`, semuanya sudah
// terbaca admin lewat RLS is_admin() yang ada. Tanpa RPC/migrasi baru.
import { supabase } from '../lib/supabase.js'

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

// Matriks personil x minggu x quest mingguan aktif, untuk rentang tanggal terpilih.
export async function fetchWeeklyQuestSummary(startDateStr, endDateStr) {
  const weeks = weeksInRange(startDateStr, endDateStr)
  const periodKeys = weeks.map((w) => w.periodKey)
  if (!periodKeys.length) return { weeks: [], quests: [], rows: [] }

  const [{ data: athletes, error: athErr }, { data: quests, error: qErr }, { data: claims, error: cErr }] = await Promise.all([
    supabase.from('athletes').select('athlete_id, firstname, lastname').order('firstname', { ascending: true }),
    supabase.from('quests').select('id, title, target, unit, reward').eq('scope', 'mingguan').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('quest_claims').select('athlete_id, quest_id, period_key').in('period_key', periodKeys),
  ])
  if (athErr) throw athErr
  if (qErr) throw qErr
  if (cErr) throw cErr

  // claimedSet key: `${athleteId}:${questId}:${periodKey}`
  const claimedSet = new Set((claims ?? []).map((c) => `${c.athlete_id}:${c.quest_id}:${c.period_key}`))
  const questList = quests ?? []

  const rows = (athletes ?? []).map((a) => {
    const weeklyStatus = weeks.map((w) => {
      const perQuest = questList.map((q) => ({
        questId: q.id,
        title: q.title,
        claimed: claimedSet.has(`${a.athlete_id}:${q.id}:${w.periodKey}`),
      }))
      const achievedCount = perQuest.filter((q) => q.claimed).length
      return {
        periodKey: w.periodKey,
        label: w.label,
        achievedCount,
        totalQuests: questList.length,
        quests: perQuest,
      }
    })
    return {
      athleteId: a.athlete_id,
      name: nameOf(a),
      weeks: weeklyStatus,
    }
  })

  return { weeks, quests: questList, rows }
}
