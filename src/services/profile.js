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
