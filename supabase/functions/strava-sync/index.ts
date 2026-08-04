// supabase/functions/strava-sync/index.ts
// Backfill / sinkron manual (tombol "Sinkronkan"): tarik aktivitas terbaru seorang atlet,
// filter lari/gym, upsert. Dipakai untuk mengisi data awal setelah connect.
import { admin, corsHeaders, ensureValidToken, json, TRACKED_SPORTS, toActivityRow } from '../_shared/strava.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { athlete_id, after } = await req.json()
    if (!athlete_id) return json({ error: '`athlete_id` wajib' }, 400)

    const db = admin()
    const token = await ensureValidToken(db, athlete_id)

    const params = new URLSearchParams({ per_page: '50' })
    if (after) params.set('after', String(after)) // epoch detik; opsional

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return json({ error: `Strava activities gagal: ${res.status}` }, 502)

    const acts = await res.json()
    const rows = (acts as Array<Record<string, unknown>>)
      .filter((a) => TRACKED_SPORTS.includes((a.sport_type ?? a.type) as string))
      .map((a) => ({ ...toActivityRow(a), athlete_id }))

    if (rows.length) {
      await db.from('activities').upsert(rows, { onConflict: 'activity_id' })
    }
    return json({ synced: rows.length })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
