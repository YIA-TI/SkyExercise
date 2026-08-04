// src/services/leaderboard.js
// Leaderboard via RPC security-definer (agregat lintas peserta, tetap hormati privasi RLS).
import { supabase } from '../lib/supabase.js'

function startOfMonthISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}
function daysAgoISO(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

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
