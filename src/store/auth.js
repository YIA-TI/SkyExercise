// src/store/auth.js
// State autentikasi asli berbasis Supabase Auth.
// - Admin  → login email/password (tabel `admins`).
// - Peserta → login via Strava OAuth (user diprovisi Edge Function `strava-oauth`).
// Bentuk `authState` dipertahankan (isLoggedIn/userRole/userName/userEmail) agar
// komponen lama minim perubahan; ditambah athleteId & userId.
import { reactive, readonly } from 'vue'
import { supabase } from '../lib/supabase.js'

// Notif update BMI muncul tiap hari Minggu (bukan rolling N-hari) — selama belum
// ada update berat badan sejak awal hari Minggu ybs.
function isSunday() {
  return new Date().getDay() === 0
}
function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const state = reactive({
  isLoggedIn: false,
  userRole: null, // 'admin' | 'anggota' | null
  userName: '',
  userEmail: '',
  athleteId: null,
  userId: null,
  loading: true,
  needsBodyMetrics: false,  // peserta belum isi weight/height sama sekali
  needsWeightReminder: false, // sudah isi, tapi belum update lagi & hari ini Minggu
})

// Tentukan peran + profil dari sesi Supabase.
async function resolveRole(session) {
  const uid = session.user.id
  state.userId = uid

  // Admin?
  const { data: adminRow } = await supabase
    .from('admins')
    .select('full_name, email')
    .eq('id', uid)
    .maybeSingle()

  if (adminRow) {
    state.userRole = 'admin'
    state.userName = adminRow.full_name || session.user.email || ''
    state.userEmail = adminRow.email || session.user.email || ''
    state.athleteId = null
    state.isLoggedIn = true
    state.needsBodyMetrics = false
    state.needsWeightReminder = false
    return
  }

  // Peserta: cari atlet yang tertaut ke user ini.
  const { data: ath } = await supabase
    .from('athletes')
    .select('athlete_id, firstname, lastname, weight, height, weight_updated_at')
    .eq('user_id', uid)
    .maybeSingle()

  state.userRole = 'anggota'
  state.athleteId = ath?.athlete_id ?? null
  state.userName = ath ? `${ath.firstname ?? ''} ${ath.lastname ?? ''}`.trim() : (session.user.email || '')
  state.userEmail = session.user.email || ''
  state.isLoggedIn = true
  state.needsBodyMetrics = !ath?.weight || !ath?.height
  state.needsWeightReminder = !state.needsBodyMetrics && isSunday() && (
    !ath.weight_updated_at ||
    new Date(ath.weight_updated_at).getTime() < startOfToday()
  )

  // Segarkan status koneksi Strava (dynamic import agar tak ada siklus di top-level).
  import('./strava.js').then((m) => m.refreshStravaStatus()).catch(() => {})
}

async function applySession(session) {
  if (session?.user) {
    await resolveRole(session)
  } else {
    state.isLoggedIn = false
    state.userRole = null
    state.userName = ''
    state.userEmail = ''
    state.athleteId = null
    state.userId = null
    state.needsBodyMetrics = false
    state.needsWeightReminder = false
  }
}

// Baca ulang sesi saat ini (dipakai callback OAuth & bootstrap).
export async function reloadAuth() {
  const { data } = await supabase.auth.getSession()
  await applySession(data.session)
}

let initialized = false
export async function initAuth() {
  if (initialized) return
  initialized = true
  await reloadAuth()
  state.loading = false
  supabase.auth.onAuthStateChange((_event, session) => { applySession(session) })
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await applySession(data.session)
  return state.userRole
}

export async function signOut() {
  await supabase.auth.signOut()
  await applySession(null)
}

// Alias kompatibilitas untuk komponen lama.
export { signOut as logout }

export const authState = readonly(state)
