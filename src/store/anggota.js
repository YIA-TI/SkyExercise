// src/store/anggota.js
// Roster anggota ARFF (mock) — dipakai bersama Admin: Data Anggota & Inspeksi Peserta.
// Field statistik & aktivitas mengikuti docs/strava-data-fields.md (jarak, HR avg/max,
// kalori, relative effort, aktivitas Lari/Gym) — tanpa BMI/langkah/makro/set-reps.

function activity(type, name, meta, kkal) {
  return { type, name, meta, kkal }
}

export const anggotaList = [
  {
    id: 1, name: 'Ahmad Fauzi', peran: 'Koor / Lead', memberId: 'AP-2019-0041',
    spesialisasi: 'Fire Rescue', aktif: true, weight: '78 kg', joined: '10 Jan 2019',
    stats: { weekKm: '38.2', runCount: 5, pace: '5:10', avgHr: 152, maxHr: 178, kkalToday: '980', effort: 720, effortZone: 'Tinggi' },
    bars: [55, 70, 40, 85, 60, 95, 75],
    activities: [
      activity('Lari', 'Lari Pagi', '8.0 km · 42 mnt', 600),
      activity('Gym', 'Latihan Kekuatan', '50 mnt · 148 bpm', 430),
      activity('Lari', 'Interval Sprint', '5.2 km · 28 mnt', 460),
      activity('Gym', 'Sirkuit ARFF', '45 mnt · 160 bpm', 480),
    ],
  },
  {
    id: 2, name: 'Budi Santoso', peran: 'Junior Member', memberId: 'AP-2020-0055',
    spesialisasi: 'Medical Support', aktif: true, weight: '70 kg', joined: '5 Mar 2020',
    stats: { weekKm: '22.5', runCount: 3, pace: '5:45', avgHr: 140, maxHr: 165, kkalToday: '640', effort: 410, effortZone: 'Sedang' },
    bars: [40, 55, 30, 60, 45, 65, 50],
    activities: [
      activity('Gym', 'Angkat Beban', '55 mnt · 142 bpm', 480),
      activity('Lari', 'Lari Sore', '5.0 km · 32 mnt', 380),
      activity('Gym', 'Latihan Inti', '40 mnt · 138 bpm', 350),
    ],
  },
  {
    id: 3, name: 'Citra Dewi', peran: 'Atlet', memberId: 'AP-2021-0070',
    spesialisasi: 'Fire Rescue', aktif: true, weight: '61 kg', joined: '12 Mar 2021',
    stats: { weekKm: '42.6', runCount: 6, pace: '5:21', avgHr: 158, maxHr: 178, kkalToday: '1.030', effort: 640, effortZone: 'Tinggi' },
    bars: [40, 62, 30, 78, 55, 88, 70],
    activities: [
      activity('Lari', 'Lari Pagi', '7.2 km · 45 mnt', 620),
      activity('Gym', 'Angkat Beban', '60 mnt · 142 bpm', 480),
      activity('Lari', 'Interval Sprint', '5.0 km · 30 mnt', 450),
      activity('Gym', 'Deadlift & Squat', '55 mnt · 165 bpm', 510),
      activity('Lari', 'Lari Jarak Jauh', '10.4 km · 60 mnt', 820),
    ],
  },
  {
    id: 4, name: 'Dendi Pratama', peran: 'Atlet', memberId: 'AP-2018-0028',
    spesialisasi: 'Hazmat', aktif: true, weight: '80 kg', joined: '2 Feb 2018',
    stats: { weekKm: '47.3', runCount: 7, pace: '4:58', avgHr: 160, maxHr: 182, kkalToday: '1.140', effort: 780, effortZone: 'Tinggi' },
    bars: [60, 75, 50, 90, 70, 100, 85],
    activities: [
      activity('Lari', 'Lari Pagi', '9.0 km · 45 mnt', 700),
      activity('Lari', 'Tempo Run', '6.5 km · 32 mnt', 520),
      activity('Gym', 'Latihan Kekuatan', '60 mnt · 155 bpm', 500),
    ],
  },
  {
    id: 5, name: 'Eko Wahyudi', peran: 'Pelatih / Coach', memberId: 'AP-2016-0012',
    spesialisasi: 'Rescue', aktif: true, weight: '74 kg', joined: '20 Jun 2016',
    stats: { weekKm: '30.0', runCount: 4, pace: '5:30', avgHr: 145, maxHr: 170, kkalToday: '820', effort: 1240, effortZone: 'Tinggi' },
    bars: [50, 65, 45, 70, 55, 80, 60],
    activities: [
      activity('Gym', 'Coaching Drill', '65 mnt · 150 bpm', 460),
      activity('Lari', 'Lari Bersama Tim', '6.0 km · 35 mnt', 480),
    ],
  },
  {
    id: 6, name: 'Fitria Sari', peran: 'Junior Member', memberId: 'AP-2022-0083',
    spesialisasi: 'Medical Support', aktif: false, weight: '58 kg', joined: '14 Sep 2022',
    stats: { weekKm: '12.0', runCount: 2, pace: '6:10', avgHr: 130, maxHr: 155, kkalToday: '380', effort: 420, effortZone: 'Rendah' },
    bars: [25, 35, 20, 40, 30, 20, 15],
    activities: [
      activity('Lari', 'Lari Ringan', '4.0 km · 28 mnt', 300),
    ],
  },
  {
    id: 7, name: 'Gilang Nugraha', peran: 'Senior Member', memberId: 'AP-2017-0019',
    spesialisasi: 'Fire Rescue', aktif: true, weight: '82 kg', joined: '3 Apr 2017',
    stats: { weekKm: '35.8', runCount: 5, pace: '5:15', avgHr: 150, maxHr: 174, kkalToday: '910', effort: 910, effortZone: 'Tinggi' },
    bars: [45, 60, 55, 80, 65, 90, 70],
    activities: [
      activity('Gym', 'Angkat Beban', '58 mnt · 150 bpm', 470),
      activity('Lari', 'Lari Pagi', '7.5 km · 40 mnt', 560),
      activity('Gym', 'Sirkuit ARFF', '48 mnt · 158 bpm', 440),
    ],
  },
  {
    id: 8, name: 'Hendra Kurnia', peran: 'Senior Member', memberId: 'AP-2019-0046',
    spesialisasi: 'Hazmat', aktif: true, weight: '76 kg', joined: '25 Nov 2019',
    stats: { weekKm: '26.4', runCount: 4, pace: '5:40', avgHr: 142, maxHr: 168, kkalToday: '700', effort: 540, effortZone: 'Sedang' },
    bars: [35, 50, 40, 60, 45, 70, 50],
    activities: [
      activity('Lari', 'Lari Sore', '5.5 km · 33 mnt', 420),
      activity('Gym', 'Latihan Inti', '42 mnt · 140 bpm', 360),
    ],
  },
]

export function getAnggotaById(id) {
  return anggotaList.find(a => a.id === Number(id))
}
