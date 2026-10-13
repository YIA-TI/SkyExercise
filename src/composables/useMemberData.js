// src/composables/useMemberData.js
// Hook data peserta — bungkus service jadi reaktif { data, loading, error, refresh }.
import { unref } from 'vue'
import { authState } from '../store/auth.js'
import { fetchProfile } from '../services/profile.js'
import { fetchHomeStats } from '../services/stats.js'
import { fetchActivities, fetchActivityDetail } from '../services/activities.js'
import { fetchMyStanding, fetchMemberLeaderboard, fetchAdminLeaderboard } from '../services/leaderboard.js'
import { tierForRank } from '../lib/leagueTier.js'
import { fetchMyAchievements, checkAchievements } from '../services/achievements.js'
import { useAsync } from './useAsync.js'

export function useProfile(athleteId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchProfile(unref(athleteId) ?? authState.athleteId),
    [],
    ['athletes'],
  )
  return { profile: data, loading, error, refresh }
}

export function useHomeStats() {
  const { data, loading, error, refresh } = useAsync(
    () => fetchHomeStats(authState.athleteId),
    [],
    ['activities'],
  )
  return { stats: data, loading, error, refresh }
}

// filter: ref/getter → 'Semua' | 'Lari' | 'Gym'
export function useActivities(filter) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivities({ athleteId: authState.athleteId, filter: unref(filter) ?? 'Semua' }),
    [() => unref(filter)],
    ['activities'],
  )
  return { activities: data, loading, error, refresh }
}

export function useActivityDetail(activityId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivityDetail(unref(activityId)),
    [() => unref(activityId)],
    ['activities'],
  )
  return { activity: data, loading, error, refresh }
}

// Posisi MILIK SENDIRI di leaderboard — data peserta lain tidak pernah dikirim ke klien.
// mode: ref/getter → 'running' | 'effort' | 'league'. Hasil: { rank, total, value } | null
export function useMyStanding(mode, leaguePeriod) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchMyStanding(unref(mode), unref(leaguePeriod) || 'weekly'),
    [() => unref(mode), () => unref(leaguePeriod)],
    ['activities', 'athlete_progress'],
  )
  return { standing: data, loading, error, refresh }
}

// Daftar peringkat untuk anggota yang ikut leaderboard (opt-in). Kalau belum ikut, tidak
// ada request sama sekali (hasil []), dan server pun menolak mengembalikan data.
export function useMemberLeaderboard(mode, leaguePeriod, joined) {
  const { data, loading, error, refresh } = useAsync(async () => {
    if (!unref(joined)) return []
    const m = unref(mode)
    const rows = await fetchMemberLeaderboard(m, unref(leaguePeriod) || 'weekly')
    if (m !== 'league') return rows
    // Tier liga dihitung dari posisi asli di antara seluruh anggota (rank bisa berlubang).
    const total = Math.max(0, ...rows.map((r) => r.rank))
    return rows.map((r) => ({ ...r, tier: tierForRank(r.rank, total) }))
  }, [() => unref(mode), () => unref(leaguePeriod), () => unref(joined)], ['activities', 'athlete_progress'])
  return { rows: data, loading, error, refresh }
}

// Daftar peringkat lengkap — HANYA untuk admin (RPC admin_leaderboard dijaga is_admin()).
export function useAdminLeaderboard(mode, leaguePeriod) {
  const { data, loading, error, refresh } = useAsync(async () => {
    const m = unref(mode)
    const rows = await fetchAdminLeaderboard(m, unref(leaguePeriod) || 'weekly')
    if (m !== 'league') return rows
    return rows.map((r, i) => ({ ...r, rank: i + 1, tier: tierForRank(i + 1, rows.length) }))
  }, [() => unref(mode), () => unref(leaguePeriod)], ['activities', 'athlete_progress'])
  return { rows: data, loading, error, refresh }
}

// Katalog 12 achievement + status unlock milik atlet yang login.
export function useAchievements() {
  const { data, loading, error, refresh } = useAsync(fetchMyAchievements, [], ['athlete_achievements'])
  return { achievements: data, loading, error, refresh }
}

// Evaluasi ulang kriteria (RPC) — dipanggil imperatif (mis. saat Home dimuat),
// balikannya cuma achievement yang BARU unlock, dipakai utk toast perayaan.
export { checkAchievements }
