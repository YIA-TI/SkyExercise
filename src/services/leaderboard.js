// src/services/leaderboard.js
// Leaderboard via RPC security-definer (agregat lintas peserta, tetap hormati privasi RLS).
import { supabase } from '../lib/supabase.js'
import { startOfMonthISO, startOfWeekISO } from '../lib/normalize.js'

export async function fetchDistanceLeaderboard() {
  const { data, error } = await supabase.rpc('leaderboard_distance', {
    period_start: startOfMonthISO(),
  })
  if (error) throw error
  return (data ?? []).map((r) => ({
    athleteId: r.athlete_id,
    name: r.name,
    distanceKm: +(r.total / 1000).toFixed(1),
  }))
}

export async function fetchEffortLeaderboard() {
  const { data, error } = await supabase.rpc('leaderboard_effort', {
    period_start: startOfWeekISO(),
  })
  if (error) throw error
  return (data ?? []).map((r) => ({
    athleteId: r.athlete_id,
    name: r.name,
    effort: Number(r.total),
  }))
}

// Ranking XP ("Liga") — RPC baru & terpisah dari leaderboard_distance/effort di
// atas, jadi ikut balikin profile_photo langsung (dua RPC lama itu tidak).
// period: 'weekly' | 'monthly' (default) — dikirim ke RPC, reset otomatis
// mengikuti jendela waktu berjalan.
export async function fetchLeagueLeaderboard(period = 'monthly') {
  const { data, error } = await supabase.rpc('leaderboard_league', { p_period: period })
  if (error) throw error
  return (data ?? []).map((r) => ({
    athleteId: r.athlete_id,
    name: r.name,
    avatar: r.profile_photo,
    xp: Number(r.xp),
  }))
}

// Avatar seluruh roster — dipakai buat nge-merge foto profil ke leaderboard
// Jarak/Effort (RPC lama itu cuma balikin name+total, tanpa foto).
export async function fetchRosterAvatars() {
  const { data, error } = await supabase.rpc('roster_avatars')
  if (error) throw error
  return new Map((data ?? []).map((r) => [r.athlete_id, r.profile_photo]))
}
