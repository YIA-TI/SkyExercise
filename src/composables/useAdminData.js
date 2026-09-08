// src/composables/useAdminData.js
// Hook data admin (butuh sesi admin; RLS is_admin()).
import { unref } from 'vue'
import {
  fetchDivisionSummary,
  fetchParticipants,
  fetchParticipantDetail,
} from '../services/admin.js'
import { fetchQuestSummary } from '../services/questSummary.js'
import { useAsync } from './useAsync.js'

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminMonitoring(range = {}) {
  const { start, end } = range
  const summary = useAsync(
    () => fetchDivisionSummary({ start: unref(start), end: unref(end) }),
    [() => unref(start), () => unref(end)],
    ['athletes', 'activities'],
  )
  return {
    summary: summary.data,
    loading: summary.loading,
    error: summary.error,
    refresh: summary.refresh,
  }
}

export function useAdminParticipants() {
  const { data, loading, error, refresh } = useAsync(fetchParticipants, [], ['athletes'])
  return { participants: data, loading, error, refresh }
}

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminParticipantDetail(athleteId, range = {}) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchParticipantDetail(unref(athleteId), { start: unref(start), end: unref(end) }),
    [() => unref(athleteId), () => unref(start), () => unref(end)],
    ['athletes', 'activities'],
  )
  return { detail: data, loading, error, refresh }
}

// range: { start, end } — ref/getter wajib 'YYYY-MM-DD' (dipakai hitung daftar minggu ISO).
export function useQuestSummary(range) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchQuestSummary(unref(start), unref(end)),
    [() => unref(start), () => unref(end)],
    ['athletes', 'activities', 'quests', 'quest_claims'],
  )
  return { summary: data, loading, error, refresh }
}
