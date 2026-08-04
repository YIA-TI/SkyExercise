// src/services/stats.js
// Ringkasan statistik Home peserta (jarak/HR/kalori/effort) — dihitung dari `activities`.
// Semua field diturunkan dari kolom nyata (lihat docs/database-schema.md) — tidak ada
// yang dikarang: tanpa best_efforts/splits_metric (tak disimpan), tanpa BMI/langkah/makro.
import { supabase } from '../lib/supabase.js'
import { isRun, kmFromMeters, speedToPace } from '../lib/normalize.js'

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// Zona intensitas kasar dari relative effort (suffer_score) — ambang bebas, bukan dari Strava.
function effortZone(total) {
  if (total >= 700) return 'Tinggi'
  if (total >= 300) return 'Sedang'
  return 'Rendah'
}

export async function fetchHomeStats(athleteId) {
  if (!athleteId) return null

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('start_date', { ascending: false })
    .limit(60)
  if (error) throw error

  const acts = data ?? []
  const weekSince = new Date(Date.now() - 7 * 86400000).toISOString()
  const todayStr = new Date().toISOString().slice(0, 10)

  const week = acts.filter((a) => a.start_date >= weekSince)
  const runs = acts.filter((a) => isRun(a.sport_type))
  const weekRuns = week.filter((a) => isRun(a.sport_type))
  const last = acts[0] ?? null
  const lastRun = runs[0] ?? null
  const today = acts.filter((a) => (a.start_date || '').slice(0, 10) === todayStr)

  const weekKm = weekRuns.reduce((s, a) => s + (a.distance || 0), 0) / 1000
  const maxRunKm = Math.max(1, ...weekRuns.map((a) => (a.distance || 0) / 1000))

  // Pace tercepat di antara lari terbaru (proxy "PR" — Strava best_efforts tak disimpan).
  const paces = runs.slice(0, 10).map((a) => a.average_speed).filter((s) => s > 0)
  const bestSpeed = paces.length ? Math.max(...paces) : null

  return {
    distance: {
      weekKm: weekKm.toFixed(1),
      runCount: weekRuns.length,
      pace: lastRun ? (speedToPace(lastRun.average_speed) ?? '—') : '—',
      bestPace: bestSpeed ? (speedToPace(bestSpeed) ?? '—') : '—',
      elevation: lastRun?.total_elevation != null ? Math.round(lastRun.total_elevation) : '—',
      // bar relatif terhadap lari terpanjang minggu ini (7 terbaru, urut lama→baru)
      bars: weekRuns.slice(0, 7).reverse().map((a) => Math.round(((a.distance || 0) / 1000 / maxRunKm) * 100)),
      recent: runs.slice(0, 4).map((a) => ({
        name: a.name || 'Lari',
        km: kmFromMeters(a.distance) ?? '—',
        pace: speedToPace(a.average_speed) ?? '—',
        avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : '—',
        date: formatTanggal(a.start_date),
      })),
    },
    heartRate: {
      avg: last?.average_heartrate ? Math.round(last.average_heartrate) : '—',
      max: last?.max_heartrate ? Math.round(last.max_heartrate) : '—',
      // rata-rata HR dari beberapa aktivitas terakhir yang punya data HR (bukan stream per-detik)
      bars: (() => {
        const withHr = acts.filter((a) => a.average_heartrate).slice(0, 8).reverse()
        const maxHr = Math.max(1, ...withHr.map((a) => a.average_heartrate))
        return withHr.map((a) => Math.round((a.average_heartrate / maxHr) * 100))
      })(),
    },
    calories: {
      today: today.reduce((s, a) => s + (a.calories || 0), 0),
      lastSession: last?.calories ?? '—',
      perActivity: today.map((a) => ({
        name: a.name || (isRun(a.sport_type) ? 'Lari' : 'Gym'),
        type: isRun(a.sport_type) ? 'Lari' : 'Gym',
        kcal: a.calories ?? '—',
      })),
    },
    effort: {
      last: last?.suffer_score ?? '—',
      weekTotal: week.reduce((s, a) => s + (a.suffer_score || 0), 0),
      zone: effortZone(week.reduce((s, a) => s + (a.suffer_score || 0), 0)),
      // total sesi (lari + gym) minggu ini — dipakai kartu "Total Sesi"
      weekSessions: week.length,
      // total suffer_score per hari, 7 hari terakhir (lama→baru), relatif thd hari tertinggi
      bars: dailyEffortBars(acts),
    },
  }
}

function dailyEffortBars(acts) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const totals = days.map((day) =>
    acts.filter((a) => (a.start_date || '').slice(0, 10) === day)
      .reduce((s, a) => s + (a.suffer_score || 0), 0),
  )
  const max = Math.max(1, ...totals)
  return totals.map((t) => Math.round((t / max) * 100))
}
