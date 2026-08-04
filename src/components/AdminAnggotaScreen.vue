<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Data Anggota</p>
          <p class="mui-h-sub">Direktori anggota ARFF</p>
        </div>
      </div>
      <span class="mui-pill">{{ anggotaList.length }} Anggota</span>
    </header>

    <div class="an-search">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="search" type="text" placeholder="Cari nama anggota..." />
    </div>

    <div class="an-list">
      <article
        v-for="a in filteredAnggota"
        :key="a.id"
        class="an-card"
        role="button"
        tabindex="0"
        @click="goInspect(a.id)"
        @keyup.enter="goInspect(a.id)"
      >
        <div class="an-avatar">{{ a.name.split(' ').map(w => w[0]).join('').slice(0, 2) }}</div>
        <div class="an-body">
          <div class="an-top">
            <span class="an-name">{{ a.name }}</span>
            <span class="mui-tag" :class="a.aktif ? 'mui-tag--green' : 'mui-tag--gray'">{{ a.aktif ? 'Aktif' : 'Nonaktif' }}</span>
          </div>
          <p class="an-meta">{{ a.peran }} · {{ a.spesialisasi }}</p>
          <span class="an-id mui-mono">{{ a.memberId }}</span>
        </div>
        <svg class="an-chevron" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </article>
      <p v-if="filteredAnggota.length === 0" class="an-empty">Tidak ada data ditemukan.</p>
    </div>
  </div>

  <AdminTabBar />
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminParticipants } from '../composables/useAdminData.js'
import AdminTabBar from './AdminTabBar.vue'

const router = useRouter()
const search = ref('')

const initials = computed(() =>
  (authState.userName || 'Rahmat Hidayat').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

// Direktori peserta nyata dari Supabase.
const { participants } = useAdminParticipants()
const anggotaList = computed(() =>
  (participants.value || []).map((p) => ({
    id: p.athleteId,
    name: p.name || '—',
    aktif: true,
    peran: 'Atlet',
    spesialisasi: p.city || 'ARFF',
    memberId: `#${p.athleteId}`,
  })),
)

const filteredAnggota = computed(() =>
  anggotaList.value.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase())),
)

function goInspect(id) {
  router.push(`/admin/anggota/${id}`)
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.an-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid transparent;
  color: #57534e;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.an-search:focus-within {
  border-color: #fc4c02;
  box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.15);
}

.an-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-family: inherit;
  font-size: 14px;
  color: #1c1917;
}

.an-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.an-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.an-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(17, 18, 20, 0.45);
}

.an-avatar {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  color: #44403c;
  background: #f5f1ec;
}

.an-body { flex: 1; min-width: 0; }
.an-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.an-name { font-size: 14px; font-weight: 700; color: #1c1917; }
.an-meta { margin: 4px 0 6px; font-size: 12px; color: #57534e; }
.an-id { font-size: 11.5px; color: #a8a29e; }
.an-chevron { flex: 0 0 auto; color: #d6cfc8; }

.an-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #a8a29e;
  padding: 32px;
  font-size: 14px;
}
</style>
