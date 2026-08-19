<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Profil Saya</p>
          <p class="mui-h-sub">Anggota ARFF aktif</p>
        </div>
      </div>
      <span class="mui-pill">Aktif</span>
    </header>

    <!-- Hero: foto sampul + avatar + identitas -->
    <div class="pf-hero" :style="heroBg">
      <div class="pf-hero-overlay"></div>
      <div class="pf-hero-body">
        <div class="pf-hero-avatar">{{ initials }}</div>
        <div class="pf-hero-info">
          <p class="pf-hero-name">
            {{ authState.userName || 'Citra Dewi' }}
            <svg class="pf-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fc4c02" aria-hidden="true">
              <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </p>
          <p class="pf-hero-email">{{ authState.userEmail || 'citra.dewi@angkasapura.co.id' }}</p>
          <div class="pf-hero-tags">
            <span class="mui-tag mui-tag--green">Aktif Bertugas</span>
            <span class="mui-tag mui-tag--accent">Anggota ARFF</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ringkasan cepat -->
    <div class="pf-quick-row">
      <div v-for="q in quickStats" :key="q.label" class="pf-quick">
        <div class="pf-quick-ic" :class="q.cls" v-html="q.icon"></div>
        <div>
          <p class="pf-quick-value mui-mono">{{ q.value }}</p>
          <p class="pf-quick-label">{{ q.label }}</p>
        </div>
      </div>
    </div>

    <!-- Grafik jarak 7 hari (Strava — recent run totals) -->
    <section class="mui-block">
      <h2 class="mui-section-title">Jarak 7 Hari Terakhir</h2>
      <div class="mui-card">
        <div class="pf-chart">
          <div v-for="(h, i) in distance.bars" :key="i" class="pf-chart-col">
            <span class="pf-chart-bar" :style="{ height: h + '%' }"></span>
            <span class="pf-chart-label">{{ dayLabels[i] }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Informasi diri -->
    <section class="mui-block">
      <h2 class="mui-section-title">Informasi Diri</h2>
      <div class="pf-grid">
        <div v-for="info in infoDiri" :key="info.label" class="pf-info">
          <p class="pf-info-label">{{ info.label }}</p>
          <p class="pf-info-value">{{ info.value }}</p>
        </div>
      </div>
    </section>

    <!-- Akun -->
    <section class="mui-block">
      <h2 class="mui-section-title">Akun</h2>
      <div class="mui-card pf-list">
        <button class="pf-row" type="button" @click="goDataTubuh">
          <span class="pf-row-ic" v-html="icons.scale"></span>
          <span class="pf-row-label">Edit Data Tubuh</span>
          <svg class="pf-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="pf-row" type="button" @click="goGantiPassword">
          <span class="pf-row-ic" v-html="icons.lock"></span>
          <span class="pf-row-label">Ganti Password</span>
          <svg class="pf-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>

    <!-- Integrasi Strava -->
    <section class="mui-block">
      <h2 class="mui-section-title">Integrasi Strava</h2>
      <div v-if="stravaState.connected" class="mui-card pf-list">
        <button class="pf-row" type="button" @click="handleDisconnectStrava">
          <span class="pf-row-ic" v-html="icons.shield"></span>
          <span class="pf-row-label">Strava Terhubung</span>
          <span class="pf-row-status"><span class="pf-row-dot"></span>Aktif</span>
        </button>
      </div>
      <button v-else class="pf-connect" type="button" @click="goConnectStrava">
        <span class="pf-connect-ic">
          <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </span>
        Hubungkan ke Strava
      </button>
    </section>

    <!-- Zona berbahaya -->
    <section class="mui-block">
      <h2 class="mui-section-title">Zona Berbahaya</h2>
      <button class="pf-danger" type="button" @click="handleDelete">
        <span v-html="icons.trash"></span>
        Hapus Akun
      </button>
    </section>

    <!-- Sesi -->
    <section class="mui-block">
      <h2 class="mui-section-title">Sesi</h2>
      <div class="mui-card pf-list">
        <button class="pf-row pf-row--logout" type="button" @click="handleLogout">
          <span class="pf-row-ic" v-html="icons.logout"></span>
          <span class="pf-row-label">Keluar dari Akun</span>
          <svg class="pf-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth.js'
import { distance as mockDistance } from '../store/stats.js'
import { stravaState, disconnectStrava } from '../store/strava.js'
import { useProfile, useHomeStats, useLeaderboard } from '../composables/useMemberData.js'
import { calcBmi, bmiCategory } from '../lib/normalize.js'
import { openBodyMetricsModal } from '../store/bodyMetricsModal.js'
import MemberTabBar from './MemberTabBar.vue'

const router = useRouter()

// Data nyata: profil + statistik (grafik jarak 7 hari).
const { profile } = useProfile()
const { stats } = useHomeStats()
const distance = computed(() => ({ ...mockDistance, ...(stats.value?.distance || {}) }))

// Peringkat effort nyata (RPC) — cari posisi atlet sendiri di leaderboard.
const { rows: effortRows } = useLeaderboard('effort')
const effortRank = computed(() => {
  const i = (effortRows.value || []).findIndex((r) => r.athleteId === authState.athleteId)
  return i >= 0 ? `#${i + 1}` : '—'
})

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const heroBg = {
  backgroundImage:
    'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80")',
}

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function handleLogout() {
  logout()
  router.push('/')
}

function goGantiPassword() {
  router.push('/profil/ganti-password')
}

function goDataTubuh() {
  openBodyMetricsModal()
}

function goConnectStrava() {
  router.push('/strava/authorize')
}

function handleDisconnectStrava() {
  if (window.confirm('Putuskan koneksi Strava?')) {
    disconnectStrava()
  }
}

function handleDelete() {
  if (window.confirm('Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
    logout()
    router.push('/')
  }
}

const bmi = computed(() => calcBmi(profile.value?.weight, profile.value?.height))
const bmiLabel = computed(() => bmi.value != null ? `${bmi.value} · ${bmiCategory(bmi.value)}` : '—')

const infoDiri = computed(() => [
  { label: 'Nama Lengkap', value: profile.value?.name || authState.userName || '—' },
  { label: 'Jenis Kelamin', value: profile.value?.sex === 'M' ? 'Laki-laki' : profile.value?.sex === 'F' ? 'Perempuan' : '—' },
  { label: 'Kota', value: profile.value?.city || '—' },
  { label: 'Negara', value: profile.value?.country || '—' },
  { label: 'Berat Badan', value: profile.value?.weight ? `${profile.value.weight} kg` : '—' },
  { label: 'Tinggi Badan', value: profile.value?.height ? `${profile.value.height} cm` : '—' },
])

const quickStats = computed(() => [
  {
    label: 'Sesi Minggu Ini', value: String(stats.value?.effort?.weekSessions ?? '—'), cls: 'is-orange',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  },
  {
    label: 'Pace Tercepat', value: distance.value.bestPace, cls: 'is-blue',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  },
  {
    label: 'Peringkat Effort', value: effortRank.value, cls: 'is-green',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  },
  {
    label: 'BMI', value: bmiLabel.value, cls: 'is-purple',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>',
  },
])

const icons = {
  scale: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  logout: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* Hero: foto sampul + identitas */
.pf-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  min-height: 168px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.pf-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(28, 25, 23, 0.15) 0%, rgba(28, 25, 23, 0.9) 100%);
  pointer-events: none;
}

.pf-hero-body {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  color: #ffffff;
}

.pf-hero-avatar {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: grid;
  place-content: center;
  font-size: 22px;
  font-weight: 700;
  border: 2.5px solid rgba(255, 255, 255, 0.85);
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.pf-hero-info { min-width: 0; }

.pf-hero-name {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
}

.pf-hero-email {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.7);
}

.pf-hero-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Ringkasan cepat */
.pf-quick-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.pf-quick {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.pf-quick-ic {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-content: center;
}

.pf-quick-ic.is-orange { background: #ffedd5; color: #ea580c; }
.pf-quick-ic.is-blue   { background: #ccfbf1; color: #0f766e; }
.pf-quick-ic.is-green  { background: #d1fae5; color: #059669; }
.pf-quick-ic.is-purple { background: #ede9fe; color: #7c3aed; }

.pf-quick-value { margin: 0; font-size: 17px; font-weight: 700; color: #1c1917; letter-spacing: -0.3px; }
.pf-quick-label { margin: 2px 0 0; font-size: 10.5px; color: #a8a29e; }

/* Grafik jarak mingguan */
.pf-chart { display: flex; align-items: flex-end; gap: 8px; height: 96px; }
.pf-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.pf-chart-bar { width: 100%; max-width: 24px; border-radius: 6px; background: linear-gradient(180deg, #ff914d, #fc4c02); }
.pf-chart-label { font-size: 10.5px; color: #a8a29e; }

/* Grid info */
.pf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.pf-info {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.pf-info-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #a8a29e;
}

.pf-info-value {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1c1917;
}

/* Daftar pengaturan bergaya list (Akun / Keamanan / Sesi) */
.pf-list { padding: 6px 8px; display: flex; flex-direction: column; }

.pf-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 12px 8px;
  border-radius: 12px;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;
}

.pf-row:hover { background: #f5f1ec; }

.pf-row + .pf-row { border-top: 1px solid #f5f1ec; }

.pf-row-ic {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-content: center;
  background: #f5f1ec;
  color: #57534e;
}

.pf-row-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1c1917;
}

.pf-row-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #059669;
}

.pf-row-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }

.pf-chevron { flex: 0 0 auto; color: #d6cfc8; }

.pf-row--logout .pf-row-ic { background: #ffedd5; color: #ea580c; }
.pf-row--logout .pf-row-label { color: #ea580c; }

/* Hubungkan ke Strava (belum terhubung) */
.pf-connect {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 16px 32px -16px rgba(252, 76, 2, 0.7);
  transition: transform 0.15s ease;
}

.pf-connect:hover { transform: scale(1.01); }

/* Zona berbahaya */
.pf-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  background: #fee2e2;
  color: #dc2626;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: background 0.15s ease;
}

.pf-danger:hover { background: #fecaca; }
</style>
