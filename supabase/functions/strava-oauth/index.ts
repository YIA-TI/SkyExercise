// supabase/functions/strava-oauth/index.ts
// Callback OAuth Strava: tukar `code` → token, upsert profil + kredensial,
// provisi user Supabase untuk peserta, lalu kembalikan token magic-link agar FE
// bisa membangun sesi (sehingga auth.uid() untuk RLS berfungsi).
import { admin, corsHeaders, exchangeCode, json, REQUESTED_SCOPE } from '../_shared/strava.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { code } = await req.json()
    if (!code) return json({ error: 'Parameter `code` wajib' }, 400)

    const token = await exchangeCode(code)
    const a = token.athlete
    if (!a?.id) return json({ error: 'Respons Strava tanpa data athlete' }, 502)

    const db = admin()
    const email = `strava_${a.id}@skyexcercise.local`

    // 1. Pastikan user Supabase untuk atlet ini ada (buat bila belum).
    let userId: string | undefined
    const { data: created, error: cErr } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { athlete_id: a.id, firstname: a.firstname, lastname: a.lastname },
    })
    if (cErr) {
      // Kemungkinan sudah ada → cari user-nya.
      const { data: list } = await db.auth.admin.listUsers()
      userId = list.users.find((u) => u.email === email)?.id
    } else {
      userId = created.user?.id
    }
    if (!userId) throw new Error('Gagal memprovisi user Supabase untuk peserta')

    // 2. Upsert profil peserta (SummaryAthlete dari respons token).
    await db.from('athletes').upsert({
      athlete_id: a.id,
      username: a.username ?? null,
      firstname: a.firstname ?? null,
      lastname: a.lastname ?? null,
      sex: a.sex ?? null,
      city: a.city ?? null,
      country: a.country ?? null,
      weight: a.weight ?? null,
      profile_photo: a.profile ?? null,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })

    // 3. Upsert kredensial (RAHASIA — hanya tabel service-role).
    await db.from('strava_credentials').upsert({
      athlete_id: a.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: new Date(token.expires_at * 1000).toISOString(),
      scope: REQUESTED_SCOPE,
      updated_at: new Date().toISOString(),
    })

    // 4. Magic-link → token_hash untuk FE membangun sesi via verifyOtp.
    const { data: link, error: lErr } = await db.auth.admin.generateLink({ type: 'magiclink', email })
    if (lErr) throw lErr

    return json({
      athlete_id: a.id,
      email,
      token_hash: link.properties?.hashed_token,
    })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
