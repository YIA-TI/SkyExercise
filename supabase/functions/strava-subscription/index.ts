// supabase/functions/strava-subscription/index.ts
// Setup/cek webhook push subscription Strava (satu untuk seluruh app) — supaya
// aktivitas atlet yang sudah connect otomatis masuk lewat strava-webhook secara
// real-time, tanpa perlu klik "Sinkronkan" manual. Strava cuma izinkan SATU
// subscription aktif per client_id:
//  - GET  → lihat subscription yang sedang aktif (kalau ada)
//  - POST → daftarkan baru (no-op kalau sudah ada satu yang aktif)
// Dipanggil manual sekali saat setup; aman dipanggil ulang kapan saja utk cek status.
import { corsHeaders, json } from '../_shared/strava.ts'

const CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID')!
const CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET')!
const VERIFY_TOKEN = Deno.env.get('STRAVA_WEBHOOK_VERIFY_TOKEN')!
const CALLBACK_URL = `${Deno.env.get('SUPABASE_URL')!}/functions/v1/strava-webhook`

async function currentSubscriptions() {
  const res = await fetch(
    `https://www.strava.com/api/v3/push_subscriptions?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  )
  const body = await res.json()
  return { ok: res.ok, status: res.status, body }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (req.method === 'GET') {
      const { body, status } = await currentSubscriptions()
      return json({ subscriptions: body, callback_url: CALLBACK_URL }, status)
    }

    if (req.method === 'POST') {
      const existing = await currentSubscriptions()
      if (Array.isArray(existing.body) && existing.body.length > 0) {
        return json({ ok: true, alreadyExists: true, subscriptions: existing.body })
      }

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        callback_url: CALLBACK_URL,
        verify_token: VERIFY_TOKEN,
      })
      const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'POST',
        body: params,
      })
      const body = await res.json()
      if (!res.ok) return json({ error: body }, res.status)
      return json({ ok: true, subscription: body })
    }

    return json({ error: 'method tidak didukung' }, 405)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
