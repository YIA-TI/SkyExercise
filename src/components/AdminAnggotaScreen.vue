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
        <div class="an-card-top">
          <div class="an-avatar">
            <img v-if="a.avatar" :src="a.avatar" class="an-avatar-img" alt="" />
            <template v-else>{{ initialsOf(a.name) }}</template>
            <span class="an-avatar-dot" :class="a.aktif ? 'is-on' : 'is-off'"></span>
          </div>
          <span class="mui-tag" :class="a.aktif ? 'mui-tag--green' : 'mui-tag--gray'">{{ a.aktif ? 'Aktif' : 'Nonaktif' }}</span>
        </div>

        <p class="an-name">{{ a.name }}</p>
        <p class="an-role">{{ a.peran }}</p>

        <div class="an-meta-grid">
          <div class="an-meta-item">
            <span class="an-meta-label">Kota</span>
            <span class="an-meta-value">{{ a.city || '—' }}</span>
          </div>
          <div class="an-meta-item">
            <span class="an-meta-label">ID Anggota</span>
            <span class="an-meta-value mui-mono">{{ a.memberId }}</span>
          </div>
        </div>

        <div v-if="a.username" class="an-contact">
          <span class="an-contact-value">@{{ a.username }}</span>
          <button
            type="button"
            class="an-copy-btn"
            :aria-label="`Salin username ${a.username}`"
            @click.stop="copyUsername(a)"
          >
            <svg v-if="copiedId !== a.id" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
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

function initialsOf(name) {
  return (name || '—').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Direktori peserta nyata dari Supabase.
const { participants } = useAdminParticipants()
const anggotaList = computed(() =>
  (participants.value || []).map((p) => ({
    id: p.athleteId,
    name: p.name || '—',
    avatar: p.avatar,
    username: p.username,
    aktif: true,
    peran: 'Atlet',
    city: p.city,
    memberId: `#${p.athleteId}`,
  })),
)

const filteredAnggota = computed(() =>
  anggotaList.value.filter(a => a.name.toLowerCase().includes(search.value.toLowerCase())),
)

function goInspect(id) {
  router.push(`/admin/anggota/${id}`)
}

const copiedId = ref(null)
async function copyUsername(a) {
  try {
    await navigator.clipboard.writeText(a.username)
    copiedId.value = a.id
    setTimeout(() => {
      if (copiedId.value === a.id) copiedId.value = null
    }, 1500)
  } catch {
    // Clipboard API tidak tersedia (mis. bukan konteks aman) — abaikan diam-diam.
  }
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.an-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.an-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(17, 18, 20, 0.45);
}

.an-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.an-avatar {
  position: relative;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  color: #44403c;
  background: #f5f1ec;
}

.an-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.an-avatar-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.an-avatar-dot.is-on { background: #059669; }
.an-avatar-dot.is-off { background: #a8a29e; }

.an-name { font-size: 15px; font-weight: 700; color: #1c1917; }
.an-role { margin: 0 0 10px; font-size: 12.5px; color: #78716c; }

.an-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  padding: 10px 0;
  border-top: 1px solid #f0ece6;
}

.an-meta-item { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.an-meta-label { font-size: 10.5px; color: #a8a29e; }
.an-meta-value { font-size: 12.5px; font-weight: 600; color: #292524; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.an-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f0ece6;
}

.an-contact-value {
  font-size: 12.5px;
  color: #57534e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.an-copy-btn {
  flex: 0 0 auto;
  display: grid;
  place-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #a8a29e;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.an-copy-btn:hover {
  background: #f5f1ec;
  color: #57534e;
}

.an-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #a8a29e;
  padding: 32px;
  font-size: 14px;
}
</style>
