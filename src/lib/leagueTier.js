// src/lib/leagueTier.js
// Tier liga dihitung live dari posisi rank (bukan disimpan) — self-balancing,
// tak perlu konfigurasi ambang batas XP oleh admin. Dipakai di leaderboard mode
// "Liga" (user & admin), dan reset otomatis tiap bulan mengikuti data XP bulanan.
export const LEAGUE_TIERS = {
  diamond: { key: 'diamond', label: 'Diamond', color: '#0d9488' },
  gold: { key: 'gold', label: 'Gold', color: '#b8862f' },
  silver: { key: 'silver', label: 'Silver', color: '#78716c' },
  bronze: { key: 'bronze', label: 'Bronze', color: '#c2703d' },
}

// rank: posisi 1-based. total: jumlah peserta di leaderboard.
export function tierForRank(rank, total) {
  if (rank <= 1) return LEAGUE_TIERS.diamond
  if (rank <= Math.max(2, Math.ceil(total * 0.1))) return LEAGUE_TIERS.gold
  if (rank <= Math.max(3, Math.ceil(total * 0.35))) return LEAGUE_TIERS.silver
  return LEAGUE_TIERS.bronze
}

// Urutan tampilan strip badge liga, rendah → tinggi.
export const LEAGUE_TIER_ORDER = [LEAGUE_TIERS.bronze, LEAGUE_TIERS.silver, LEAGUE_TIERS.gold, LEAGUE_TIERS.diamond]
