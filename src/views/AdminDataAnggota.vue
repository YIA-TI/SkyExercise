<template>
  <div class="page-layout font-sans">
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
        <RouterLink to="/admin/peringkat/running" class="nav-item" :class="{ 'nav-item--active': isPeringkatActive }">
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
        <h1 class="page-title">Data Anggota</h1>
        <div class="header-badge">{{ anggotaList.length }} Anggota</div>
      </header>

      <div class="section-card" style="margin-top: 24px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <h2 class="section-title" style="margin:0;">Daftar Anggota ARFF</h2>
          <input v-model="search" placeholder="Cari nama..." style="padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; width:220px; color:#334155;" />
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>Peran</th>
              <th>ID Anggota</th>
              <th>Spesialisasi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in filteredAnggota" :key="a.id">
              <td>{{ i + 1 }}</td>
              <td style="font-weight:600; color:#1e293b;">{{ a.name }}</td>
              <td>{{ a.peran }}</td>
              <td><span class="id-badge">{{ a.memberId }}</span></td>
              <td>{{ a.spesialisasi }}</td>
              <td><span class="badge" :class="a.aktif ? 'badge--green' : 'badge--gray'">{{ a.aktif ? 'Aktif' : 'Tidak Aktif' }}</span></td>
            </tr>
            <tr v-if="filteredAnggota.length === 0">
              <td colspan="6" style="text-align:center; color:#9ca3af; padding:32px;">Tidak ada data ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authState, logout } from '../store/auth.js'

const router = useRouter()
const route = useRoute()
const search = ref('')

const initials = computed(() =>
  authState.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
)
const isPeringkatActive = computed(() => route.path.startsWith('/admin/peringkat'))

function handleLogout() { logout(); router.push('/') }

const anggotaList = [
  { id: 1,  name: 'Ahmad Fauzi',    peran: 'Koor / Lead',      memberId: 'AP-2019-0041', spesialisasi: 'Fire Rescue',    aktif: true  },
  { id: 2,  name: 'Budi Santoso',   peran: 'Junior Member',    memberId: 'AP-2020-0055', spesialisasi: 'Medical Support', aktif: true  },
  { id: 3,  name: 'Citra Dewi',     peran: 'Atlet',            memberId: 'AP-2021-0070', spesialisasi: 'Fire Rescue',    aktif: true  },
  { id: 4,  name: 'Dendi Pratama',  peran: 'Atlet',            memberId: 'AP-2018-0028', spesialisasi: 'Hazmat',         aktif: true  },
  { id: 5,  name: 'Eko Wahyudi',    peran: 'Pelatih / Coach',  memberId: 'AP-2016-0012', spesialisasi: 'Rescue',         aktif: true  },
  { id: 6,  name: 'Fitria Sari',    peran: 'Junior Member',    memberId: 'AP-2022-0083', spesialisasi: 'Medical Support', aktif: false },
  { id: 7,  name: 'Gilang Nugraha', peran: 'Senior Member',    memberId: 'AP-2017-0019', spesialisasi: 'Fire Rescue',    aktif: true  },
  { id: 8,  name: 'Hendra Kurnia',  peran: 'Senior Member',    memberId: 'AP-2019-0046', spesialisasi: 'Hazmat',         aktif: true  },
]

const filteredAnggota = computed(() =>
  anggotaList.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase()))
)
</script>

<style scoped>
@import '../assets/layout.css';
</style>
