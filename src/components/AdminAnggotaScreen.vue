<template>
<div class="mui">
  <div class="mui-col mui-col--full">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Data Anggota</p>
          <p class="mui-h-sub">Direktori anggota ARFF</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && participants" />
      <span v-else class="mui-pill">{{ anggotaList.length }} Anggota</span>
    </header>

    <div class="an-search">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="search" type="text" placeholder="Cari nama anggota..." />
    </div>

    <div v-if="loading && !participants" class="an-list">
      <article v-for="i in 6" :key="i" class="an-card">
        <div class="mui-skel mui-skel--circle" style="width: 48px; height: 48px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 60%; margin-top: 10px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 40%; margin-top: 6px;"></div>
      </article>
    </div>
    <div v-else class="an-list">
      <article
        v-for="a in filteredAnggota"
        :key="a.id"
        class="an-card"
        role="button"
        tabindex="0"
        :style="{ '--seed': avatarColor(a.name) }"
        @click="goInspect(a.id)"
        @keyup.enter="goInspect(a.id)"
      >
        <div class="an-card-top">
          <div class="an-avatar">
            <img v-if="a.avatar && !brokenAvatars.has(a.id)" :src="a.avatar" class="an-avatar-img" alt="" @error="brokenAvatars.add(a.id)" />
            <template v-else>{{ initialsOf(a.name) }}</template>
            <span class="an-avatar-dot" :class="a.aktif ? 'is-on' : 'is-off'"></span>
          </div>
          <span class="mui-tag" :class="a.aktif ? 'mui-tag--green' : 'mui-tag--gray'">{{ a.aktif ? 'Aktif' : 'Nonaktif' }}</span>
        </div>

        <p class="an-name">{{ a.name }}</p>
        <span class="an-role">{{ a.peran }}</span>

        <div class="an-meta-grid">
          <div class="an-meta-item">
            <span class="an-meta-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Kota
            </span>
            <span class="an-meta-value">{{ a.city || '—' }}</span>
          </div>
          <div class="an-meta-item">
            <span class="an-meta-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              ID Anggota
            </span>
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
</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminParticipants } from '../composables/useAdminData.js'
import RefreshingBadge from './RefreshingBadge.vue'

const router = useRouter()
const search = ref('')

// Avatar dgn URL rusak/tak termuat dulu nongol sbg ikon broken-image bawaan
// browser (jelek) — sekarang jatuh ke inisial begitu <img> gagal load, sama
// spt pola yg sudah dipakai di layar member/peringkat lain.
const brokenAvatars = reactive(new Set())

const initials = computed(() =>
  (authState.userName || 'Rahmat Hidayat').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

function initialsOf(name) {
  return (name || '—').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Semua avatar dulu satu biru rata buat siapapun — monoton kalau direktorinya
// panjang. Warna dipilih deterministik dari nama (hash sederhana) supaya tiap
// orang selalu dapat warna yang sama tiap render, bukan acak tiap reload.
const AVATAR_PALETTE = ['#2563eb', '#7c3aed', '#0d9488', '#d97706', '#e11d48', '#0891b2']
function avatarColor(name) {
  let hash = 0
  for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

// Direktori peserta nyata dari Supabase.
const { participants, loading } = useAdminParticipants()
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
  border: 1.5px solid rgba(37, 99, 235, 0.14);
  color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.an-search:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.an-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-family: inherit;
  font-size: 14px;
  color: #0f172a;
}

.an-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.an-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
/* Aksen tepi atas kartu ikut warna avatar orangnya — biar grid direktori
   yg panjang tak terasa satu warna semua. */
.an-card::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: var(--seed, #2563eb);
  opacity: 0.85;
}

.an-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(15, 23, 42, 0.2);
}

.an-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* Avatar dulu kotak flat tinta tipis — sekarang lingkaran gradasi pekat +
   cincin glow warna senada, lebih terasa "profil orang" drpd ikon generik. */
.an-avatar {
  position: relative;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  color: #ffffff;
  background: linear-gradient(135deg, var(--seed, #2563eb) 0%, color-mix(in srgb, var(--seed, #2563eb) 55%, white) 100%);
  box-shadow: 0 6px 14px -8px var(--seed, #2563eb);
}

.an-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
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

.an-avatar-dot.is-on { background: #059669; box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.35); }
.an-avatar-dot.is-off { background: #a8a29e; box-shadow: 0 0 0 1px rgba(168, 162, 158, 0.35); }

.an-name { margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; }
/* Peran sebagai pil berwarna senada avatar — identitas warna orangnya
   konsisten dari atas (garis tepi kartu) sampai sini, bukan teks abu polos. */
.an-role {
  display: inline-block;
  margin: 4px 0 10px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--seed, #1d4ed8);
  background: color-mix(in srgb, var(--seed, #2563eb) 12%, white);
}

.an-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.an-meta-item { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.an-meta-label { display: flex; align-items: center; gap: 4px; font-size: 10.5px; color: rgba(15, 23, 42, 0.5); }
.an-meta-value { font-size: 12.5px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.an-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.an-contact-value {
  font-size: 12.5px;
  color: rgba(15, 23, 42, 0.6);
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
  color: rgba(15, 23, 42, 0.4);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.an-copy-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  color: rgba(15, 23, 42, 0.7);
}

.an-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: rgba(15, 23, 42, 0.5);
  padding: 32px;
  font-size: 14px;
}
</style>
