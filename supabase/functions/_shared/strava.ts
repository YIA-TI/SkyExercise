// supabase/functions/_shared/strava.ts
// Util bersama untuk semua Edge Function Strava: CORS, client admin,
// tukar/refresh token, dan penjamin token valid (lazy refresh + rotasi).
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Client service-role (bypass RLS) — hanya hidup di server Edge Function.
export function admin(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

const CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID')!
const CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET')!
const TOKEN_URL = 'https://www.strava.com/oauth/token'

// Scope yang diminta saat otorisasi (disimpan sebagai catatan; token exchange tak mengembalikannya).
export const REQUESTED_SCOPE = 'read,profile:read_all,activity:read_all'

export async function exchangeCode(code: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Strava token exchange gagal: ${res.status} ${await res.text()}`)
  return await res.json() // { access_token, refresh_token, expires_at, athlete, ... }
}

export async function refreshToken(refresh_token: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Strava token refresh gagal: ${res.status} ${await res.text()}`)
  return await res.json() // { access_token, refresh_token, expires_at }
}

// Kembalikan access_token yang pasti valid untuk seorang atlet.
// Refresh + simpan (termasuk refresh_token baru yang berotasi) bila hampir kedaluwarsa.
export async function ensureValidToken(db: SupabaseClient, athleteId: number): Promise<string> {
  const { data, error } = await db
    .from('strava_credentials')
    .select('*')
    .eq('athlete_id', athleteId)
    .single()
  if (error || !data) throw new Error(`Kredensial tak ditemukan untuk atlet ${athleteId}`)

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = Math.floor(new Date(data.expires_at).getTime() / 1000)
  if (expiresAt > now + 600) return data.access_token // masih valid > 10 menit

  const t = await refreshToken(data.refresh_token)
  await db
    .from('strava_credentials')
    .update({
      access_token: t.access_token,
      refresh_token: t.refresh_token, // simpan yang baru — refresh_token berotasi
      expires_at: new Date(t.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('athlete_id', athleteId)
  return t.access_token
}

// Sport type yang dipantau (lari + gym). Aktivitas lain diabaikan.
export const TRACKED_SPORTS = [
  'Run', 'TrailRun', 'VirtualRun',
  'WeightTraining', 'Workout', 'Crossfit',
]

// Bentuk baris `activities` dari objek aktivitas Strava (summary/detailed).
export function toActivityRow(act: Record<string, unknown>) {
  return {
    activity_id: act.id,
    athlete_id: (act.athlete as { id: number })?.id ?? act.athlete_id,
    name: act.name ?? null,
    sport_type: act.sport_type ?? act.type,
    start_date: act.start_date,
    distance: act.distance ?? null,
    moving_time: act.moving_time ?? null,
    elapsed_time: act.elapsed_time ?? null,
    average_speed: act.average_speed ?? null,
    total_elevation: act.total_elevation_gain ?? null,
    average_heartrate: act.average_heartrate ?? null,
    max_heartrate: act.max_heartrate ?? null,
    suffer_score: act.suffer_score ?? null,
    calories: act.calories ?? null, // hanya ada di detailed activity (jalur webhook)
    fetched_at: new Date().toISOString(),
  }
}
