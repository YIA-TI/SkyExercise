// src/lib/achievementsEn.js
// Achievement name/description/category datanya tersimpan di tabel `achievements`
// di Supabase (bukan file lokal) dan masih berbahasa Indonesia. Dipakai hanya oleh
// layar member (LatihanScreen, NotifikasiScreen, HomeScreen toast) untuk tampilan
// bahasa Inggris tanpa mengubah data asli di database. Key = `name` asli dari DB.
const NAME_EN = {
  'Langkah Pertama': { name: 'First Step', description: 'Complete your first run or gym activity.' },
  'Ksatria Gym': { name: 'Gym Knight', description: 'Complete 20 gym sessions (weight training / workout / crossfit).' },
  'Quest Master': { name: 'Quest Master', description: 'Complete 10 quests (daily or weekly).' },
  'Elit Konsistensi': { name: 'Consistency Elite', description: 'Reach a 30-day activity streak.' },
  'Pelari Subuh': { name: 'Dawn Runner', description: 'Complete a run that starts before 6:00 AM.' },
  'Keseimbangan Total': { name: 'Total Balance', description: 'Combine running & gym in the same week, across 3 different weeks.' },
  'Benteng Tak Tergoyahkan': { name: 'Unshakable Fortress', description: 'Complete weekly quests for 8 consecutive weeks without missing one.' },
  'Kolektor Kilometer': { name: 'Kilometer Collector', description: 'Reach a cumulative running distance of 100 km.' },
  'Keringat Juara': { name: "Champion's Sweat", description: 'Reach a cumulative training time (run + gym) of 20 hours.' },
  'Raja Papan Peringkat': { name: 'Leaderboard King', description: 'Reach #1 on the leaderboard (distance or effort).' },
  'Kilat Track': { name: 'Track Lightning', description: 'Achieve an average pace under 5:00/km in a single run.' },
  'Berkembang Penuh': { name: 'Full Bloom', description: 'Collect a total of 1,000 XP from quests.' },
}

const CATEGORY_EN = {
  Onboarding: 'Onboarding',
  Volume: 'Volume',
  Quest: 'Quest',
  Streak: 'Streak',
  Kebiasaan: 'Habit',
  Variasi: 'Variety',
  'Streak Quest': 'Quest Streak',
  Jarak: 'Distance',
  Durasi: 'Duration',
  Kompetisi: 'Competition',
  Kecepatan: 'Speed',
  XP: 'XP',
}

// Achievement (dari fetchMyAchievements/checkAchievements) → salinan dgn name/
// description/category versi Inggris, fallback ke nilai asli kalau belum terdaftar.
export function achievementEn(a) {
  if (!a) return a
  const en = NAME_EN[a.name]
  return {
    ...a,
    name: en?.name ?? a.name,
    description: en?.description ?? a.description,
    category: CATEGORY_EN[a.category] ?? a.category,
  }
}
