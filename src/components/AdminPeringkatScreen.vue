<template>
<div class="mui">
  <div class="mui-col mui-col--full">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Pantauan performa divisi</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && rows" />
      <span v-else class="mui-pill">Admin View</span>
    </header>

    <div class="mui-toggle">
      <button :class="{ 'is-active': activeMode === 'running' }" @click="activeMode = 'running'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Jarak
      </button>
      <button :class="{ 'is-active': activeMode === 'effort' }" @click="activeMode = 'effort'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Effort
      </button>
      <button :class="{ 'is-active': activeMode === 'league' }" @click="activeMode = 'league'">
        <Shield :size="15" />
        Liga
      </button>
    </div>

    <div v-if="activeMode === 'league'" class="lb-league-card">
      <div v-if="loading && !rows" class="lb-league-badges">
        <div v-for="i in 4" :key="i" class="lb-league-badge">
          <div class="mui-skel mui-skel--circle" style="width: 18px; height: 18px;"></div>
          <div class="mui-skel mui-skel--text" style="width: 30px; margin-top: 4px;"></div>
        </div>
      </div>
      <div v-else class="lb-league-badges">
        <div v-for="t in tierOrder" :key="t.key" class="lb-league-badge" :style="{ color: t.color }">
          <component :is="TIER_ICON[t.key]" :size="18" />
          <span>{{ t.label }}</span>
        </div>
      </div>
      <div class="lb-league-card-bottom">
        <p class="lb-league-sub">XP dihitung minggu ini (Senin–Minggu), reset otomatis tiap Senin.</p>
      </div>
    </div>

    <div v-if="loading && !rows" class="lb-podium">
      <div v-for="i in 3" :key="i" class="lb-podium-item">
        <div class="mui-skel mui-skel--circle" style="width: 50px; height: 50px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 70px; margin-top: 8px;"></div>
        <div class="mui-skel" style="width: 100%; height: 44px; margin-top: 4px;"></div>
      </div>
    </div>
    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-else-if="podium.length" class="lb-podium">
      <div v-for="p in podium" :key="p.id" class="lb-podium-item" :class="'lb-podium-item--rank' + p.rank">
        <div class="lb-podium-avatar">
          <Crown v-if="p.rank === 1" :size="18" class="lb-podium-crown" />
          <span class="lb-podium-avatar-inner">
            <img v-if="p.avatar && !brokenAvatars.has(p.id)" :src="p.avatar" alt="" @error="brokenAvatars.add(p.id)" />
            <template v-else>{{ initialsOf(p.name) }}</template>
          </span>
        </div>
        <p class="lb-podium-name">{{ p.name }}</p>
        <span v-if="p.tier" class="lb-tier-chip" :style="{ color: p.tier.color }">{{ p.tier.label }}</span>
        <p class="lb-podium-value mui-mono">{{ p.value }}</p>
        <div class="lb-podium-bar">{{ p.rank }}</div>
      </div>
    </div>

    <div v-if="loading && !rows" class="mui-rank-list">
      <div v-for="i in 4" :key="i" class="mui-rank">
        <div class="mui-skel mui-skel--circle" style="width: 34px; height: 34px; flex-shrink: 0;"></div>
        <div class="mui-skel mui-skel--text" style="width: 60%;"></div>
      </div>
    </div>
    <div v-else class="mui-rank-list">
      <div v-for="item in restRankData" :key="item.id" class="mui-rank">
        <div class="mui-rank-num mui-rank-num--normal">{{ item.rank }}</div>
        <div class="lb-row-avatar" :style="{ '--tier': item.tier?.color }">
          <img v-if="item.avatar && !brokenAvatars.has(item.id)" :src="item.avatar" alt="" @error="brokenAvatars.add(item.id)" />
          <template v-else>{{ initialsOf(item.name) }}</template>
        </div>
        <div class="mui-rank-name">
          {{ item.name }}
          <span v-if="item.tier" class="lb-tier-chip" :style="{ color: item.tier.color }">{{ item.tier.label }}</span>
        </div>
        <div class="mui-rank-trail">
          <span class="mui-rank-unit">{{ item.unit }}</span>
          <span class="mui-rank-value" :class="{ 'is-zero': isZeroValue(item.value) }">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import RefreshingBadge from './RefreshingBadge.vue'

const activeMode = ref('running')
const leaguePeriod = 'weekly'

// Sebagian foto profil (mis. dari Strava) bisa berupa path relatif yang gagal
// dimuat, bukan URL valid — daripada nampilin ikon broken-image, jatuhkan ke
// inisial begitu <img> gagal load.
const brokenAvatars = reactive(new Set())

const initials = computed(() =>
  (authState.userName || 'Rahmat Hidayat').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const tierOrder = LEAGUE_TIER_ORDER
const TIER_ICON = { bronze: Shield, silver: Award, gold: Star, diamond: Gem }

// Leaderboard nyata (RPC) — sama sumber dengan tampilan peserta.
const { rows, loading } = useLeaderboard(activeMode, leaguePeriod)

const currentRankData = computed(() =>
  (rows.value || []).map((r) => ({
    id: r.athleteId,
    name: r.name,
    avatar: r.avatar,
    tier: r.tier,
    unit: activeMode.value === 'running' ? 'km / minggu' : activeMode.value === 'effort' ? 'poin / minggu' : 'XP / minggu',
    value: activeMode.value === 'running'
      ? `${r.distanceKm} km`
      : activeMode.value === 'effort'
        ? Number(r.effort).toLocaleString('id-ID')
        : Number(r.xp).toLocaleString('id-ID'),
  })),
)

// Ranking + nomor urut asli, dipecah jadi podium (1-3) & sisanya (4+).
const rankedData = computed(() => currentRankData.value.map((item, i) => ({ ...item, rank: i + 1 })))
// Urutan visual panggung: perak-emas-perunggu (juara 1 di tengah, lebih tinggi).
const podium = computed(() => {
  const top3 = rankedData.value.slice(0, 3)
  return [top3[1], top3[0], top3[2]].filter(Boolean)
})
const restRankData = computed(() => rankedData.value.slice(3))

function initialsOf(name) {
  return (name || '—').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

// Tampilan: angka 0 diredupkan di baris peringkat supaya capaian nyata (>0) menonjol
function isZeroValue(v) {
  return v === 0 || v === '0' || v === '0.0'
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* Podium top-3 — kartu putih, juara 1 di tengah & pedestal paling tinggi.
   Dikasih sapuan cahaya ambient ala "panggung" di belakangnya (dekoratif,
   tak ganggu keterbacaan) supaya momen juara terasa lebih meriah — disamakan
   dgn tampilan versi peserta (PeringkatScreen.vue), struktur tetap sama. */
.lb-podium {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 20px;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.22);
  padding: 22px 14px 16px;
}
.lb-podium::before {
  content: '';
  position: absolute;
  top: -10%; left: 50%;
  width: 240px; height: 180px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse, rgba(245, 158, 11, 0.14) 0%, transparent 72%);
  pointer-events: none;
}
.lb-podium-item {
  position: relative;
  flex: 0 1 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.lb-podium-avatar {
  position: relative;
  width: 50px; height: 50px;
  border-radius: 50%;
  display: grid; place-content: center;
  font-size: 14px; font-weight: 800;
  border: 3px solid rgba(37, 99, 235, 0.14);
  box-shadow: 0 10px 20px -10px rgba(15, 23, 42, 0.3);
}
/* Wrapper dalam yang benar-benar clip ke lingkaran — mahkota juara 1 taruh
   di elemen luar (tanpa overflow:hidden) supaya tak ikut terpotong. */
.lb-podium-avatar-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: grid; place-content: center;
}
.lb-podium-avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
.lb-podium-item--rank1 .lb-podium-avatar {
  width: 64px; height: 64px; font-size: 18px;
  background: linear-gradient(135deg, #fde68a, #f59e0b); color: #78350f;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18), 0 8px 20px -6px rgba(245, 158, 11, 0.5);
}
.lb-podium-item--rank2 .lb-podium-avatar { background: linear-gradient(135deg, #e5e7eb, #94a3b8); color: #1e293b; }
.lb-podium-item--rank3 .lb-podium-avatar { background: linear-gradient(135deg, #fdba74, #c2703d); color: #431407; }

/* Cincin pulsa lembut di belakang avatar juara 1 — penanda "sang juara" */
.lb-podium-item--rank1 .lb-podium-avatar::after {
  content: '';
  position: absolute;
  inset: -9px;
  border-radius: 50%;
  border: 2px solid rgba(245, 158, 11, 0.4);
  animation: lb-winner-pulse 2.4s ease-out infinite;
}
@keyframes lb-winner-pulse {
  0%   { transform: scale(0.88); opacity: 0.85; }
  100% { transform: scale(1.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lb-podium-item--rank1 .lb-podium-avatar::after { animation: none; display: none; }
}

.lb-podium-crown {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  color: #f59e0b;
  filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.45));
}

.lb-podium-name {
  margin: 0; max-width: 100%;
  font-size: 12px; font-weight: 700; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lb-podium-value { margin: 0; font-size: 12px; font-weight: 700; color: rgba(15, 23, 42, 0.6); }

.lb-podium-bar {
  width: 100%;
  display: grid; place-content: center;
  border-radius: 12px 12px 0 0;
  margin-top: 4px;
  font-size: 18px; font-weight: 800; color: #fff;
}
.lb-podium-item--rank1 .lb-podium-bar { height: 64px; background: linear-gradient(180deg, #fbbf24, #f59e0b); }
.lb-podium-item--rank2 .lb-podium-bar { height: 44px; background: linear-gradient(180deg, #cbd5e1, #94a3b8); color: #1e293b; }
.lb-podium-item--rank3 .lb-podium-bar { height: 36px; background: linear-gradient(180deg, #fdba74, #c2703d); }

/* Container liga — strip badge tier + toggle periode, dipakai cuma saat mode Liga aktif */
.lb-league-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.2);
}

.lb-league-badges {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.lb-league-badge {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 14px;
  opacity: 0.68;
}
.lb-league-badge span { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: rgba(15, 23, 42, 0.8); }

.lb-league-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.lb-league-sub { margin: 0; font-size: 12px; color: rgba(15, 23, 42, 0.6); flex: 1; min-width: 160px; }

.lb-period-toggle {
  flex: 0 0 auto;
  padding: 3px;
  background: rgba(37, 99, 235, 0.06);
  box-shadow: none;
}
.lb-period-toggle button { padding: 7px 12px; font-size: 12px; }

/* Avatar foto di baris rank list (rank 4+) — fallback inisial kalau tak ada
   foto; cincinnya ikut warna tier liga orang itu (bukan amber statis), sama
   seperti versi peserta. */
.lb-row-avatar {
  flex: 0 0 auto;
  width: 32px; height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: grid; place-content: center;
  font-weight: 700; font-size: 11px; color: rgba(15, 23, 42, 0.75);
  background: rgba(37, 99, 235, 0.08);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--tier, #f59e0b) 55%, transparent);
}

/* ── Tampilan: baris peringkat punya sapuan warna dari tepi,
   angka ringkas dgn depth, dan trailing value/unit ditumpuk spy lebih jelas. ── */
.mui-rank {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, #ffffff 45%);
}
.mui-rank-num {
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06), 0 6px 14px -8px rgba(15, 23, 42, 0.15);
}
.mui-rank-trail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.mui-rank-trail .mui-rank-unit { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
.mui-rank-value.is-zero { color: rgba(15, 23, 42, 0.35); font-weight: 600; }
.lb-row-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Chip tier liga (Bronze/Silver/Gold/Diamond) — dipakai di podium & baris list */
.lb-tier-chip {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.7);
  white-space: nowrap;
}
</style>
