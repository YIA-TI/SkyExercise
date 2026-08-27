// supabase/functions/strava-sync-all/index.ts
// Sinkron semua atlet yang terhubung Strava — dipicu periodik oleh pg_cron (lihat
// migrasi strava_cron_sync), sampai webhook push subscription bisa dipakai (app
// masih menunggu review Strava). Inkremental: cuma tarik aktivitas sejak `after`
// (default 6 jam terakhir) supaya tidak backfill penuh tiap kali jalan.
// Dilindungi header x-cron-secret, diverifikasi via RPC verify_strava_cron_secret()
// terhadap nilai di Vault (bukan Deno.env — jadi tak ada secret statis yang perlu
// disimpan/di-rotate manual di sisi Edge Function).
import { admin, corsHeaders, json, syncAthleteActivities } from '../_shared/strava.ts'

const DEFAULT_LOOKBACK_SEC = 6 * 3600

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const db = admin()
  const secret = req.headers.get('x-cron-secret') ?? ''
  const { data: verified, error: verifyErr } = await db.rpc('verify_strava_cron_secret', { p_secret: secret })
  if (verifyErr || !verified) return json({ error: 'unauthorized' }, 401)

  try {
    const { data: creds, error } = await db.from('strava_credentials').select('athlete_id')
    if (error) throw error

    const after = Math.floor(Date.now() / 1000) - DEFAULT_LOOKBACK_SEC
    const results = []
    for (const c of creds ?? []) {
      try {
        const r = await syncAthleteActivities(db, c.athlete_id, after)
        results.push({ athlete_id: c.athlete_id, ...r })
      } catch (e) {
        console.error(`[strava-sync-all] gagal athlete_id=${c.athlete_id}:`, e)
        results.push({ athlete_id: c.athlete_id, error: e instanceof Error ? e.message : String(e) })
      }
    }

    console.log(`[strava-sync-all] selesai: ${results.length} atlet diproses`)
    return json({ athletes: results.length, results })
  } catch (e) {
    console.error('[strava-sync-all] error:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
