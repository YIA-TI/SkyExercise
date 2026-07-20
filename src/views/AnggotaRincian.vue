<template>
  <div class="page-layout font-sans">
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
        <RouterLink to="/anggota/peringkat/running" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 22 16 18 12"/><line x1="2" y1="16" x2="22" y2="16"/><polyline points="6 4 2 8 6 12"/><line x1="22" y1="8" x2="2" y2="8"/></svg>
          Peringkat
        </RouterLink>
        <RouterLink to="/anggota/rincian" class="nav-item nav-item--active">
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

    <main class="main-content">
      <header class="top-header">
        <h1 class="page-title">Profil Saya</h1>
        <div class="header-badge">Anggota Aktif</div>
      </header>

      <div style="padding: 24px 32px;">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-avatar-lg">{{ initials }}</div>
          <div>
            <div class="profile-name">{{ authState.userName }}</div>
            <div class="profile-email">{{ authState.userEmail }}</div>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <span class="badge badge--green">Aktif</span>
              <span class="badge badge--accent">Anggota ARFF</span>
            </div>
          </div>
        </div>

        <!-- Detail Info -->
        <div class="section-card" style="margin: 0 0 24px;">
          <h2 class="section-title">Informasi Diri</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">ID Anggota</div>
              <div class="info-value"><span class="id-badge">AP-2021-0070</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Nama Lengkap</div>
              <div class="info-value">Citra Dewi</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peran</div>
              <div class="info-value">Atlet</div>
            </div>
            <div class="info-item">
              <div class="info-label">Spesialisasi</div>
              <div class="info-value">Fire Rescue</div>
            </div>
            <div class="info-item">
              <div class="info-label">Bergabung</div>
              <div class="info-value">12 Mar 2021</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value" style="color:#16a34a;">Aktif Bertugas</div>
            </div>
          </div>
        </div>

        <!-- Statistik Pribadi -->
        <div class="section-card" style="margin: 0;">
          <h2 class="section-title">Statistik Latihan</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Total Sesi</div>
              <div class="info-value info-value--metric">18</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Jarak Lari</div>
              <div class="info-value info-value--metric">97<span class="info-value-unit">km</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Max Lift</div>
              <div class="info-value info-value--metric">72<span class="info-value-unit">kg</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Peringkat Running</div>
              <div class="info-value info-value--metric">#6<span class="info-value-unit">/ 48</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Peringkat Weight</div>
              <div class="info-value info-value--metric">#7<span class="info-value-unit">/ 48</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Kehadiran</div>
              <div class="info-value info-value--metric" style="color:#16a34a;">91<span class="info-value-unit">%</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth.js'

const router = useRouter()

const initials = computed(() =>
  authState.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
)

function handleLogout() { logout(); router.push('/') }
</script>

<style scoped>
@import '../assets/layout.css';
</style>
