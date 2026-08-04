// src/lib/normalize.js
// Fungsi murni: ubah baris Supabase (mentah, metrik) → bentuk siap-tampil FE.
// Acuan kontrak: docs/strava-data-fields.md

const RUN_SPORTS = ['Run', 'TrailRun', 'VirtualRun']

export function isRun(sport) {
  return RUN_SPORTS.includes(sport)
}

export function kmFromMeters(m) {
  if (m == null) return null
  return +(m / 1000).toFixed(2)
}

// m/s → pace "menit:detik" per km.
export function speedToPace(mps) {
  if (!mps || mps <= 0) return null
  const minPerKm = 1000 / mps / 60
  const min = Math.floor(minPerKm)
  const sec = Math.round((minPerKm - min) * 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function speedKmh(mps) {
  if (!mps || mps <= 0) return null
  return +(mps * 3.6).toFixed(1)
}

// detik → "M:SS" (menit total bisa > 59, mis. 75:10).
export function durationLabel(sec) {
  if (sec == null) return null
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function fullName(row) {
  return `${row.firstname ?? ''} ${row.lastname ?? ''}`.trim()
}

export function normalizeProfile(row) {
  return {
    athleteId: row.athlete_id,
    name: fullName(row) || row.username || '',
    username: row.username,
    sex: row.sex,
    city: row.city,
    country: row.country,
    weight: row.weight,
    avatar: row.profile_photo,
  }
}

export function normalizeActivity(row) {
  const run = isRun(row.sport_type)
  return {
    activityId: row.activity_id,
    athleteId: row.athlete_id,
    type: run ? 'run' : 'gym',
    sportType: row.sport_type,
    name: row.name,
    startDate: row.start_date,
    distanceKm: run ? kmFromMeters(row.distance) : null,
    movingTimeSec: row.moving_time,
    durationLabel: durationLabel(row.moving_time ?? row.elapsed_time),
    pacePerKm: run ? speedToPace(row.average_speed) : null,
    speedKmh: run ? speedKmh(row.average_speed) : null,
    avgHeartrate: row.average_heartrate,
    maxHeartrate: row.max_heartrate,
    elevationGain: run ? row.total_elevation : null,
    calories: row.calories,
    sufferScore: row.suffer_score,
  }
}
