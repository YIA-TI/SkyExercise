// src/composables/useAdminData.js
// Hook data admin (butuh sesi admin; RLS is_admin()).
import { ref, unref, watch, onMounted } from 'vue'
import {
  fetchDivisionSummary,
  fetchRecentActivitiesAll,
  fetchParticipants,
  fetchParticipantDetail,
} from '../services/admin.js'

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

export function useAdminMonitoring() {
  const summary = useAsync(fetchDivisionSummary)
  const recent = useAsync(() => fetchRecentActivitiesAll(10))
  return {
    summary: summary.data,
    recent: recent.data,
    loading: summary.loading, // ringkas: pakai loading ringkasan
    error: summary.error,
    refresh: async () => { await Promise.all([summary.refresh(), recent.refresh()]) },
  }
}

export function useAdminParticipants() {
  const { data, loading, error, refresh } = useAsync(fetchParticipants)
  return { participants: data, loading, error, refresh }
}

export function useAdminParticipantDetail(athleteId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchParticipantDetail(unref(athleteId)),
    [() => unref(athleteId)],
  )
  return { detail: data, loading, error, refresh }
}
