// supabase/functions/strava-delete-data/index.ts
// Hapus SEMUA data seorang atlet (permintaan penghapusan dari peserta): deauthorize di
// Strava (best-effort), lalu hapus aktivitas, progres, klaim quest, achievement,
// kredensial, event webhook, profil, dan akun auth-nya. Hanya boleh dipanggil admin.
import { admin, corsHeaders, ensureValidToken, json } from '../_shared/strava.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const db = admin()

    // Otorisasi: pemanggil harus admin (baris di tabel `admins`, id = auth uid).
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: caller, error: callerErr } = await db.auth.getUser(jwt)
    if (callerErr || !caller.user) return json({ error: 'Tidak terautentikasi' }, 401)
    const { data: adminRow } = await db.from('admins').select('id').eq('id', caller.user.id).maybeSingle()
    if (!adminRow) return json({ error: 'Hanya admin yang boleh menghapus data atlet' }, 403)

    const { athlete_id } = await req.json()
    if (!athlete_id) return json({ error: 'Parameter `athlete_id` wajib' }, 400)

    // Deauthorize di Strava (abaikan bila token sudah tak valid / sudah dicabut).
    try {
      const accessToken = await ensureValidToken(db, athlete_id)
      await fetch('https://www.strava.com/oauth/deauthorize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch (_) {
      // token hilang/invalid — tetap lanjut hapus data lokal
    }

    const { data: athlete } = await db.from('athletes').select('user_id').eq('athlete_id', athlete_id).maybeSingle()

    // Urutan: tabel anak dulu, baru `athletes`.
    const steps: Array<[string, string]> = [
      ['activities', 'athlete_id'],
      ['quest_claims', 'athlete_id'],
      ['athlete_achievements', 'athlete_id'],
      ['athlete_progress', 'athlete_id'],
      ['strava_credentials', 'athlete_id'],
      ['webhook_events', 'owner_id'],
      ['athletes', 'athlete_id'],
    ]
    for (const [table, col] of steps) {
      const { error } = await db.from(table).delete().eq(col, athlete_id)
      if (error) throw new Error(`Gagal menghapus ${table}: ${error.message}`)
    }

    if (athlete?.user_id) {
      const { error } = await db.auth.admin.deleteUser(athlete.user_id)
      if (error) throw new Error(`Gagal menghapus akun auth: ${error.message}`)
    }

    return json({ ok: true })
  } catch (e) {
    console.error('[strava-delete-data] error:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
