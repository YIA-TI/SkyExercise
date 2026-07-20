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
        <RouterLink to="/admin/peringkat/running" class="nav-item" :class="{ 'nav-item--active': isPeringkatActive }" @click.prevent="goToPeringkat">
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
        <h1 class="page-title">Dashboard Admin</h1>
        <div class="header-badge">ARFF Command</div>
      </header>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-card--blue">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">48</div>
            <div class="stat-label">Total Anggota</div>
          </div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">12</div>
            <div class="stat-label">Sesi Hari Ini</div>
          </div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">847 km</div>
            <div class="stat-label">Total Jarak Bulan Ini</div>
          </div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">94%</div>
            <div class="stat-label">Tingkat Kehadiran</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section-card">
        <h2 class="section-title">Aktivitas Latihan Terbaru</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Anggota</th>
              <th>Jenis Latihan</th>
              <th>Durasi</th>
              <th>Jarak/Berat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in recentActivities" :key="a.id">
              <td>{{ a.name }}</td>
              <td><span class="badge" :class="a.type === 'Running' ? 'badge--blue' : 'badge--orange'">{{ a.type }}</span></td>
              <td>{{ a.duration }}</td>
              <td>{{ a.value }}</td>
              <td><span class="badge badge--green">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
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

const isPeringkatActive = computed(() =>
  route.path.startsWith('/admin/peringkat')
)

function goToPeringkat() {
  router.push('/admin/peringkat/running')
}

function handleLogout() {
  logout()
  router.push('/')
}

const recentActivities = [
  { id: 1, name: 'Ahmad',    type: 'Running', duration: '45 menit', value: '8.2 km',   status: 'Selesai' },
  { id: 2, name: 'Budi',     type: 'Weight',  duration: '60 menit', value: '75 kg',    status: 'Selesai' },
  { id: 3, name: 'Citra',    type: 'Running', duration: '30 menit', value: '5.1 km',   status: 'Selesai' },
  { id: 4, name: 'Dendi',    type: 'Running', duration: '50 menit', value: '9.0 km',   status: 'Selesai' },
  { id: 5, name: 'Eko',      type: 'Weight',  duration: '55 menit', value: '90 kg',    status: 'Selesai' },
]
</script>

<style scoped>
@import '../assets/layout.css';
</style>
