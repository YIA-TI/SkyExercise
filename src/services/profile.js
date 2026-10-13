// src/services/profile.js
import { supabase } from '../lib/supabase.js'
import { normalizeProfile } from '../lib/normalize.js'

export async function fetchProfile(athleteId) {
  if (!athleteId) return null
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('athlete_id', athleteId)
    .maybeSingle()
  if (error) throw error
  return data ? normalizeProfile(data) : null
}

// Peserta mencatat pilihan ikut/tidak ikut leaderboard (consent eksplisit, RPC security-definer).
export async function setLeaderboardOptIn(optIn) {
  const { error } = await supabase.rpc('set_leaderboard_opt_in', { p_opt_in: !!optIn })
  if (error) throw error
}

// Peserta memperbarui berat/tinggi sendiri lewat RPC security-definer.
export async function updateBodyMetrics(weightKg, heightCm) {
  const { error } = await supabase.rpc('update_my_body_metrics', {
    p_weight: weightKg,
    p_height: heightCm,
  })
  if (error) throw error
}
