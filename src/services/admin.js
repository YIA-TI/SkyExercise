// src/services/admin.js
// Layanan untuk admin (RLS: is_admin() → akses semua peserta).
import { supabase } from '../lib/supabase.js'
import { normalizeActivity, daysAgoDateStr, toDateStr, dateStrStartISO, dateStrEndISO } from '../lib/normalize.js'

// Rentang tanggal default kalau admin belum memilih filter — 1 bulan terakhir.
function resolveRange({ start, end } = {}) {
  return {
    startISO: dateStrStartISO(start || daysAgoDateStr(30)),
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

// Tarik ulang riwayat lari/gym seorang atlet langsung dari Strava (Edge Function
// `strava-sync`, pakai kredensial atlet tsb yang tersimpan) — dipanggil admin saat
// data lokal (`activities`) kosong/belum lengkap. Gagal kalau atlet belum pernah
// menghubungkan akun Strava-nya.
export async function syncParticipantStrava(athleteId) {
  const { data, error } = await supabase.functions.invoke('strava-sync', {
    body: { athlete_id: athleteId },
  })
  if (error) throw new Error(await extractFunctionErrorMessage(error))
  if (data?.error) throw new Error(data.error)
  return data // { synced, seen, pages }
}

// supabase-js cuma kasih pesan generik ("Edge Function returned a non-2xx status
// code") di `error.message` — alasan aslinya (yang dikirim balik Edge Function,
// mis. "Kredensial tak ditemukan untuk atlet X") ada di body response, dibaca lewat
// `error.context` (instance Response, khusus utk FunctionsHttpError).
async function extractFunctionErrorMessage(error) {
  try {
    const body = await error.context?.json?.()
    if (body?.error) return body.error
  } catch {
    // context bukan JSON / sudah kebaca — pakai fallback di bawah
  }
  return error.message || 'Gagal memanggil Edge Function'
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
