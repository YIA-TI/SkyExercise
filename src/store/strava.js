// src/store/strava.js
// Status koneksi Strava (asli). Karena `strava_credentials` terkunci RLS (backend-only),
// status koneksi peserta diturunkan dari keberadaan athleteId + aktivitas terakhir yang readable.
import { reactive, readonly } from 'vue'
import { supabase } from '../lib/supabase.js'
import { authState } from './auth.js'

const state = reactive({
  connected: false,
  lastSynced: null,
  loading: false,
})

const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI
const SCOPE = 'read,profile:read_all,activity:read_all'

export function stravaAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID ?? '',
    redirect_uri: REDIRECT_URI ?? '',
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPE,
  })
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

// Redirect ke halaman otorisasi Strava (dipakai login peserta & tombol "Hubungkan").
export function connectStrava() {
  window.location.href = stravaAuthorizeUrl()
}

// Segarkan status koneksi dari data yang readable (aktivitas terakhir peserta).
export async function refreshStravaStatus() {
  if (!authState.athleteId) {
    state.connected = false
    state.lastSynced = null
    return
  }
  state.connected = true
  const { data } = await supabase
    .from('activities')
    .select('fetched_at')
    .eq('athlete_id', authState.athleteId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  state.lastSynced = data?.fetched_at ? formatWaktu(data.fetched_at) : 'Belum ada sinkron'
}

// Putuskan koneksi (via Edge Function service-role).
export async function disconnectStrava() {
  if (!authState.athleteId) return
  state.loading = true
  try {
    await supabase.functions.invoke('strava-disconnect', {
      body: { athlete_id: authState.athleteId },
    })
    state.connected = false
    state.lastSynced = null
  } finally {
    state.loading = false
  }
}

// Backfill/sinkron manual (tombol "Sinkronkan") — Edge Function menarik aktivitas terbaru.
export async function syncStrava() {
  if (!authState.athleteId) return
  state.loading = true
  try {
    await supabase.functions.invoke('strava-sync', {
      body: { athlete_id: authState.athleteId },
    })
    await refreshStravaStatus()
  } finally {
    state.loading = false
  }
}

function formatWaktu(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export const stravaState = readonly(state)
