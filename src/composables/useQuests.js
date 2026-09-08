// src/composables/useQuests.js
// Quest peserta: progress dihitung server-side (RPC quest_status), klaim via RPC claim_quest.
// Streak dihitung dari tanggal aktivitas nyata.
import { computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { authState } from '../store/auth.js'
import { useAsync } from './useAsync.js'

// Hitung streak: jumlah hari berturut-turut (mundur dari hari ini / kemarin) yang ada aktivitas.
function computeStreak(dates) {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)))
  let streak = 0
  const cursor = new Date()
  // Toleransi: kalau hari ini belum ada tapi kemarin ada, streak tetap lanjut dari kemarin.
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

async function loadQuestsData() {
  const [{ data: qs, error: qErr }, { data: prog }, { data: acts }] = await Promise.all([
    supabase.rpc('quest_status'),
    supabase.from('athlete_progress').select('total_xp').eq('athlete_id', authState.athleteId).maybeSingle(),
    supabase.from('activities').select('start_date').eq('athlete_id', authState.athleteId)
      .order('start_date', { ascending: false }).limit(90),
  ])
  if (qErr) throw qErr
  return {
    quests: qs ?? [],
    totalXp: prog?.total_xp ?? 0,
    streak: computeStreak((acts ?? []).map((a) => a.start_date)),
  }
}

export function useQuests() {
  const { data, loading, error, refresh } = useAsync(
    loadQuestsData,
    [],
    ['activities', 'quest_claims', 'athlete_progress', 'quests'],
  )

  const quests = computed(() => data.value?.quests ?? [])
  const totalXp = computed(() => data.value?.totalXp ?? 0)
  const streak = computed(() => data.value?.streak ?? 0)

  async function claim(questId) {
    const { data: xp, error: cErr } = await supabase.rpc('claim_quest', { p_quest_id: questId })
    if (cErr) throw cErr
    await refresh()
    return xp // total_xp baru
  }

  return { quests, totalXp, streak, loading, error, claim, refresh }
}
