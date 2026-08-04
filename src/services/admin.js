// src/services/admin.js
// Layanan untuk admin (RLS: is_admin() → akses semua peserta).
import { supabase } from '../lib/supabase.js'
import { normalizeActivity } from '../lib/normalize.js'

const RUN = ['Run', 'TrailRun', 'VirtualRun']

function nameOf(a) {
  return `${a?.firstname ?? ''} ${a?.lastname ?? ''}`.trim()
}

export async function fetchDivisionSummary() {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

  const [{ count: totalMembers }, { count: sessionsToday }, { data: monthActs }] = await Promise.all([
    supabase.from('athletes').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }).gte('start_date', todayStart.toISOString()),
    supabase.from('activities').select('distance, sport_type').gte('start_date', monthStart.toISOString()),
  ])

  const distanceMonthKm = (monthActs ?? [])
    .filter((a) => RUN.includes(a.sport_type))
    .reduce((s, a) => s + (a.distance || 0), 0) / 1000

  return {
    totalMembers: totalMembers ?? 0,
    sessionsToday: sessionsToday ?? 0,
    distanceMonthKm: Math.round(distanceMonthKm),
  }
}

export async function fetchRecentActivitiesAll(limit = 10) {
  const { data, error } = await supabase
    .from('activities')
    .select('*, athletes(firstname, lastname)')
    .order('start_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map((row) => ({
    ...normalizeActivity(row),
    athleteName: nameOf(row.athletes),
  }))
}

export async function fetchParticipants() {
  const { data, error } = await supabase
    .from('athletes')
    .select('athlete_id, firstname, lastname, city, profile_photo')
    .order('firstname', { ascending: true })
  if (error) throw error
  return (data ?? []).map((a) => ({
    athleteId: a.athlete_id,
    name: nameOf(a),
    city: a.city,
    avatar: a.profile_photo,
  }))
}

export async function fetchParticipantDetail(athleteId) {
  const [{ data: prof }, { data: acts }] = await Promise.all([
    supabase.from('athletes').select('*').eq('athlete_id', athleteId).maybeSingle(),
    supabase.from('activities').select('*').eq('athlete_id', athleteId)
      .order('start_date', { ascending: false }).limit(30),
  ])
  return {
    profile: prof
      ? { athleteId: prof.athlete_id, name: nameOf(prof), city: prof.city, avatar: prof.profile_photo, weight: prof.weight }
      : null,
    activities: (acts ?? []).map(normalizeActivity),
  }
}
