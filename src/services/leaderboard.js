// src/services/leaderboard.js
// Leaderboard via RPC security-definer (agregat lintas peserta, tetap hormati privasi RLS).
import { supabase } from '../lib/supabase.js'
import { startOfMonthISO, daysAgoISO } from '../lib/normalize.js'

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
    period_start: daysAgoISO(7),
  })
  if (error) throw error
  return (data ?? []).map((r) => ({
    athleteId: r.athlete_id,
    name: r.name,
    effort: Number(r.total),
  }))
}
