<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">My Profile</p>
          <p class="mui-h-sub">Active ARFF member</p>
        </div>
      </div>
      <RefreshingBadge v-if="profileLoading && profile" label="Refreshing…" />
      <span v-else class="mui-pill mui-pill--success">Active</span>
    </header>

    <!-- Kartu spotlight: identitas + statistik + pengaturan, satu panel gelap -->
    <div class="pf-card">
      <span class="pf-status">
        <span class="pf-status-dot"></span>
        On Duty
      </span>

      <div v-if="profileLoading && !profile" class="pf-avatar-wrap">
        <div class="mui-skel mui-skel--circle" style="width: 100%; height: 100%;"></div>
      </div>
      <div v-else class="pf-avatar-wrap">
        <img v-if="profile?.avatar" :src="profile.avatar" class="pf-avatar-img" alt="" />
        <div v-else class="pf-avatar-fallback">{{ initials }}</div>
      </div>

      <template v-if="profileLoading && !profile">
        <div class="mui-skel mui-skel--text" style="width: 140px; height: 21px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 100px; margin-top: 8px;"></div>
      </template>
      <template v-else>
        <p class="pf-name">
          {{ authState.userName || '—' }}
          <svg v-if="stravaState.connected" class="pf-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#a1a1aa" aria-hidden="true">
            <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
            <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </p>
        <p class="pf-role">ARFF Member · {{ profile?.city || '—' }}</p>
      </template>

      <div v-if="statsLoading && !stats" class="pf-stats">
        <div v-for="i in 4" :key="i" class="pf-stat">
          <div class="mui-skel mui-skel--text" style="width: 70%; margin: 0 auto;"></div>
          <div class="mui-skel mui-skel--text" style="width: 90%; margin: 6px auto 0;"></div>
        </div>
      </div>
      <div v-else class="pf-stats">
        <div v-for="s in quickStats" :key="s.label" class="pf-stat" :style="{ '--acc': s.acc }">
          <p class="pf-stat-value mui-mono">{{ s.value }}</p>
          <p v-if="s.sub" class="pf-stat-sub">{{ s.sub }}</p>
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
          <template v-if="profileLoading && !profile">
            <div v-for="i in 4" :key="i" class="pf-linkrow">
              <div class="mui-skel mui-skel--text" style="width: 40%;"></div>
              <div class="mui-skel mui-skel--text" style="width: 30%;"></div>
            </div>
          </template>
          <template v-else>
            <div v-for="info in infoDiri" :key="info.label" class="pf-linkrow">
              <span class="pf-linkrow-label">{{ info.label }}</span>
              <span class="pf-linkrow-value">{{ info.value }}</span>
            </div>
          </template>
        </template>
        <template v-else>
          <div v-if="stravaState.connected" class="pf-linkrow">
            <span class="pf-linkrow-ic" v-html="icons.shield"></span>
            <span class="pf-linkrow-label">Strava Connected</span>
            <button class="pf-linkrow-action" type="button" @click="handleDisconnectStrava">Disconnect</button>
          </div>
          <div v-else class="pf-linkrow">
            <span class="pf-linkrow-ic pf-linkrow-ic--strava" v-html="icons.strava"></span>
            <span class="pf-linkrow-label">Strava not connected</span>
          </div>
        </template>
      </div>

      <template v-if="activeTab === 'info'">
        <div class="pf-divider"></div>
        <p class="pf-group-label">Account Settings</p>

        <div class="pf-quick-icons">
          <button class="pf-quick-row" type="button" @click="goDataTubuh">
            <span class="pf-quick-row-ic" v-html="icons.scale"></span>
            <span class="pf-quick-row-label">Edit Body Data</span>
            <svg class="pf-quick-row-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="pf-quick-row" type="button" @click="goGantiPassword">
            <span class="pf-quick-row-ic" v-html="icons.lock"></span>
            <span class="pf-quick-row-label">Change Password</span>
            <svg class="pf-quick-row-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </template>

      <div class="pf-divider"></div>

      <button
        class="pf-cta" type="button" :class="stravaState.connected ? 'is-logout' : 'is-connect'"
        @click="stravaState.connected ? handleLogout() : goConnectStrava()"
      >{{ stravaState.connected ? 'Log Out' : 'Connect to Strava' }}</button>
    </div>

    <!-- Grafik jarak per hari, Senin–Minggu minggu ini (Strava — total lari per hari) -->
    <section class="mui-block">
      <h2 class="mui-section-title">This Week's Distance</h2>
      <div v-if="statsLoading && !stats" class="mui-card">
        <div class="pf-chart">
          <div v-for="i in 7" :key="i" class="pf-chart-col">
            <div class="mui-skel" style="width: 100%; height: 60%; border-radius: 6px;"></div>
          </div>
        </div>
      </div>
      <div v-else class="mui-card">
        <div class="pf-chart">
          <div v-for="(km, i) in dailyKm" :key="i" class="pf-chart-col">
            <span class="pf-chart-val mui-mono">{{ km > 0 ? km : '' }}</span>
            <span class="pf-chart-bar" :style="{ height: barPct(km) + '%' }"></span>
            <span class="pf-chart-label" :class="{ 'is-today': i === todayIdx }">{{ dayLabels[i] }}</span>
          </div>
        </div>
        <p v-if="weekTotalKm === 0" class="pf-chart-empty">No runs yet this week. Bars will fill in after a Strava sync.</p>
      </div>
    </section>

    <section class="mui-block">
      <button class="pf-danger" type="button" @click="handleDelete">
        <span v-html="icons.trash"></span>
        Delete Account
      </button>
    </section>
  </div>
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
import RefreshingBadge from './RefreshingBadge.vue'

const router = useRouter()

// Data nyata: profil + statistik (grafik jarak 7 hari).
const { profile, loading: profileLoading } = useProfile()
const { stats, loading: statsLoading } = useHomeStats()
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

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const todayIdx = (new Date().getDay() + 6) % 7 // Senin = 0
const dailyKm = computed(() => distance.value.daily ?? [0, 0, 0, 0, 0, 0, 0])
const weekTotalKm = computed(() => dailyKm.value.reduce((s, km) => s + km, 0))
const dailyMaxKm = computed(() => Math.max(1, ...dailyKm.value))
function barPct(km) {
  return Math.round((km / dailyMaxKm.value) * 100)
}

const tabs = [
  { key: 'info', label: 'Info' },
  { key: 'strava', label: 'Strava' },
]
const activeTab = ref('info')

async function handleLogout() {
  const name = authState.userName
  await logout()
  router.push({ path: '/goodbye', query: { name } })
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
  if (window.confirm('Disconnect from Strava?')) {
    disconnectStrava()
  }
}

function handleDelete() {
  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    logout()
    router.push('/')
  }
}

const bmi = computed(() => calcBmi(profile.value?.weight, profile.value?.height))
// bmiCategory() returns Indonesian labels (shared with the admin detail screen,
// which must keep showing them in Indonesian) — map to English for display here only.
const BMI_LABEL_EN = { Kurus: 'Underweight', Normal: 'Normal', Gemuk: 'Overweight', Obesitas: 'Obese' }
const bmiCategoryLabel = computed(() => {
  const cat = bmi.value != null ? bmiCategory(bmi.value) : null
  return cat ? (BMI_LABEL_EN[cat] || cat) : null
})

const infoDiri = computed(() => [
  { label: 'Full Name', value: profile.value?.name || authState.userName || '—' },
  { label: 'Gender', value: profile.value?.sex === 'M' ? 'Male' : profile.value?.sex === 'F' ? 'Female' : '—' },
  { label: 'City', value: profile.value?.city || '—' },
  { label: 'Country', value: profile.value?.country || '—' },
  { label: 'Weight', value: profile.value?.weight ? `${profile.value.weight} kg` : '—' },
  { label: 'Height', value: profile.value?.height ? `${profile.value.height} cm` : '—' },
])

const quickStats = computed(() => [
  { label: 'Weekly Sessions', value: String(stats.value?.effort?.weekSessions ?? '—'), acc: '#2563eb' },
  { label: 'Fastest Pace', value: distance.value.bestPace, acc: '#0891b2' },
  { label: 'Effort Rank', value: effortRank.value, acc: '#d97706' },
  { label: 'BMI', value: bmi.value ?? '—', sub: bmiCategoryLabel.value, acc: '#059669' },
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

/* Kartu spotlight — konsep "Clean Sky": putih bersih dgn aksen biru lembut
   (dulu tema "black hole" gelap; diganti supaya menyatu dgn halaman lain yang
   sekarang serba putih-biru, bukan satu-satunya kartu gelap di tengah app). */
.pf-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 26px;
  padding: 28px 20px 22px;
  background: #ffffff;
  color: #0f172a;
  box-shadow:
    inset 0 0 0 1px rgba(37, 99, 235, 0.14),
    0 24px 60px -30px rgba(15, 23, 42, 0.25),
    0 0 50px -30px rgba(37, 99, 235, 0.3);
}
/* Dua cahaya dekoratif di sudut berlawanan (biru + ungu) — supaya kartu putih
   ini tak terasa kotak polos, ada kedalaman tanpa mengorbankan keterbacaan. */
.pf-card::before {
  content: '';
  position: absolute; top: -25%; right: -15%; width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  pointer-events: none;
}
.pf-card::after {
  content: '';
  position: absolute; bottom: -20%; left: -15%; width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.pf-status {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #059669;
  font-size: 11.5px;
  font-weight: 700;
  margin-bottom: 18px;
}
.pf-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.22);
}

.pf-avatar-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-content: center;
  border: 3px solid rgba(37, 99, 235, 0.4);
  box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.1), 0 0 24px rgba(37, 99, 235, 0.25);
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
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
}

.pf-name {
  position: relative;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Barlow Condensed", system-ui, sans-serif;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.2px;
}
.pf-verified { flex-shrink: 0; }

.pf-role { position: relative; margin: 5px 0 0; font-size: 13px; color: rgba(15, 23, 42, 0.55); }

/* Statistik ringkas — tiap metrik jadi "pill" sendiri dengan warna aksen
   berbeda (bukan kolom teks rata dipisah garis tipis), senada dengan gaya
   kartu statistik di Beranda supaya terasa lebih "dashboard" & hidup. */
.pf-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  width: 100%;
  margin-top: 22px;
}
.pf-stat {
  position: relative;
  min-width: 0;
  padding: 11px 5px 9px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--acc, #2563eb) 10%, white);
  border: 1px solid color-mix(in srgb, var(--acc, #2563eb) 24%, transparent);
  overflow: hidden;
}
.pf-stat::before {
  content: '';
  position: absolute; left: 10px; right: 10px; top: 0; height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--acc, #2563eb);
  opacity: 0.85;
}
.pf-stat-value { margin: 0; font-size: 12.5px; font-weight: 700; color: color-mix(in srgb, var(--acc, #2563eb) 65%, #0f172a); letter-spacing: -0.1px; line-height: 1.25; white-space: nowrap; }
.pf-stat-sub { margin: 2px 0 0; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: color-mix(in srgb, var(--acc, #2563eb) 55%, transparent); white-space: nowrap; }
.pf-stat-label { margin: 4px 0 0; font-size: 10.5px; color: rgba(15, 23, 42, 0.55); line-height: 1.3; text-wrap: balance; }

/* Tab tersegmentasi (Info / Strava) */
.pf-tabs {
  position: relative;
  display: flex;
  gap: 4px;
  width: 100%;
  margin-top: 22px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.06);
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
  color: rgba(15, 23, 42, 0.55);
  transition: background 0.15s ease, color 0.15s ease;
}
.pf-tab.is-active { background: #ffffff; color: #1d4ed8; border: 1px solid rgba(37, 99, 235, 0.18); box-shadow: 0 4px 10px -6px rgba(15, 23, 42, 0.2); }

.pf-tab-content { position: relative; width: 100%; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }

.pf-linkrow {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.04);
  text-align: left;
}
.pf-linkrow-ic {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-content: center;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.pf-linkrow-ic--strava { color: #c2410c; }
.pf-linkrow-label { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: rgba(15, 23, 42, 0.6); }
.pf-linkrow-value { font-size: 13.5px; font-weight: 700; color: #0f172a; white-space: nowrap; }
.pf-linkrow-action {
  flex: 0 0 auto;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.1);
  padding: 7px 13px;
  border-radius: 999px;
}

/* CTA utama — oranye (brand Strava, ajak connect) atau putih bertepi (keluar) */
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
  background: linear-gradient(135deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 16px 32px -16px rgba(252, 76, 2, 0.5);
}
.pf-cta.is-logout { color: #2563eb; background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); }
.pf-cta.is-logout:hover { background: rgba(37, 99, 235, 0.22); }

/* Aksi cepat pengaturan — dulu cuma lingkaran ikon polos tanpa label, jadi
   fungsinya tak kelihatan. Sekarang jadi baris penuh dgn ikon + teks + panah,
   senada gaya "pf-linkrow" supaya jelas keduanya bisa diketuk & apa isinya. */
.pf-quick-icons { position: relative; display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 14px; }

/* Pemisah tipis antara aksi "edit" (data tubuh, password) & aksi sesi
   (hubungkan Strava / keluar) — dua kelompok fungsi beda sifat, jadi urutan
   & jaraknya dibuat terasa seperti dua grup, bukan ditumpuk begitu saja. */
.pf-divider { width: 100%; height: 1px; background: rgba(15, 23, 42, 0.08); margin-top: 18px; }
.pf-divider + .pf-cta { margin-top: 14px; }
.pf-divider + .pf-group-label { margin-top: 14px; }
/* Label kecil penanda grup "Pengaturan Akun" — supaya dua baris aksi di
   bawahnya jelas beda kategori dari daftar info di atasnya, bukan sambungan
   list yang sama. */
.pf-group-label {
  width: 100%;
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.4);
  text-align: left;
}
.pf-quick-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: rgba(37, 99, 235, 0.05);
  text-align: left;
  font-family: inherit;
  transition: background 0.15s ease;
}
.pf-quick-row:hover { background: rgba(37, 99, 235, 0.1); }
.pf-quick-row-ic {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-content: center;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.pf-quick-row-label { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 600; color: #0f172a; }
.pf-quick-row-chevron { flex: 0 0 auto; color: rgba(15, 23, 42, 0.35); }

/* Grafik jarak mingguan */
.pf-chart { display: flex; align-items: flex-end; gap: 8px; height: 96px; }
.pf-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.pf-chart-bar {
  width: 100%; max-width: 24px; border-radius: 6px; background: linear-gradient(180deg, #60a5fa, #2563eb);
  box-shadow: 0 0 12px -2px rgba(37, 99, 235, 0.4);
  transition: height 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
  animation: pf-bar-grow 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
}
@keyframes pf-bar-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.pf-chart-bar { transform-origin: bottom; }
.pf-chart-val { font-size: 10.5px; font-weight: 700; color: rgba(15, 23, 42, 0.7); height: 14px; white-space: nowrap; }
.pf-chart-label { font-size: 11px; font-weight: 700; color: rgba(15, 23, 42, 0.5); }
.pf-chart-label.is-today { color: #1d4ed8; }
.pf-chart-empty { margin: 12px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.55); text-align: center; }

.pf-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  cursor: pointer;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: background 0.15s ease;
}
.pf-danger:hover { background: rgba(37, 99, 235, 0.22); }
</style>
