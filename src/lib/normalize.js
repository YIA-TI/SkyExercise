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

// Menit (bilangan) → label manusiawi, sudah termasuk satuannya — "45 mnt" di
// bawah 60 menit, naik jadi "1 jam" / "1 jam 15 mnt" begitu genap 60+ menit.
export function minutesLabel(totalMin) {
  if (totalMin == null) return null
  const m = Math.round(totalMin)
  if (m < 60) return `${m} mnt`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest === 0 ? `${h} jam` : `${h} jam ${rest} mnt`
}

// detik → label durasi manusiawi (lihat minutesLabel).
export function durationLabel(sec) {
  if (sec == null) return null
  return minutesLabel(sec / 60)
}

export function fullName(row) {
  return `${row.firstname ?? ''} ${row.lastname ?? ''}`.trim()
}

// ISO timestamp N hari ke belakang dari sekarang — dipakai untuk membatasi
// query aktivitas ke jendela waktu tertentu (mis. 7 hari terakhir).
export function daysAgoISO(n) {
  return new Date(Date.now() - n * 86400000).toISOString()
}

// Date → Senin minggu ini jam 00:00 lokal — awal window "minggu ini" (Senin-Minggu).
export function startOfWeek(d = new Date()) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Senin = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

// ISO timestamp Senin minggu ini jam 00:00 lokal — dipakai membatasi query
// "minggu ini" (Senin-Minggu), gantikan jendela rolling 7 hari (daysAgoISO(7)).
export function startOfWeekISO() {
  return startOfWeek().toISOString()
}

// ISO timestamp awal bulan berjalan (waktu lokal) — dipakai untuk membatasi
// query aktivitas ke bulan berjalan.
export function startOfMonthISO() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

// Date → "YYYY-MM-DD" (waktu lokal) — dipakai sebagai value <input type="date">.
export function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// "YYYY-MM-DD" N hari ke belakang dari hari ini — default filter tanggal admin.
export function daysAgoDateStr(n) {
  return toDateStr(new Date(Date.now() - n * 86400000))
}

// "YYYY-MM-DD" → ISO timestamp awal hari (00:00:00 lokal) — batas bawah query.
export function dateStrStartISO(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}

// "YYYY-MM-DD" → ISO timestamp akhir hari (23:59:59.999 lokal) — batas atas query.
export function dateStrEndISO(dateStr) {
  return new Date(`${dateStr}T23:59:59.999`).toISOString()
}

// ISO timestamp → "3 Agu, 06:15" (tanggal + jam lokal, dipakai di daftar aktivitas).
export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const jam = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${tanggal}, ${jam}`
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
    height: row.height,
    weightUpdatedAt: row.weight_updated_at,
    avatar: row.profile_photo,
  }
}

// BMI dari berat (kg) & tinggi (cm) — rentang standar WHO dewasa.
export function calcBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return +(weightKg / (heightM * heightM)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Kurus'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Gemuk'
  return 'Obesitas'
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
