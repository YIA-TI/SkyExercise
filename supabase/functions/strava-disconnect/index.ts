// supabase/functions/strava-disconnect/index.ts
// Putuskan koneksi Strava: deauthorize di Strava (best-effort) lalu hapus kredensial.
// Profil (athletes) dibiarkan agar histori aktivitas tetap ada; hubungkan ulang = OAuth lagi.
import { admin, corsHeaders, ensureValidToken, json } from '../_shared/strava.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { athlete_id } = await req.json()
    if (!athlete_id) return json({ error: 'Parameter `athlete_id` wajib' }, 400)

    const db = admin()

    // Deauthorize di Strava (abaikan bila token sudah tak valid).
    try {
      const accessToken = await ensureValidToken(db, athlete_id)
      await fetch('https://www.strava.com/oauth/deauthorize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch (_) {
      // token hilang/invalid — tetap lanjut hapus kredensial lokal
    }

    await db.from('strava_credentials').delete().eq('athlete_id', athlete_id)
    return json({ ok: true })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
