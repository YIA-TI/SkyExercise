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
        <RouterLink to="/anggota/latihan" class="nav-item nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          Latihan Saya
        </RouterLink>
        <RouterLink to="/anggota/peringkat/running" class="nav-item">
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

    <!-- Main -->
    <main class="main-content">
      <!-- Breadcrumb -->
      <div class="rl-breadcrumb">
        <RouterLink to="/anggota/latihan" class="rl-breadcrumb-link">Latihan</RouterLink>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="rl-breadcrumb-current">Rincian Latihan</span>
      </div>

      <div class="rl-content">

        <!-- ── Session Info Card ── -->
        <div class="rl-session-card">
          <div class="rl-session-left">
            <div class="rl-session-title">{{ sesi.judul }}</div>
            <div class="rl-session-meta">
              <span class="rl-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ sesi.waktu }}
              </span>
              <span class="rl-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {{ sesi.jenis }}
              </span>
            </div>
          </div>
          <div class="rl-strava-badge">
            <span class="rl-strava-dot"></span>
            Sinkronisasi Strava Aktif
          </div>
        </div>

        <!-- ── 4 Summary Cards ── -->
        <div class="rl-summary-grid">
          <div class="rl-summary-card">
            <div class="rl-summary-label">
              Jarak Total
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fc4c02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="rl-summary-value">{{ sesi.jarakTotal }} <span class="rl-summary-unit">KM</span></div>
          </div>
          <div class="rl-summary-card">
            <div class="rl-summary-label">
              Total Beban
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fc4c02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>
            </div>
            <div class="rl-summary-value">{{ sesi.totalBeban }} <span class="rl-summary-unit">KG</span></div>
          </div>
          <div class="rl-summary-card">
            <div class="rl-summary-label">
              Detak Jantung Rata-rata
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div class="rl-summary-value" style="color:#ef4444;">{{ sesi.bpmRataRata }} <span class="rl-summary-unit">BPM</span></div>
          </div>
          <div class="rl-summary-card">
            <div class="rl-summary-label">
              Durasi Sesi
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fc4c02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="rl-summary-value">{{ sesi.durasi }} <span class="rl-summary-unit">MENIT</span></div>
          </div>
        </div>

        <!-- ── Row: Grafik + Tabel Rincian Lari ── -->
        <div class="rl-row">

          <!-- Grafik Performa Lari -->
          <div class="rl-card rl-card--chart">
            <div class="rl-chart-header">
              <span class="rl-card-title">Grafik Performa Lari</span>
              <div class="rl-legend">
                <span class="rl-legend-item rl-legend--orange">
                  <span class="rl-legend-dot" style="background:#fc4c02;"></span>Heart Rate
                </span>
                <span class="rl-legend-item rl-legend--dark">
                  <span class="rl-legend-dot" style="background:#1e293b;"></span>Pace
                </span>
              </div>
            </div>

            <!-- Chart Area -->
            <div class="rl-chart-wrap">
              <svg class="rl-chart-svg" viewBox="0 0 520 160" preserveAspectRatio="none">
                <!-- Bars -->
                <g>
                  <rect v-for="(bar, i) in chartBars" :key="'b'+i"
                    :x="bar.x" :y="160 - bar.h" :width="bar.w" :height="bar.h"
                    fill="#fc4c02" opacity="0.5" rx="2"/>
                </g>
                <!-- HR Line -->
                <polyline
                  :points="hrLinePoints"
                  fill="none" stroke="#fc4c02" stroke-width="2.5"
                  stroke-linejoin="round" stroke-linecap="round"/>
                <!-- Pace Line -->
                <polyline
                  :points="paceLinePoints"
                  fill="none" stroke="#1e293b" stroke-width="1.5"
                  stroke-dasharray="4,3"
                  stroke-linejoin="round" stroke-linecap="round"/>
              </svg>

              <!-- X axis labels -->
              <div class="rl-chart-xaxis">
                <span>0km</span><span>2km</span><span>4km</span>
                <span>6km</span><span>8km</span><span>8.4km</span>
              </div>
            </div>

            <!-- Stats bawah chart -->
            <div class="rl-chart-stats">
              <div class="rl-chart-stat">
                <div class="rl-chart-stat-label">HR Maksimum</div>
                <div class="rl-chart-stat-value">{{ sesi.hrMax }} bpm</div>
              </div>
              <div class="rl-chart-stat">
                <div class="rl-chart-stat-label">Pace Terbaik</div>
                <div class="rl-chart-stat-value">{{ sesi.paceTerbaik }}</div>
              </div>
              <div class="rl-chart-stat">
                <div class="rl-chart-stat-label">Elevasi</div>
                <div class="rl-chart-stat-value">{{ sesi.elevasi }} m</div>
              </div>
            </div>
          </div>

          <!-- Rincian Lari per KM -->
          <div class="rl-card rl-card--km">
            <div class="rl-card-title-row">
              <span class="rl-card-title">Rincian Lari</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <table class="rl-km-table">
              <thead>
                <tr>
                  <th>KM</th>
                  <th>WAKTU</th>
                  <th>RITME</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="km in kmData" :key="km.km">
                  <td class="rl-km-num">{{ km.km }}</td>
                  <td>{{ km.waktu }}</td>
                  <td>
                    <div class="rl-ritme-cell">
                      {{ km.ritme }}
                      <span class="rl-ritme-dot" :style="{ background: km.color }"></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Weight Training Section ── -->
        <div class="rl-card rl-card--weight">
          <div class="rl-weight-header">
            <div class="rl-weight-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fc4c02" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              Performa Weight Training
            </div>
            <div class="rl-volume-badge">Volume Total: {{ sesi.volumeTotal }}</div>
          </div>

          <div class="rl-exercise-grid">
            <div v-for="ex in weightData" :key="ex.nama" class="rl-exercise-card">
              <div class="rl-ex-name">{{ ex.nama }}</div>
              <div class="rl-ex-sets">
                <div v-for="(set, si) in ex.sets" :key="si" class="rl-ex-set-row">
                  <span class="rl-ex-set-label">Set {{ si + 1 }}: {{ set.beban }}kg</span>
                  <span class="rl-ex-reps">{{ set.reps }} Reps</span>
                </div>
              </div>
              <div class="rl-ex-footer">
                <span class="rl-ex-bpm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {{ ex.bpm }} bpm
                </span>
                <span class="rl-ex-rest">Rest: {{ ex.rest }}</span>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /rl-content -->
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

// ── Dummy session data ──────────────────────────────────────────
const sesi = {
  judul:        'Latihan Pagi - ARFF Training Center',
  waktu:        'Hari ini, 06:15 WIB',
  jenis:        'Sesi Kombinasi: Running & Weight Training',
  jarakTotal:   '8.42',
  totalBeban:   '2,450',
  bpmRataRata:  158,
  durasi:       '75:10',
  hrMax:        178,
  paceTerbaik:  '4:58 /km',
  elevasi:      12,
  volumeTotal:  '2.45 Ton',
}

// ── KM Split data ───────────────────────────────────────────────
const kmData = [
  { km: 1, waktu: '5:32', ritme: '5:32', color: '#f97316' },
  { km: 2, waktu: '5:28', ritme: '5:28', color: '#22c55e' },
  { km: 3, waktu: '5:25', ritme: '5:25', color: '#22c55e' },
  { km: 4, waktu: '5:20', ritme: '5:20', color: '#f97316' },
]

// ── Chart bars (17 bars across 520px) ──────────────────────────
// heights represent heart rate intensity across 8.4km
const barHeights = [55, 70, 88, 100, 112, 118, 124, 128, 130, 132, 128, 122, 115, 108, 98, 85, 68]
const chartBars = barHeights.map((h, i) => ({
  x: i * 30 + 4,
  y: 160 - h,
  w: 26,
  h,
}))

// HR line points (smooth curve through bar tops)
const hrLinePoints = computed(() =>
  barHeights.map((h, i) => `${i * 30 + 17},${160 - h}`).join(' ')
)

// Pace line points (inverse curve â€” lower pace = better)
const paceHeights = [95, 90, 85, 80, 78, 76, 75, 74, 76, 78, 80, 82, 85, 88, 90, 92, 95]
const paceLinePoints = computed(() =>
  paceHeights.map((h, i) => `${i * 30 + 17},${160 - h}`).join(' ')
)

// ── Weight Training data ────────────────────────────────────────
const weightData = [
  {
    nama: 'BENCH PRESS',
    sets: [
      { beban: 60, reps: 12 },
      { beban: 70, reps: 10 },
      { beban: 75, reps: 8  },
    ],
    bpm:  142,
    rest: '60s',
  },
  {
    nama: 'BARBELL SQUAT',
    sets: [
      { beban: 80,  reps: 10 },
      { beban: 90,  reps: 8  },
      { beban: 100, reps: 6  },
    ],
    bpm:  165,
    rest: '90s',
  },
  {
    nama: 'DEADLIFT',
    sets: [
      { beban: 100, reps: 5 },
      { beban: 110, reps: 5 },
      { beban: 120, reps: 3 },
    ],
    bpm:  172,
    rest: '120s',
  },
]
</script>

<style scoped>
@import '../assets/layout.css';

/* ─── Breadcrumb ─── */
.rl-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 32px 0;
  font-size: 13px;
}
.rl-breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s;
}
.rl-breadcrumb-link:hover { color: #fc4c02; }
.rl-breadcrumb-current { color: #fc4c02; font-weight: 600; }

/* ─── Content wrapper ─── */
.rl-content {
  padding: 16px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── Session Card ─── */
.rl-session-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.rl-session-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}
.rl-session-meta {
  display: flex;
  gap: 16px;
}
.rl-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
}
.rl-strava-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fc4c02;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 20px;
  padding: 5px 14px;
  white-space: nowrap;
}
.rl-strava-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fc4c02;
  display: inline-block;
}

/* ─── Summary Grid ─── */
.rl-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.rl-summary-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px 20px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.rl-summary-card:hover {
  box-shadow: 0 8px 20px rgba(15,23,42,0.08);
  transform: translateY(-1px);
}
.rl-summary-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 10px;
}
.rl-summary-value {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1;
}
.rl-summary-unit {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  margin-left: 2px;
}

/* ─── Row layout ─── */
.rl-row {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 16px;
}

/* ─── Shared card ─── */
.rl-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 20px;
}
.rl-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.rl-card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* ─── Chart ─── */
.rl-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.rl-legend {
  display: flex;
  gap: 14px;
}
.rl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
}
.rl-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.rl-chart-wrap {
  margin-bottom: 12px;
}
.rl-chart-svg {
  width: 100%;
  height: 160px;
  display: block;
}
.rl-chart-xaxis {
  display: flex;
  justify-content: space-between;
  padding: 4px 0 0;
  font-size: 11px;
  color: #9ca3af;
}
.rl-chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
  margin-top: 4px;
}
.rl-chart-stat-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}
.rl-chart-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

/* ─── KM Table ─── */
.rl-km-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rl-km-table th {
  text-align: left;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f3f4f6;
}
.rl-km-table td {
  padding: 10px 8px;
  color: #374151;
  border-bottom: 1px solid #f9fafb;
  font-size: 14px;
}
.rl-km-num {
  font-weight: 700;
  color: #111827;
}
.rl-ritme-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.rl-ritme-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ─── Weight Training ─── */
.rl-weight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.rl-weight-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.rl-volume-badge {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 5px 14px;
}
.rl-exercise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.rl-exercise-card {
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fff7ed;
}
.rl-ex-name {
  font-size: 12px;
  font-weight: 800;
  color: #9a3412;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.rl-ex-sets {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.rl-ex-set-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #374151;
}
.rl-ex-reps {
  font-weight: 700;
  color: #111827;
}
.rl-ex-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  border-top: 1px solid #fed7aa;
  padding-top: 8px;
}
.rl-ex-bpm {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
}
.rl-ex-rest {
  color: #6b7280;
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .rl-row {
    grid-template-columns: 1fr;
  }
  .rl-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .rl-exercise-grid {
    grid-template-columns: 1fr;
  }
}
</style>
