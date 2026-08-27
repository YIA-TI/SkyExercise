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

    <!-- Kartu spotlight: identitas + statistik + pengaturan, satu panel gelap -->
    <div class="pf-card">
      <span class="pf-status">
        <span class="pf-status-dot"></span>
        Aktif Bertugas
      </span>

      <div class="pf-avatar-wrap">
        <img v-if="profile?.avatar" :src="profile.avatar" class="pf-avatar-img" alt="" />
        <div v-else class="pf-avatar-fallback">{{ initials }}</div>
      </div>

      <p class="pf-name">
        {{ authState.userName || '—' }}
        <svg v-if="stravaState.connected" class="pf-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fc4c02" aria-hidden="true">
          <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
          <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </p>
      <p class="pf-role">Anggota ARFF · {{ profile?.city || '—' }}</p>

      <div class="pf-stats">
        <div v-for="s in quickStats" :key="s.label" class="pf-stat">
          <p class="pf-stat-value mui-mono">{{ s.value }}</p>
          <p class="pf-stat-label">{{ s.label }}</p>
        </div>
      </div>

      <div class="pf-tabs" role="tablist">
        <button
          v-for="t in tabs" :key="t.key" class="pf-tab" type="button" role="tab"
          :class="{ 'is-active': activeTab === t.key }" :aria-selected="activeTab === t.key"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <div class="pf-tab-content">
        <template v-if="activeTab === 'info'">
          <div v-for="info in infoDiri" :key="info.label" class="pf-linkrow">
            <span class="pf-linkrow-label">{{ info.label }}</span>
            <span class="pf-linkrow-value">{{ info.value }}</span>
          </div>
        </template>
        <template v-else>
          <div v-if="stravaState.connected" class="pf-linkrow">
            <span class="pf-linkrow-ic" v-html="icons.shield"></span>
            <span class="pf-linkrow-label">Strava Terhubung</span>
            <button class="pf-linkrow-action" type="button" @click="handleDisconnectStrava">Putuskan</button>
          </div>
          <div v-else class="pf-linkrow">
            <span class="pf-linkrow-ic pf-linkrow-ic--strava" v-html="icons.strava"></span>
            <span class="pf-linkrow-label">Strava belum terhubung</span>
          </div>
        </template>
      </div>

      <button
        class="pf-cta" type="button" :class="stravaState.connected ? 'is-logout' : 'is-connect'"
        @click="stravaState.connected ? handleLogout() : goConnectStrava()"
      >{{ stravaState.connected ? 'Keluar dari Akun' : 'Hubungkan ke Strava' }}</button>

      <div class="pf-quick-icons">
        <button class="pf-quick-icon" type="button" aria-label="Edit Data Tubuh" @click="goDataTubuh" v-html="icons.scale"></button>
        <button class="pf-quick-icon" type="button" aria-label="Ganti Password" @click="goGantiPassword" v-html="icons.lock"></button>
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

    <!-- Zona berbahaya -->
    <section class="mui-block">
      <h2 class="mui-section-title">Zona Berbahaya</h2>
      <button class="pf-danger" type="button" @click="handleDelete">
        <span v-html="icons.trash"></span>
        Hapus Akun
      </button>
    </section>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const tabs = [
  { key: 'info', label: 'Info' },
  { key: 'strava', label: 'Strava' },
]
const activeTab = ref('info')

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
  { label: 'Sesi Minggu Ini', value: String(stats.value?.effort?.weekSessions ?? '—') },
  { label: 'Pace Tercepat', value: distance.value.bestPace },
  { label: 'Peringkat Effort', value: effortRank.value },
  { label: 'BMI', value: bmiLabel.value },
])

const icons = {
  scale: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  strava: '<svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>',
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* Kartu spotlight — panel gelap ala reactbits "Profile 5", warna disesuaikan ke
   tema Strava/AeroGuard kita (stone gelap + aksen oranye, bukan hitam netral). */
.pf-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 26px;
  padding: 28px 20px 22px;
  background: linear-gradient(160deg, #292524 0%, #1c1917 65%, #17140f 100%);
  color: #ffffff;
  box-shadow: 0 24px 60px -30px rgba(28, 25, 23, 0.7);
}

.pf-card::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -12%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(252, 76, 2, 0.25) 0%, rgba(252, 76, 2, 0) 70%);
  pointer-events: none;
}

.pf-status {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  font-size: 11.5px;
  font-weight: 700;
  margin-bottom: 18px;
}
.pf-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25);
}

.pf-avatar-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-content: center;
  border: 3px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 16px;
}
.pf-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.pf-avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.pf-name {
  position: relative;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Playfair Display", Georgia, serif;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.2px;
}
.pf-verified { flex-shrink: 0; }

.pf-role { position: relative; margin: 5px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6); }

/* Statistik ringkas — di dalam kartu, dipisah garis vertikal tipis */
.pf-stats {
  position: relative;
  display: flex;
  width: 100%;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.pf-stat { flex: 1; min-width: 0; padding: 0 4px; border-right: 1px solid rgba(255, 255, 255, 0.08); }
.pf-stat:last-child { border-right: none; }
.pf-stat-value { margin: 0; font-size: 12.5px; font-weight: 700; color: #ffffff; letter-spacing: -0.1px; line-height: 1.25; overflow-wrap: break-word; }
.pf-stat-label { margin: 4px 0 0; font-size: 9px; color: rgba(255, 255, 255, 0.45); line-height: 1.3; }

/* Tab tersegmentasi (Info / Strava) */
.pf-tabs {
  position: relative;
  display: flex;
  gap: 4px;
  width: 100%;
  margin-top: 22px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.pf-tab {
  flex: 1;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 9px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  background: none;
  color: rgba(255, 255, 255, 0.55);
  transition: background 0.15s ease, color 0.15s ease;
}
.pf-tab.is-active { background: #ffffff; color: #1c1917; }

.pf-tab-content { position: relative; width: 100%; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }

.pf-linkrow {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  text-align: left;
}
.pf-linkrow-ic {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
.pf-linkrow-ic--strava { color: #fc4c02; }
.pf-linkrow-label { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.pf-linkrow-value { font-size: 13.5px; font-weight: 700; color: #ffffff; white-space: nowrap; }
.pf-linkrow-action {
  flex: 0 0 auto;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.15);
  padding: 7px 13px;
  border-radius: 999px;
}

/* CTA utama — oranye (ajak connect) atau putih (keluar), kontras tinggi di panel gelap */
.pf-cta {
  position: relative;
  width: 100%;
  margin-top: 18px;
  padding: 15px;
  border: none;
  cursor: pointer;
  border-radius: 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease;
}
.pf-cta:hover { transform: translateY(-1px); }
.pf-cta.is-connect {
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 16px 32px -16px rgba(252, 76, 2, 0.7);
}
.pf-cta.is-logout { color: #1c1917; background: #ffffff; }

/* Ikon aksi cepat — setara "social row" di referensi, dipakai utk pengaturan ringan */
.pf-quick-icons { position: relative; display: flex; gap: 10px; margin-top: 14px; }
.pf-quick-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-content: center;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  transition: background 0.15s ease, color 0.15s ease;
}
.pf-quick-icon:hover { background: rgba(255, 255, 255, 0.16); color: #ffffff; }

/* Grafik jarak mingguan */
.pf-chart { display: flex; align-items: flex-end; gap: 8px; height: 96px; }
.pf-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.pf-chart-bar { width: 100%; max-width: 24px; border-radius: 6px; background: linear-gradient(180deg, #ff914d, #fc4c02); }
.pf-chart-label { font-size: 10.5px; color: #a8a29e; }

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
