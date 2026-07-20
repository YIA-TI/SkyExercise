<template>
  <div class="page-layout">
    <!-- Sidebar Anggota -->
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
        <RouterLink to="/anggota" class="nav-item" active-class="nav-item--active" exact>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </RouterLink>
        <RouterLink to="/anggota/latihan" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          Latihan Saya
        </RouterLink>
        <RouterLink to="/anggota/peringkat/running" class="nav-item" :class="{ 'nav-item--active': isPeringkatActive }">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 22 16 18 12"/><line x1="2" y1="16" x2="22" y2="16"/><polyline points="6 4 2 8 6 12"/><line x1="22" y1="8" x2="2" y2="8"/></svg>
          Peringkat
        </RouterLink>
        <RouterLink to="/anggota/rincian" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profil Saya
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-detail">
            <div class="user-name">{{ authState.userName }}</div>
            <div class="user-role">Anggota ARFF</div>
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
        <h1 class="page-title">Dashboard Anggota</h1>
        <div class="header-badge">Rizky</div>
      </header>

      <!-- Stats Row -->
      <div class="stats-grid" style="padding-top:24px;">
        <div class="stat-card stat-card--blue">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">97 km</div>
            <div class="stat-label">Total Lari Bulan Ini</div>
          </div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">18</div>
            <div class="stat-label">Sesi Latihan</div>
          </div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">#6</div>
            <div class="stat-label">Peringkat Running</div>
          </div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">72 kg</div>
            <div class="stat-label">Max Lift</div>
          </div>
        </div>
      </div>

      <!-- Latihan Terakhir -->
      <div class="section-card">
        <h2 class="section-title">Latihan Terakhir</h2>
        <div class="rank-list">
          <div v-for="l in latihanTerakhir" :key="l.id" class="rank-item">
            <div style="width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;" :style="{ backgroundColor: l.type === 'Running' ? '#dbeafe' : '#ffedd5' }">
              <svg v-if="l.type === 'Running'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
            </div>
            <div class="rank-name">{{ l.type }} — {{ l.tanggal }}</div>
            <div class="rank-unit">{{ l.durasi }}</div>
            <div class="rank-value">{{ l.nilai }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authState, logout } from '../store/auth.js'

const router = useRouter()
const route = useRoute()

const initials = computed(() =>
  authState.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
)
const isPeringkatActive = computed(() => route.path.startsWith('/anggota/peringkat'))

function handleLogout() { logout(); router.push('/') }

const latihanTerakhir = [
  { id: 1, type: 'Running', tanggal: '18 Jul 2026', durasi: '45 menit', nilai: '7.2 km' },
  { id: 2, type: 'Weight',  tanggal: '17 Jul 2026', durasi: '60 menit', nilai: '72 kg'  },
  { id: 3, type: 'Running', tanggal: '15 Jul 2026', durasi: '30 menit', nilai: '5.0 km' },
  { id: 4, type: 'Running', tanggal: '13 Jul 2026', durasi: '50 menit', nilai: '8.1 km' },
  { id: 5, type: 'Weight',  tanggal: '11 Jul 2026', durasi: '55 menit', nilai: '70 kg'  },
]
</script>

<style scoped>
@import '../assets/layout.css';
</style>
