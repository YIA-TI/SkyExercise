// src/store/stats.js
// Skeleton/fallback (mock) — ditampilkan sesaat sebelum data nyata dari Supabase masuk
// (lihat services/stats.js: fetchHomeStats). Bentuknya HARUS sama persis dengan hasil
// nyata agar template aman dipakai selagi loading. Acuan field: docs/strava-data-fields.md
//   ❌ dibuang: langkah, BMI, makro kalori, resting/live HR, set/reps/beban gym, split per-km
//               (Strava splits_metric/streams tidak disimpan — lihat database-schema.md).
//   ✅ dipakai: jarak, durasi, pace, avg/max HR, elevasi, kalori, pace tercepat (proxy),
//               relative effort (suffer score), total lari/sesi.

export const distance = {
  weekKm: '0.0',
  runCount: 0,
  pace: '—',
  bestPace: '—',
  elevation: '—',
  bars: [0, 0, 0, 0, 0, 0, 0],
  recent: [],
}

export const heartRate = {
  avg: '—',
  max: '—',
  bars: [],
}

export const calories = {
  today: 0,
  lastSession: '—',
  perActivity: [],
}

export const effort = {
  last: '—',
  weekTotal: 0,
  zone: '—',
  weekSessions: 0,
  bars: [0, 0, 0, 0, 0, 0, 0],
}
