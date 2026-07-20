<template>
  <div class="page-layout">
    <!-- Sidebar Admin -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-title">AeroGuard</div>
          <div class="brand-sub">ARFF Monitor</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin" class="nav-item" active-class="nav-item--active" exact>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </RouterLink>
        <RouterLink to="/admin/anggota" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Data Anggota
        </RouterLink>
        <RouterLink to="/admin/peringkat/running" class="nav-item nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 22 16 18 12"/><line x1="2" y1="16" x2="22" y2="16"/><polyline points="6 4 2 8 6 12"/><line x1="22" y1="8" x2="2" y2="8"/></svg>
          Papan Peringkat
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-detail">
            <div class="user-name">{{ authState.userName }}</div>
            <div class="user-role">Administrator</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-header">
        <h1 class="page-title">Papan Peringkat</h1>
        <div class="header-badge">Admin View</div>
      </header>

      <div class="section-card" style="margin-top: 24px;">
        <!-- Toggle Running / Weight -->
        <div class="rank-toggle">
          <button
            class="rank-toggle-btn"
            :class="{ 'rank-toggle-btn--active': activeMode === 'running' }"
            @click="switchMode('running')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Running
          </button>
          <button
            class="rank-toggle-btn"
            :class="{ 'rank-toggle-btn--active': activeMode === 'weight' }"
            @click="switchMode('weight')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
            Weight Training
          </button>
        </div>

        <h2 class="section-title">
          {{ activeMode === 'running' ? '🏃 Peringkat Lari Terbaik' : '🏋️ Peringkat Angkat Beban Terbaik' }}
        </h2>

        <div class="rank-list">
          <div
            v-for="(item, index) in currentRankData"
            :key="item.id"
            class="rank-item"
            :class="podiumClass(index)"
          >
            <div class="rank-number" :class="rankClass(index)">{{ index + 1 }}</div>
            <div class="rank-name">{{ item.name }}</div>
            <div class="rank-unit">{{ item.unit }}</div>
            <div class="rank-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth.js'

const props = defineProps({ mode: { type: String, default: 'running' } })
const router = useRouter()

const activeMode = ref(props.mode)

const initials = computed(() =>
  authState.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
)

function handleLogout() { logout(); router.push('/') }

function switchMode(m) {
  activeMode.value = m
  router.replace(`/admin/peringkat/${m}`)
}

function rankClass(i) {
  if (i === 0) return 'rank-number--gold'
  if (i === 1) return 'rank-number--silver'
  if (i === 2) return 'rank-number--bronze'
  return 'rank-number--normal'
}

function podiumClass(i) {
  if (i === 0) return 'rank-item--top1'
  if (i === 1) return 'rank-item--top2'
  if (i === 2) return 'rank-item--top3'
  return ''
}

const runningData = [
  { id: 1, name: 'Dendi Pratama',  unit: 'km / bulan', value: '142 km' },
  { id: 2, name: 'Eko Wahyudi',    unit: 'km / bulan', value: '138 km' },
  { id: 3, name: 'Ahmad Fauzi',    unit: 'km / bulan', value: '125 km' },
  { id: 4, name: 'Gilang Nugraha', unit: 'km / bulan', value: '118 km' },
  { id: 5, name: 'Budi Santoso',   unit: 'km / bulan', value: '102 km' },
  { id: 6, name: 'Citra Dewi',     unit: 'km / bulan', value: '97 km'  },
  { id: 7, name: 'Hendra Kurnia',  unit: 'km / bulan', value: '88 km'  },
  { id: 8, name: 'Fitria Sari',    unit: 'km / bulan', value: '71 km'  },
]

const weightData = [
  { id: 1, name: 'Eko Wahyudi',    unit: 'max lift (kg)', value: '120 kg' },
  { id: 2, name: 'Gilang Nugraha', unit: 'max lift (kg)', value: '112 kg' },
  { id: 3, name: 'Dendi Pratama',  unit: 'max lift (kg)', value: '105 kg' },
  { id: 4, name: 'Ahmad Fauzi',    unit: 'max lift (kg)', value: '98 kg'  },
  { id: 5, name: 'Budi Santoso',   unit: 'max lift (kg)', value: '90 kg'  },
  { id: 6, name: 'Hendra Kurnia',  unit: 'max lift (kg)', value: '85 kg'  },
  { id: 7, name: 'Citra Dewi',     unit: 'max lift (kg)', value: '72 kg'  },
  { id: 8, name: 'Fitria Sari',    unit: 'max lift (kg)', value: '65 kg'  },
]

const currentRankData = computed(() =>
  activeMode.value === 'running' ? runningData : weightData
)
</script>

<style scoped>
@import '../assets/layout.css';
</style>
