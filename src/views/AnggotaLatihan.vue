<template>
  <div class="page-layout">
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

    <main class="main-content">
      <header class="top-header">
        <h1 class="page-title">Latihan Saya</h1>
        <div class="header-badge">{{ riwayat.length }} Sesi</div>
      </header>

      <div class="section-card" style="margin-top:24px;">
        <h2 class="section-title">Riwayat Latihan</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Durasi</th>
              <th>Catatan</th>
              <th>Hasil</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in riwayat" :key="r.id" style="cursor:pointer;" @click="lihatRincian">
              <td>{{ r.tanggal }}</td>
              <td><span class="badge" :class="r.jenis === 'Running' ? 'badge--blue' : 'badge--orange'">{{ r.jenis }}</span></td>
              <td>{{ r.durasi }}</td>
              <td style="color:#6b7280; font-size:13px;">{{ r.catatan }}</td>
              <td style="font-family:'JetBrains Mono', monospace; font-weight:700; color:#0f172a;">{{ r.hasil }}</td>
              <td>
                <button class="btn-rincian" @click.stop="lihatRincian">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  Rincian
                </button>
              </td>
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
const isPeringkatActive = computed(() => route.path.startsWith('/anggota/peringkat'))

function handleLogout() { logout(); router.push('/') }
function lihatRincian() { router.push('/anggota/latihan/rincian') }

const riwayat = [
  { id: 1,  tanggal: '18 Jul 2026', jenis: 'Running', durasi: '45 mnt', catatan: 'Lari pagi lingkar bandara', hasil: '7.2 km'  },
  { id: 2,  tanggal: '17 Jul 2026', jenis: 'Weight',  durasi: '60 mnt', catatan: 'Bench press & squat',       hasil: '72 kg'   },
  { id: 3,  tanggal: '15 Jul 2026', jenis: 'Running', durasi: '30 mnt', catatan: 'Interval sprint',           hasil: '5.0 km'  },
  { id: 4,  tanggal: '13 Jul 2026', jenis: 'Running', durasi: '50 mnt', catatan: 'Lari pagi + hill sprint',   hasil: '8.1 km'  },
  { id: 5,  tanggal: '11 Jul 2026', jenis: 'Weight',  durasi: '55 mnt', catatan: 'Deadlift & pull-up',        hasil: '70 kg'   },
  { id: 6,  tanggal: '10 Jul 2026', jenis: 'Running', durasi: '40 mnt', catatan: 'Lari sore tempa fisik',     hasil: '6.5 km'  },
  { id: 7,  tanggal: '8 Jul 2026',  jenis: 'Weight',  durasi: '45 mnt', catatan: 'Shoulder & tricep',         hasil: '65 kg'   },
  { id: 8,  tanggal: '6 Jul 2026',  jenis: 'Running', durasi: '60 mnt', catatan: 'Lari jarak jauh',           hasil: '10.4 km' },
]
</script>

<style scoped>
@import '../assets/layout.css';

.btn-rincian {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-rincian:hover {
  background: #fff7ed;
  border-color: #fc4c02;
  color: #fc4c02;
}
</style>
