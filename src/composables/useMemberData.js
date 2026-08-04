// src/composables/useMemberData.js
// Hook data peserta — bungkus service jadi reaktif { data, loading, error, refresh }.
import { ref, unref, watch, onMounted } from 'vue'
import { authState } from '../store/auth.js'
import { fetchProfile } from '../services/profile.js'
import { fetchHomeStats } from '../services/stats.js'
import { fetchActivities, fetchActivityDetail } from '../services/activities.js'
import { fetchDistanceLeaderboard, fetchEffortLeaderboard } from '../services/leaderboard.js'

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

// mode: ref/getter → 'running' | 'effort'
export function useLeaderboard(mode) {
  const { data, loading, error, refresh } = useAsync(
    () => (unref(mode) === 'effort' ? fetchEffortLeaderboard() : fetchDistanceLeaderboard()),
    [() => unref(mode)],
  )
  return { rows: data, loading, error, refresh }
}
