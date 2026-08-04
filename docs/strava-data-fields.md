# Panduan Data Strava — Lari, Gym, Profil (untuk FE)

Referensi field yang **bisa** dan **tidak bisa** diambil dari Strava API, difokuskan ke
**lari, gym, dan profil**. Bagian akhir berisi **bentuk payload JSON** yang akan FE terima dari
backend kita (sudah dinormalisasi dari Supabase + field turunan).

> Satuan Strava selalu **metrik**: jarak = meter, kecepatan = m/s, waktu = detik — apa pun
> preferensi user. Konversi (km, pace, menit) dilakukan di FE atau backend.

---

## 1. PROFIL (athlete)

Sumber: objek `athlete` di respons OAuth (**SummaryAthlete**, gratis saat connect) dan
`GET /athlete` (**DetailedAthlete**).

| Field | Tipe | Ketersediaan | Catatan |
|---|---|---|---|
| `id` | number | ✅ | ID atlet Strava (identitas utama) |
| `username` | string | ✅ | bisa `null` |
| `firstname` | string | ✅ | |
| `lastname` | string | ✅ | |
| `sex` | string | ✅ | `'M'` / `'F'` |
| `city` / `country` | string | ✅ | bisa kosong bila privat |
| `weight` | number | ✅ | kg |
| `profile` | string (URL) | ✅ | avatar 124×124 |
| `profile_medium` | string (URL) | ✅ | avatar 62×62 |
| `premium` / `summit` | boolean | ✅ | status langganan |
| `created_at` | string (ISO) | ✅ | tanggal join Strava |

**❌ TIDAK tersedia dari Strava (penting):**
- **Tinggi badan** → jadi **BMI tidak bisa dihitung** dari Strava. Butuh input manual.
- Umur / tanggal lahir.
- Langkah harian / resting heart rate (bukan domain Strava — itu dari Garmin/Fitbit/Apple Health).

---

## 2. LARI (activity: `Run`, `TrailRun`, `VirtualRun`)

Ada 3 tingkat kedalaman data.

### 2a. Ringkasan — `GET /athlete/activities` (SummaryActivity)
Ini yang paling murah & jadi sumber utama tabel `activities` kita.

| Field | Tipe | Satuan | Catatan |
|---|---|---|---|
| `id` | number | — | ID aktivitas |
| `name` | string | — | judul (mis. "Morning Run") |
| `sport_type` | string | — | `Run` / `TrailRun` / `VirtualRun` |
| `distance` | number | meter | |
| `moving_time` | number | detik | waktu bergerak |
| `elapsed_time` | number | detik | total termasuk berhenti |
| `total_elevation_gain` | number | meter | |
| `start_date` | string | ISO UTC | untuk urutan |
| `start_date_local` | string | ISO | waktu lokal atlet |
| `average_speed` | number | m/s | → pace = `1000/average_speed/60` mnt/km |
| `max_speed` | number | m/s | |
| `average_heartrate` | number | bpm | bila pakai HR strap |
| `max_heartrate` | number | bpm | |
| `has_heartrate` | boolean | — | penanda ada data HR |
| `average_cadence` | number | — | langkah/menit (per kaki ×2 = kadens lari) |
| `suffer_score` | number | — | "Relative Effort" (butuh HR) |
| `workout_type` | number | — | 0 biasa, 1 race, 2 long run, 3 workout |
| `map.summary_polyline` | string | — | rute GPS ter-encode (polyline) |
| `start_latlng` / `end_latlng` | [lat,lng] | — | titik awal/akhir |
| `elev_high` / `elev_low` | number | meter | |
| `pr_count` / `achievement_count` | number | — | rekor pribadi tercapai |

### 2b. Detail — `GET /activities/{id}` (DetailedActivity)
Tambahan penting (1 call per aktivitas):

| Field | Tipe | Catatan |
|---|---|---|
| `calories` | number | kalori (hanya ada di detail) |
| `description` | string | catatan atlet |
| **`best_efforts`** | array | **Pace terbaik** — waktu tercepat 400m, 1k, 1 mile, 5k, 10k, dll. |
| **`splits_metric`** | array | **Split per-km**: `distance`, `moving_time`, `elevation_difference`, `average_speed`, `average_heartrate`, `pace_zone` |
| `laps` | array | data per-lap |
| `device_name` | string | jam/perangkat |
| `gear_id` | string | sepatu yang dipakai |

### 2c. Time-series — `GET /activities/{id}/streams`
Array per-titik untuk **grafik HR / pace sepanjang jarak**. Streams tersedia:
`time`, `distance`, `latlng`, `altitude`, `velocity_smooth` (kecepatan), `heartrate`,
`cadence`, `grade_smooth`, `moving`.

> ⚠️ Streams **tidak** kita simpan di DB (boros untuk free tier). Ambil **on-demand** hanya saat
> user membuka halaman detail, lalu tampilkan grafik. Untuk 70 orang, hitung terhadap limit
> harian API.

---

## 3. GYM (activity: `WeightTraining`, `Workout`, `Crossfit`)

Ini bagian yang paling sering disalahpahami. Yang **tersedia**:

| Field | Tipe | Catatan |
|---|---|---|
| `id` | number | |
| `name` | string | judul sesi |
| `sport_type` | string | `WeightTraining` / `Workout` / `Crossfit` |
| `start_date` | string | ISO UTC |
| `elapsed_time` | number | detik (durasi sesi) |
| `moving_time` | number | detik (sering ≈ elapsed untuk gym) |
| `average_heartrate` | number | bpm — **hanya bila pakai HR strap** |
| `max_heartrate` | number | bpm |
| `has_heartrate` | boolean | |
| `calories` | number | dari detailed activity |
| `suffer_score` | number | Relative Effort |
| `device_name` | string | |

**❌ TIDAK tersedia dari Strava untuk gym (fundamental):**
- **Set, reps, beban (kg) per latihan** → Strava tidak menyimpannya sama sekali.
- **Volume angkat / total beban** → tidak ada (turunan dari set×reps×beban yang juga tak ada).
- Nama latihan spesifik (bench press, squat, dll.) → tidak terstruktur.
- `distance`, `average_speed`, `total_elevation_gain` → umumnya `null`/0 untuk gym.

**Artinya:** untuk gym, dari Strava murni FE hanya bisa tampilkan **durasi, HR (avg/max),
kalori, relative effort**. Kalau butuh detail set/reps/beban → **harus input manual** (tabel
sendiri di Supabase, di luar Strava).

---

## 4. AGREGAT — `GET /athlete/stats`

Total kumulatif (berguna untuk kartu ringkasan & leaderboard):

| Field | Isi |
|---|---|
| `recent_run_totals` | 4 minggu terakhir: `count`, `distance`, `moving_time`, `elevation_gain` |
| `ytd_run_totals` | year-to-date lari |
| `all_run_totals` | sepanjang waktu lari |

> ⚠️ Endpoint ini punya total **lari/sepeda/renang**, **tidak ada total weight training**.
> Agregat gym harus **kita hitung sendiri** dari tabel `activities`.

---

## 5. Field TURUNAN (dihitung, bukan dari Strava langsung)

FE/backend menghitung ini dari data mentah:

| Turunan | Rumus |
|---|---|
| Pace lari (mnt/km) | `1000 / average_speed / 60` |
| Jarak (km) | `distance / 1000` |
| Durasi (mnt:dtk) | dari `moving_time` detik |
| Kecepatan (km/jam) | `average_speed * 3.6` |
| Acute:Chronic load | rasio beban 7-hari : 28-hari (untuk alert overtraining) |
| Hari sejak aktivitas terakhir | dari `start_date` terbaru |

---

## 6. Bentuk PAYLOAD yang FE terima (kontrak)

Backend menormalisasi data Strava → objek berikut. **FE cukup baca bentuk ini**, tak perlu tahu
detail Strava.

### Profil
```json
{
  "athleteId": 12345,
  "name": "Citra Dewi",
  "username": "citradewi",
  "sex": "F",
  "city": "Tangerang",
  "country": "Indonesia",
  "weight": 61.2,
  "avatar": "https://.../large.jpg",
  "premium": true
}
```

### Aktivitas lari
```json
{
  "activityId": 987654321,
  "type": "run",
  "name": "Latihan Pagi",
  "startDate": "2026-08-03T06:15:00Z",
  "distanceKm": 8.42,
  "movingTimeSec": 4510,
  "durationLabel": "75:10",
  "pacePerKm": "5:21",
  "avgHeartrate": 158,
  "maxHeartrate": 178,
  "elevationGain": 12,
  "calories": 620,
  "sufferScore": 84,
  "bestPace": "4:58",          // dari best_efforts
  "splits": [                    // dari splits_metric, opsional
    { "km": 1, "pacePerKm": "5:10", "avgHeartrate": 150 }
  ]
}
```

### Aktivitas gym
```json
{
  "activityId": 987654400,
  "type": "gym",
  "name": "Weight Training",
  "startDate": "2026-08-03T17:00:00Z",
  "durationLabel": "58:20",
  "avgHeartrate": 142,
  "maxHeartrate": 172,
  "calories": 410,
  "sufferScore": 63,

  // ⚠️ TIDAK dari Strava — hanya terisi bila ada input manual, else null:
  "exercises": null,
  "totalVolumeKg": null
}
```

---

## Ringkasan keputusan untuk FE

| Fitur UI sekarang | Aksi |
|---|---|
| Jarak, durasi, pace, HR, elevasi, kalori (lari) | ✅ Pakai — langsung dari Strava |
| Grafik HR/pace per-km | ✅ Pakai — via streams (on-demand) |
| Pace terbaik | ✅ Pakai — dari `best_efforts` |
| Set/reps/beban/volume gym | ❌ Bukan dari Strava → buang, atau buat **input manual** |
| Langkah (steps) | ❌ Bukan dari Strava → buang, atau integrasi Garmin/Fitbit |
| BMI | ❌ Perlu tinggi badan → input manual bila mau |
| Kalori makro (karbo/protein/lemak) | ❌ Bukan dari Strava → buang, atau input manual |
| Resting/live heart rate | ❌ Bukan dari Strava → buang |
