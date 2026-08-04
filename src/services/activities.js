// src/services/activities.js
import { supabase } from '../lib/supabase.js'
import { normalizeActivity } from '../lib/normalize.js'

const RUN = ['Run', 'TrailRun', 'VirtualRun']
const GYM = ['WeightTraining', 'Workout', 'Crossfit']

// filter: 'Semua' | 'Lari' | 'Gym'
export async function fetchActivities({ athleteId, filter = 'Semua', limit = 50 }) {
  if (!athleteId) return []
  let q = supabase
    .from('activities')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (filter === 'Lari') q = q.in('sport_type', RUN)
  else if (filter === 'Gym') q = q.in('sport_type', GYM)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(normalizeActivity)
}

export async function fetchActivityDetail(activityId) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('activity_id', activityId)
    .maybeSingle()
  if (error) throw error
  return data ? normalizeActivity(data) : null
}
