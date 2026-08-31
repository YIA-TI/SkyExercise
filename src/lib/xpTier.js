// src/lib/xpTier.js
// Tier progres pribadi (Bronze → Diamond) berbasis total_xp kumulatif — beda dari
// LEAGUE_TIERS (lib/leagueTier.js) yang berbasis posisi rank bulanan & bisa turun;
// tier ini SELALU naik seiring XP terkumpul (quest diklaim), cocok utk hero Latihan.
export const XP_TIERS = [
  { key: 'bronze',   label: 'Bronze',   minXp: 0,     color: '#c2703d', badgeFile: 'tier-bronze.png',   tagline: 'Awal perjalananmu menuju puncak!' },
  { key: 'silver',   label: 'Silver',   minXp: 1000,  color: '#78716c', badgeFile: 'tier-silver.png',   tagline: 'Terus tingkatkan kemampuanmu!' },
  { key: 'gold',     label: 'Gold',     minXp: 3000,  color: '#b8862f', badgeFile: 'tier-gold.png',     tagline: 'Konsistensi adalah kunci kemenangan!' },
  { key: 'platinum', label: 'Platinum', minXp: 6000,  color: '#8b7cf6', badgeFile: 'tier-platinum.png', tagline: 'Kamu semakin dekat ke level terbaik!' },
  { key: 'diamond',  label: 'Diamond',  minXp: 10000, color: '#38bdf8', badgeFile: 'tier-diamond.png',  tagline: 'Hanya yang terbaik berada di sini!' },
]

// Tier saat ini + batas tier berikutnya (null kalau sudah di tier puncak) berdasar total XP.
export function tierForXp(totalXp) {
  const xp = totalXp ?? 0
  let current = XP_TIERS[0]
  let next = XP_TIERS[1] ?? null
  for (let i = 0; i < XP_TIERS.length; i++) {
    if (xp >= XP_TIERS[i].minXp) {
      current = XP_TIERS[i]
      next = XP_TIERS[i + 1] ?? null
    }
  }
  const pct = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100
  return { ...current, next, pct, xp }
}
