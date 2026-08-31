// src/composables/useMemberData.js
// Hook data peserta — bungkus service jadi reaktif { data, loading, error, refresh }.
import { ref, unref, watch, onMounted } from 'vue'
import { authState } from '../store/auth.js'
import { fetchProfile } from '../services/profile.js'
import { fetchHomeStats } from '../services/stats.js'
import { fetchActivities, fetchActivityDetail } from '../services/activities.js'
import { fetchDistanceLeaderboard, fetchEffortLeaderboard, fetchLeagueLeaderboard, fetchRosterAvatars } from '../services/leaderboard.js'
import { tierForRank } from '../lib/leagueTier.js'
import { fetchMyAchievements, checkAchievements } from '../services/achievements.js'

// Helper generik: jalankan `runner` saat mount + tiap deps berubah.
function useAsync(runner, deps = []) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      data.value = await runner()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)
  if (deps.length) watch(deps, refresh)
  return { data, loading, error, refresh }
}

export function useProfile(athleteId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchProfile(unref(athleteId) ?? authState.athleteId),
  )
  return { profile: data, loading, error, refresh }
}

export function useHomeStats() {
  const { data, loading, error, refresh } = useAsync(
    () => fetchHomeStats(authState.athleteId),
  )
  return { stats: data, loading, error, refresh }
}

// filter: ref/getter → 'Semua' | 'Lari' | 'Gym'
export function useActivities(filter) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivities({ athleteId: authState.athleteId, filter: unref(filter) ?? 'Semua' }),
    [() => unref(filter)],
  )
  return { activities: data, loading, error, refresh }
}

export function useActivityDetail(activityId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivityDetail(unref(activityId)),
    [() => unref(activityId)],
  )
  return { activity: data, loading, error, refresh }
}

// mode: ref/getter → 'running' | 'effort' | 'league'
// leaguePeriod: ref/getter → 'weekly' | 'monthly' (cuma dipakai saat mode === 'league')
export function useLeaderboard(mode, leaguePeriod) {
  const { data, loading, error, refresh } = useAsync(async () => {
    const m = unref(mode)
    if (m === 'league') {
      const rows = await fetchLeagueLeaderboard(unref(leaguePeriod) || 'monthly')
      return rows.map((r, i) => ({ ...r, rank: i + 1, tier: tierForRank(i + 1, rows.length) }))
    }
    const rows = m === 'effort' ? await fetchEffortLeaderboard() : await fetchDistanceLeaderboard()
    const avatarMap = await fetchRosterAvatars()
    return rows.map((r) => ({ ...r, avatar: avatarMap.get(r.athleteId) ?? null }))
  }, [() => unref(mode), () => unref(leaguePeriod)])
  return { rows: data, loading, error, refresh }
}

// Katalog 12 achievement + status unlock milik atlet yang login.
export function useAchievements() {
  const { data, loading, error, refresh } = useAsync(fetchMyAchievements)
  return { achievements: data, loading, error, refresh }
}

// Evaluasi ulang kriteria (RPC) — dipanggil imperatif (mis. saat Home dimuat),
// balikannya cuma achievement yang BARU unlock, dipakai utk toast perayaan.
export { checkAchievements }
