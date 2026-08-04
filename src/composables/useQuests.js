// src/composables/useQuests.js
// Quest peserta: progress dihitung server-side (RPC quest_status), klaim via RPC claim_quest.
// Streak dihitung dari tanggal aktivitas nyata.
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'
import { authState } from '../store/auth.js'

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

export function useQuests() {
  const quests = ref([])
  const totalXp = ref(0)
  const streak = ref(0)
  const loading = ref(true)
  const error = ref(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const [{ data: qs, error: qErr }, { data: prog }, { data: acts }] = await Promise.all([
        supabase.rpc('quest_status'),
        supabase.from('athlete_progress').select('total_xp').eq('athlete_id', authState.athleteId).maybeSingle(),
        supabase.from('activities').select('start_date').eq('athlete_id', authState.athleteId)
          .order('start_date', { ascending: false }).limit(90),
      ])
      if (qErr) throw qErr
      quests.value = qs ?? []
      totalXp.value = prog?.total_xp ?? 0
      streak.value = computeStreak((acts ?? []).map((a) => a.start_date))
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function claim(questId) {
    const { data, error: cErr } = await supabase.rpc('claim_quest', { p_quest_id: questId })
    if (cErr) throw cErr
    await load()
    return data // total_xp baru
  }

  onMounted(load)
  return { quests, totalXp, streak, loading, error, claim, refresh: load }
}
