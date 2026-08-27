// supabase/functions/strava-sync/index.ts
// Backfill / sinkron aktivitas seorang atlet: menarik SEMUA riwayat (paginasi) atau
// hanya yang baru (pakai `after`), filter lari/gym, upsert. Dipakai:
//  - otomatis sekali setelah connect (full backfill, tanpa `after`)
//  - tombol "Sinkronkan" manual di Home
//  - admin: tarik data atlet lain saat data lokal kosong/belum lengkap
import { admin, corsHeaders, json, syncAthleteActivities } from '../_shared/strava.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { athlete_id, after } = await req.json()
    if (!athlete_id) return json({ error: '`athlete_id` wajib' }, 400)
    console.log(`[strava-sync] mulai untuk athlete_id=${athlete_id} after=${after ?? '-'}`)

    const db = admin()
    const result = await syncAthleteActivities(db, athlete_id, after)

    console.log(`[strava-sync] selesai: dilihat=${result.seen} disimpan=${result.synced} halaman=${result.pages}`)
    return json(result)
  } catch (e) {
    console.error('[strava-sync] error:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
