// src/composables/useAdminData.js
// Hook data admin (butuh sesi admin; RLS is_admin()).
import { ref, unref, watch, onMounted } from 'vue'
import {
  fetchDivisionSummary,
  fetchParticipants,
  fetchParticipantDetail,
} from '../services/admin.js'
import { fetchQuestSummary } from '../services/questSummary.js'

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

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminMonitoring(range = {}) {
  const { start, end } = range
  const summary = useAsync(
    () => fetchDivisionSummary({ start: unref(start), end: unref(end) }),
    [() => unref(start), () => unref(end)],
  )
  return {
    summary: summary.data,
    loading: summary.loading,
    error: summary.error,
    refresh: summary.refresh,
  }
}

export function useAdminParticipants() {
  const { data, loading, error, refresh } = useAsync(fetchParticipants)
  return { participants: data, loading, error, refresh }
}

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminParticipantDetail(athleteId, range = {}) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchParticipantDetail(unref(athleteId), { start: unref(start), end: unref(end) }),
    [() => unref(athleteId), () => unref(start), () => unref(end)],
  )
  return { detail: data, loading, error, refresh }
}

// range: { start, end } — ref/getter wajib 'YYYY-MM-DD' (dipakai hitung daftar minggu ISO).
export function useQuestSummary(range) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchQuestSummary(unref(start), unref(end)),
    [() => unref(start), () => unref(end)],
  )
  return { summary: data, loading, error, refresh }
}
