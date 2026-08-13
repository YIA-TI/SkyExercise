// supabase/functions/strava-sync/index.ts
// Backfill / sinkron aktivitas seorang atlet: menarik SEMUA riwayat (paginasi) atau
// hanya yang baru (pakai `after`), filter lari/gym, upsert. Dipakai:
//  - otomatis sekali setelah connect (full backfill, tanpa `after`)
//  - tombol "Sinkronkan" manual di Home
import { admin, corsHeaders, ensureValidToken, json, TRACKED_SPORTS, toActivityRow } from '../_shared/strava.ts'

const PER_PAGE = 100
const MAX_PAGES = 10 // batas aman: hingga 1000 aktivitas per sinkron, cukup untuk riwayat penuh

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { athlete_id, after } = await req.json()
    if (!athlete_id) return json({ error: '`athlete_id` wajib' }, 400)
    console.log(`[strava-sync] mulai untuk athlete_id=${athlete_id} after=${after ?? '-'}`)

    const db = admin()
    const token = await ensureValidToken(db, athlete_id)

    let totalSynced = 0
    let totalSeen = 0
    let page = 1

    while (page <= MAX_PAGES) {
      const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page) })
      if (after) params.set('after', String(after)) // epoch detik; opsional (sinkron inkremental)

      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) {
        const body = await res.text()
        console.error(`[strava-sync] Strava API gagal: ${res.status} ${body}`)
        return json({ error: `Strava activities gagal: ${res.status} ${body}`, synced: totalSynced }, 502)
      }

      const acts = (await res.json()) as Array<Record<string, unknown>>
      if (!acts.length) break // habis, tak ada halaman berikutnya
      totalSeen += acts.length

      const rows = acts
        .filter((a) => TRACKED_SPORTS.includes((a.sport_type ?? a.type) as string))
        .map((a) => ({ ...toActivityRow(a), athlete_id }))

      if (rows.length) {
        const { error: upErr } = await db.from('activities').upsert(rows, { onConflict: 'activity_id' })
        if (upErr) console.error('[strava-sync] upsert gagal:', upErr.message)
        else totalSynced += rows.length
      }

      if (acts.length < PER_PAGE) break // halaman terakhir
      page += 1
    }

    console.log(`[strava-sync] selesai: dilihat=${totalSeen} disimpan=${totalSynced} halaman=${page}`)
    return json({ synced: totalSynced, seen: totalSeen, pages: page })
  } catch (e) {
    console.error('[strava-sync] error:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
