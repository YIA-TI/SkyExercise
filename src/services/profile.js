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

// Registrasi sekali-isi setelah koneksi Strava pertama (nama, tgl lahir, status
// pegawai, kompetensi, bukti sertifikat opsional). Kalau ada file, upload dulu
// ke bucket privat 'sertifikat' (folder = user_id, dijaga RLS), baru simpan
// path-nya lewat RPC.
export async function submitRegistration({ firstname, lastname, birthDate, employmentStatus, competency, certificateFile }) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Sesi tidak ditemukan, silakan masuk ulang')

  let path = null
  if (certificateFile) {
    const ext = certificateFile.name.split('.').pop()
    path = `${user.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('sertifikat').upload(path, certificateFile, { upsert: true })
    if (upErr) throw upErr
  }

  const { error } = await supabase.rpc('update_my_registration', {
    p_firstname: firstname,
    p_lastname: lastname,
    p_birth_date: birthDate,
    p_employment_status: employmentStatus,
    p_competency: competency,
    p_certificate_path: path,
  })
  if (error) throw error
}
