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
    </div>

    <div class="mui-rank-list">
      <div v-for="(item, index) in currentRankData" :key="item.id" class="mui-rank" :class="{ 'mui-rank--me': item.isMe }">
        <div class="mui-rank-num" :class="rankClass(index)">{{ index + 1 }}</div>
        <div class="mui-rank-name">
          {{ item.name }}
          <span v-if="item.isMe" class="mui-tag mui-tag--accent">Kamu</span>
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
import { ref, computed } from 'vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import MemberTabBar from './MemberTabBar.vue'

const activeMode = ref('running')

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

// Leaderboard nyata (RPC): jarak/bulan atau relative effort/minggu.
const { rows } = useLeaderboard(activeMode)

const currentRankData = computed(() =>
  (rows.value || []).map((r) => ({
    id: r.athleteId,
    name: r.name,
    isMe: r.athleteId === authState.athleteId,
    unit: activeMode.value === 'running' ? 'km / bulan' : 'poin / minggu',
    value: activeMode.value === 'running'
      ? `${r.distanceKm} km`
      : Number(r.effort).toLocaleString('id-ID'),
  })),
)

const myRank = computed(() => {
  const i = currentRankData.value.findIndex((r) => r.isMe)
  return i >= 0 ? i + 1 : '—'
})

function rankClass(i) {
  if (i === 0) return 'mui-rank-num--gold'
  if (i === 1) return 'mui-rank-num--silver'
  if (i === 2) return 'mui-rank-num--bronze'
  return 'mui-rank-num--normal'
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';
</style>
