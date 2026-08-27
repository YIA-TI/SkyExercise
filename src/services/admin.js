// src/services/admin.js
// Layanan untuk admin (RLS: is_admin() → akses semua peserta).
import { supabase } from '../lib/supabase.js'
import { normalizeActivity, daysAgoDateStr, toDateStr, dateStrStartISO, dateStrEndISO } from '../lib/normalize.js'

// Rentang tanggal default kalau admin belum memilih filter — 7 hari terakhir.
function resolveRange({ start, end } = {}) {
  return {
    startISO: dateStrStartISO(start || daysAgoDateStr(7)),
    endISO: dateStrEndISO(end || toDateStr(new Date())),
  }
}

function nameOf(a) {
  return `${a?.firstname ?? ''} ${a?.lastname ?? ''}`.trim()
}

// Ringkasan dihitung untuk periode terpilih (default 7 hari terakhir) — bukan
// patokan waktu tetap ("hari ini"/"bulan ini"), supaya angkanya selalu sesuai
// filter yang dipilih admin.
export async function fetchDivisionSummary(range = {}) {
  const { startISO, endISO } = resolveRange(range)

  const [{ count: totalMembers }, { count: totalSessions }] = await Promise.all([
    supabase.from('athletes').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true })
      .gte('start_date', startISO).lte('start_date', endISO),
  ])

  return {
    totalMembers: totalMembers ?? 0,
    totalSessions: totalSessions ?? 0,
  }
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

export async function fetchParticipantDetail(athleteId, range) {
  const { startISO, endISO } = resolveRange(range)
  const [{ data: prof }, { data: acts }] = await Promise.all([
    supabase.from('athletes').select('*').eq('athlete_id', athleteId).maybeSingle(),
    // Akses histori penuh dalam rentang filter (default 7 hari terakhir).
    supabase.from('activities').select('*').eq('athlete_id', athleteId)
      .gte('start_date', startISO)
      .lte('start_date', endISO)
      .order('start_date', { ascending: false }).limit(1000),
  ])
  return {
    profile: prof
      ? { athleteId: prof.athlete_id, name: nameOf(prof), city: prof.city, avatar: prof.profile_photo, weight: prof.weight, height: prof.height }
      : null,
    activities: (acts ?? []).map(normalizeActivity),
  }
}
