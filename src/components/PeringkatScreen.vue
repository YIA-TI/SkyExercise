<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Divisi ARFF · {{ currentRankData.length }} anggota</p>
        </div>
      </div>
      <span class="mui-pill">Posisi #{{ myRank }}</span>
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
      <div class="lb-league-badges">
        <div
          v-for="t in tierOrder" :key="t.key" class="lb-league-badge"
          :class="{ 'is-current': myTier === t.key }" :style="{ color: t.color }"
        >
          <component :is="TIER_ICON[t.key]" :size="18" />
          <span>{{ t.label }}</span>
        </div>
      </div>
      <div class="lb-league-card-bottom">
        <p class="lb-league-sub">XP dihitung {{ leaguePeriod === 'weekly' ? 'minggu ini' : 'bulan ini' }}, reset otomatis tiap {{ leaguePeriod === 'weekly' ? 'minggu' : 'bulan' }}.</p>
        <div class="mui-toggle lb-period-toggle">
          <button type="button" :class="{ 'is-active': leaguePeriod === 'weekly' }" @click="leaguePeriod = 'weekly'">Mingguan</button>
          <button type="button" :class="{ 'is-active': leaguePeriod === 'monthly' }" @click="leaguePeriod = 'monthly'">Bulanan</button>
        </div>
      </div>
    </div>

    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-if="podium.length" class="lb-podium">
      <div v-for="p in podium" :key="p.id" class="lb-podium-item" :class="['lb-podium-item--rank' + p.rank, { 'is-me': p.isMe }]">
        <div class="lb-podium-avatar">
          <Crown v-if="p.rank === 1" :size="16" class="lb-podium-crown" />
          <img v-if="p.avatar && !brokenAvatars.has(p.id)" :src="p.avatar" alt="" @error="brokenAvatars.add(p.id)" />
          <template v-else>{{ initialsOf(p.name) }}</template>
        </div>
        <p class="lb-podium-name">
          {{ p.name }}
          <span v-if="p.isMe" class="mui-tag mui-tag--accent">Kamu</span>
        </p>
        <span v-if="p.tier" class="lb-tier-chip" :style="{ color: p.tier.color }">{{ p.tier.label }}</span>
        <p class="lb-podium-value mui-mono">{{ p.value }}</p>
        <div class="lb-podium-bar">{{ p.rank }}</div>
      </div>
    </div>

    <div class="mui-rank-list">
      <div v-for="item in restRankData" :key="item.id" class="mui-rank" :class="{ 'mui-rank--me': item.isMe }">
        <div class="mui-rank-num mui-rank-num--normal">{{ item.rank }}</div>
        <div class="lb-row-avatar">
          <img v-if="item.avatar && !brokenAvatars.has(item.id)" :src="item.avatar" alt="" @error="brokenAvatars.add(item.id)" />
          <template v-else>{{ initialsOf(item.name) }}</template>
        </div>
        <div class="mui-rank-name">
          {{ item.name }}
          <span v-if="item.isMe" class="mui-tag mui-tag--accent">Kamu</span>
          <span v-if="item.tier" class="lb-tier-chip" :style="{ color: item.tier.color }">{{ item.tier.label }}</span>
        </div>
        <span class="mui-rank-unit">{{ item.unit }}</span>
        <span class="mui-rank-value">{{ item.value }}</span>
      </div>
    </div>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import MemberTabBar from './MemberTabBar.vue'

const activeMode = ref('running')
const leaguePeriod = ref('monthly')

// Sebagian foto profil (mis. dari Strava) bisa berupa path relatif yang gagal
// dimuat, bukan URL valid — daripada nampilin ikon broken-image, jatuhkan ke
// inisial begitu <img> gagal load.
const brokenAvatars = reactive(new Set())

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const tierOrder = LEAGUE_TIER_ORDER
const TIER_ICON = { bronze: Shield, silver: Award, gold: Star, diamond: Gem }

// Leaderboard nyata (RPC): jarak/bulan, effort/minggu, atau liga (XP mingguan/bulanan).
const { rows } = useLeaderboard(activeMode, leaguePeriod)

const currentRankData = computed(() =>
  (rows.value || []).map((r) => ({
    id: r.athleteId,
    name: r.name,
    avatar: r.avatar,
    tier: r.tier,
    isMe: r.athleteId === authState.athleteId,
    unit: activeMode.value === 'running' ? 'km / bulan' : activeMode.value === 'effort' ? 'poin / minggu' : `XP / ${leaguePeriod.value === 'weekly' ? 'minggu' : 'bulan'}`,
    value: activeMode.value === 'running'
      ? `${r.distanceKm} km`
      : activeMode.value === 'effort'
        ? Number(r.effort).toLocaleString('id-ID')
        : Number(r.xp).toLocaleString('id-ID'),
  })),
)

const myTier = computed(() => currentRankData.value.find((r) => r.isMe)?.tier?.key)

const myRank = computed(() => {
  const i = currentRankData.value.findIndex((r) => r.isMe)
  return i >= 0 ? i + 1 : '—'
})

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
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* Podium top-3 — dibungkus kartu putih (ala container di referensi), juara 1 di
   tengah & pedestal paling tinggi */
.lb-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 16px 32px -26px rgba(17, 18, 20, 0.4);
  padding: 22px 14px 16px;
}
.lb-podium-item {
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
  overflow: hidden;
  display: grid; place-content: center;
  font-size: 14px; font-weight: 800;
  border: 3px solid #fff;
  box-shadow: 0 10px 20px -10px rgba(17, 18, 20, 0.5);
}
.lb-podium-avatar img { width: 100%; height: 100%; object-fit: cover; }
.lb-podium-item--rank1 .lb-podium-avatar { width: 64px; height: 64px; font-size: 18px; background: linear-gradient(135deg, #fde68a, #f59e0b); color: #78350f; }
.lb-podium-item--rank2 .lb-podium-avatar { background: linear-gradient(135deg, #f5f1ec, #d6cfc8); color: #44403c; }
.lb-podium-item--rank3 .lb-podium-avatar { background: linear-gradient(135deg, #fdba74, #c2703d); color: #431407; }
.lb-podium-item.is-me .lb-podium-avatar { box-shadow: 0 0 0 3px #fc4c02, 0 10px 20px -10px rgba(17, 18, 20, 0.5); }

.lb-podium-crown {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: #f59e0b;
}

.lb-podium-name {
  margin: 0; max-width: 100%;
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; color: #1c1917;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lb-podium-name .mui-tag { font-size: 8.5px; padding: 2px 6px; flex-shrink: 0; }
.lb-podium-value { margin: 0; font-size: 12px; font-weight: 700; color: #57534e; }

.lb-podium-bar {
  width: 100%;
  display: grid; place-content: center;
  border-radius: 12px 12px 0 0;
  margin-top: 4px;
  font-size: 18px; font-weight: 800; color: #fff;
}
.lb-podium-item--rank1 .lb-podium-bar { height: 64px; background: linear-gradient(180deg, #fbbf24, #f59e0b); }
.lb-podium-item--rank2 .lb-podium-bar { height: 44px; background: linear-gradient(180deg, #e7e2da, #c7bfb6); color: #44403c; }
.lb-podium-item--rank3 .lb-podium-bar { height: 36px; background: linear-gradient(180deg, #fdba74, #c2703d); }

/* Container liga — strip badge tier + toggle periode, dipakai cuma saat mode Liga aktif */
.lb-league-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 16px 32px -26px rgba(17, 18, 20, 0.4);
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
  opacity: 0.4;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.lb-league-badge span { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
.lb-league-badge.is-current { opacity: 1; background: #f5f1ec; }

.lb-league-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.lb-league-sub { margin: 0; font-size: 12px; color: #78716c; flex: 1; min-width: 160px; }

.lb-period-toggle {
  flex: 0 0 auto;
  padding: 3px;
  background: #f5f1ec;
  box-shadow: none;
}
.lb-period-toggle button { padding: 7px 12px; font-size: 12px; }

/* Avatar foto di baris rank list (rank 4+) — fallback inisial kalau tak ada foto */
.lb-row-avatar {
  flex: 0 0 auto;
  width: 32px; height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: grid; place-content: center;
  font-weight: 700; font-size: 11px; color: #44403c;
  background: #f5f1ec;
}
.lb-row-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Chip tier liga (Bronze/Silver/Gold/Diamond) — dipakai di podium & baris list */
.lb-tier-chip {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f5f1ec;
  white-space: nowrap;
}
</style>
