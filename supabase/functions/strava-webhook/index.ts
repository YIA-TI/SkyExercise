// supabase/functions/strava-webhook/index.ts
// Webhook Strava (satu subscription untuk seluruh app):
//  - GET  → verifikasi subscription (echo hub.challenge)
//  - POST → catat event (idempotensi), ambil detail aktivitas, filter lari/gym, upsert.
import { admin, corsHeaders, ensureValidToken, json, TRACKED_SPORTS, toActivityRow } from '../_shared/strava.ts'

const VERIFY_TOKEN = Deno.env.get('STRAVA_WEBHOOK_VERIFY_TOKEN')

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // Verifikasi subscription
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return json({ 'hub.challenge': challenge })
    }
    return json({ error: 'verifikasi gagal' }, 403)
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method tidak didukung' }, 405)

  try {
    const event = await req.json()
    const db = admin()

    // Catat semua event (audit + idempotensi).
    await db.from('webhook_events').insert({
      object_type: event.object_type,
      object_id: event.object_id,
      aspect_type: event.aspect_type,
      owner_id: event.owner_id,
      event_time: event.event_time ? new Date(event.event_time * 1000).toISOString() : null,
    })

    if (event.object_type === 'activity') {
      if (event.aspect_type === 'create' || event.aspect_type === 'update') {
        await handleActivity(db, event.owner_id, event.object_id)
      } else if (event.aspect_type === 'delete') {
        await db.from('activities').delete().eq('activity_id', event.object_id)
        await db.from('webhook_events').update({ processed: true })
          .eq('object_id', event.object_id).eq('processed', false)
      }
    }

    return json({ ok: true })
  } catch (e) {
    // Balas 200 agar Strava tidak retry berlebihan; error tercatat di log fungsi.
    console.error('webhook error', e)
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 200)
  }
})

async function handleActivity(db: ReturnType<typeof admin>, ownerId: number, activityId: number) {
  const token = await ensureValidToken(db, ownerId)
  const res = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return
  const act = await res.json()
  const sport = act.sport_type ?? act.type
  if (!TRACKED_SPORTS.includes(sport)) return // abaikan selain lari/gym

  await db.from('activities').upsert(
    { ...toActivityRow(act), athlete_id: ownerId },
    { onConflict: 'activity_id' },
  )
  await db.from('webhook_events').update({ processed: true })
    .eq('object_id', activityId).eq('processed', false)
}
