<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <button class="ins-back" type="button" aria-label="Kembali" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">{{ member ? member.name : 'Anggota' }}</p>
          <p class="mui-h-sub" v-if="member">{{ member.peran }} · {{ member.spesialisasi }}</p>
        </div>
      </div>
      <span v-if="member" class="mui-tag" :class="member.aktif ? 'mui-tag--green' : 'mui-tag--gray'">{{ member.aktif ? 'Aktif' : 'Nonaktif' }}</span>
    </header>

    <template v-if="member">
      <!-- Filter tanggal — jadi dasar semua ringkasan & daftar di bawah -->
      <section class="mui-block">
        <h2 class="mui-section-title">Periode</h2>
        <DateRangeFilter v-model:start="filterStart" v-model:end="filterEnd" />
      </section>

      <!-- Kartu spotlight: identitas + statistik + info, satu panel gelap -->
      <div class="ins-card">
        <span class="ins-card-status" :class="{ 'is-off': !member.aktif }">
          <span class="ins-card-status-dot"></span>
          {{ member.aktif ? 'Aktif Bertugas' : 'Nonaktif' }}
        </span>

        <div class="ins-card-avatar-wrap">
          <img v-if="member.avatar" :src="member.avatar" class="ins-card-avatar-img" alt="" />
          <div v-else class="ins-card-avatar-fallback">{{ initials }}</div>
        </div>

        <p class="ins-card-name">
          {{ member.name }}
          <svg class="ins-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fc4c02" aria-hidden="true">
            <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
            <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </p>
        <p class="ins-card-role">{{ member.peran }} {{ member.spesialisasi }} · {{ member.city }}</p>

        <div class="ins-card-stats">
          <div v-for="q in quickStats" :key="q.label" class="ins-card-stat">
            <p class="ins-card-stat-value mui-mono">{{ q.value }}</p>
            <p class="ins-card-stat-label">{{ q.label }}</p>
          </div>
        </div>

        <div class="ins-card-tabs" role="tablist">
          <button
            v-for="t in cardTabs" :key="t.key" class="ins-card-tab" type="button" role="tab"
            :class="{ 'is-active': activeCardTab === t.key }" :aria-selected="activeCardTab === t.key"
            @click="activeCardTab = t.key"
          >{{ t.label }}</button>
        </div>

        <div class="ins-card-tab-content">
          <template v-if="activeCardTab === 'info'">
            <div v-for="info in infoDiri" :key="info.label" class="ins-card-linkrow">
              <span class="ins-card-linkrow-label">{{ info.label }}</span>
              <span class="ins-card-linkrow-value">{{ info.value }}</span>
            </div>
          </template>
          <template v-else>
            <div class="ins-card-linkrow">
              <span class="ins-card-linkrow-label">Data lari/gym ditarik langsung dari akun Strava atlet ini.</span>
            </div>
          </template>
        </div>

        <button class="ins-card-cta" type="button" :disabled="syncingStrava" @click="syncFromStrava()">
          <svg class="ins-sync-ic" :class="{ 'is-spinning': syncingStrava }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {{ syncingStrava ? 'Mengambil…' : 'Ambil dari Strava' }}
        </button>
      </div>

      <!-- Grafik jarak per sesi lari (dalam periode dipilih) -->
      <section class="mui-block">
        <h2 class="mui-section-title">Jarak per Sesi Lari</h2>
        <div class="mui-card">
          <div class="ins-chart">
            <div v-for="(h, i) in member.bars" :key="i" class="ins-chart-col">
              <span class="ins-chart-bar" :style="{ height: h + '%' }"></span>
              <span class="ins-chart-label">{{ member.barLabels[i] }}</span>
            </div>
            <p v-if="member.bars.length === 0" class="ins-act-empty">Tidak ada sesi lari pada periode ini.</p>
          </div>
        </div>
      </section>

      <!-- Aktivitas + filter -->
      <section class="mui-block">
        <div class="ins-act-head">
          <h2 class="mui-section-title">Aktivitas</h2>
          <span class="mui-tag mui-tag--gray">{{ filteredActivities.length }} aktivitas</span>
        </div>

        <div class="ins-filter-row">
          <button
            v-for="f in filters"
            :key="f"
            class="ins-filter-chip"
            :class="{ 'is-active': activeFilter === f }"
            @click="activeFilter = f"
          >{{ f }}</button>
        </div>

        <div class="ins-act-list ins-act-list--scroll">
          <div v-for="(act, i) in filteredActivities" :key="i" class="ins-act-item">
            <span class="ins-act-ic" :class="act.type === 'Lari' ? 'is-orange' : 'is-blue'" v-html="act.type === 'Lari' ? icons.run : icons.gym"></span>
            <div class="ins-act-body">
              <p class="ins-act-name">{{ act.name }}</p>
              <p class="ins-act-meta">{{ act.meta }}</p>
            </div>
            <span class="ins-act-date mui-mono">{{ act.date }}</span>
          </div>
          <p v-if="filteredActivities.length === 0 && syncingStrava" class="ins-act-empty">Mengambil data dari Strava…</p>
          <p v-else-if="filteredActivities.length === 0" class="ins-act-empty">Tidak ada aktivitas untuk filter ini.</p>
        </div>
      </section>
    </template>

    <p v-else class="ins-notfound">Data anggota tidak ditemukan.</p>
  </div>

  <AdminTabBar />
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminParticipantDetail } from '../composables/useAdminData.js'
import { syncParticipantStrava } from '../services/admin.js'
import { showToast } from '../store/toast.js'
import { calcBmi, bmiCategory, daysAgoDateStr, toDateStr } from '../lib/normalize.js'
import AdminTabBar from './AdminTabBar.vue'
import DateRangeFilter from './DateRangeFilter.vue'

const route = useRoute()
const router = useRouter()

const athleteId = computed(() => Number(route.params.id))
const filterStart = ref(daysAgoDateStr(30))
const filterEnd = ref(toDateStr(new Date()))
const { detail, refresh: refreshDetail } = useAdminParticipantDetail(athleteId, { start: filterStart, end: filterEnd })

const cardTabs = [
  { key: 'info', label: 'Info' },
  { key: 'strava', label: 'Strava' },
]
const activeCardTab = ref('info')

// Tarik langsung dari Strava (Edge Function `strava-sync`) kalau data lokal kosong —
// dicoba sekali per kunjungan atlet, supaya klik "lihat anggota" langsung menampilkan
// data lengkap meski belum pernah/lagi tersinkron. Tombol manual tetap ada di UI.
const syncingStrava = ref(false)
const autoSyncAttempted = ref(false)
watch(athleteId, () => {
  autoSyncAttempted.value = false
  activeCardTab.value = 'info'
})

async function syncFromStrava() {
  if (syncingStrava.value) return
  syncingStrava.value = true
  try {
    await syncParticipantStrava(athleteId.value)
    await refreshDetail()
    showToast('Data berhasil diambil dari Strava')
  } catch (e) {
    showToast(e?.message || 'Gagal mengambil data dari Strava — pastikan atlet sudah terhubung', 'error')
  } finally {
    syncingStrava.value = false
  }
}

watch(detail, (d) => {
  if (d?.profile && (d.activities || []).length === 0 && !autoSyncAttempted.value) {
    autoSyncAttempted.value = true
    syncFromStrava()
  }
})

const MAX_BARS = 14 // batasi jumlah bar biar grafik tak melebar tak terkendali di rentang panjang

// Bentuk `member` dari data nyata (profil + aktivitas dalam periode filter), lengkap
// dengan agregat ringkas — semuanya mengikuti rentang tanggal yang dipilih admin.
const member = computed(() => {
  const d = detail.value
  if (!d?.profile) return null
  const acts = d.activities || []
  const runs = acts.filter((a) => a.type === 'run')
  const distanceKm = runs.reduce((s, a) => s + (a.distanceKm || 0), 0)
  const maxKm = Math.max(1, ...runs.map((a) => a.distanceKm || 0))
  const barRuns = runs.slice(0, MAX_BARS).reverse()
  const last = acts[0]
  return {
    name: d.profile.name,
    avatar: d.profile.avatar,
    peran: 'Atlet',
    spesialisasi: 'ARFF',
    city: d.profile.city || '—',
    aktif: true,
    memberId: `#${d.profile.athleteId}`,
    weight: d.profile.weight ? `${d.profile.weight} kg` : '—',
    joined: '—',
    bars: barRuns.map((a) => Math.round(((a.distanceKm || 0) / maxKm) * 100)),
    barLabels: barRuns.map((a) => new Date(a.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    stats: {
      distanceKm: distanceKm.toFixed(1),
      avgHr: last?.avgHeartrate ? Math.round(last.avgHeartrate) : '—',
      effort: last?.sufferScore ?? '—',
      bmi: calcBmi(d.profile.weight, d.profile.height),
    },
    activities: acts.map((a) => ({
      type: a.type === 'run' ? 'Lari' : 'Gym',
      name: a.name,
      meta: a.type === 'run'
        ? `${a.distanceKm ?? '—'} km · ${a.durationLabel ?? '—'}`
        : `${a.durationLabel ?? '—'} · ${a.avgHeartrate ? Math.round(a.avgHeartrate) + ' bpm' : '—'}`,
      date: a.startDate ? new Date(a.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—',
    })),
  }
})

const initials = computed(() =>
  member.value ? member.value.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '',
)

function kembali() {
  router.push('/admin/anggota')
}

const icons = {
  run: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  gym: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>',
  distance: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  heart: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  effort: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
}

const quickStats = computed(() => {
  if (!member.value) return []
  const s = member.value.stats
  return [
    { label: 'Km pada Periode', value: s.distanceKm, cls: 'is-orange', icon: icons.distance },
    { label: 'Rata HR (bpm)', value: String(s.avgHr), cls: 'is-blue', icon: icons.heart },
    { label: 'Relative Effort', value: String(s.effort), cls: 'is-green', icon: icons.effort },
    { label: 'BMI', value: s.bmi != null ? `${s.bmi} · ${bmiCategory(s.bmi)}` : '—', cls: 'is-purple', icon: icons.gym },
  ]
})

const infoDiri = computed(() => {
  if (!member.value) return []
  const m = member.value
  return [
    { label: 'ID Anggota', value: m.memberId },
    { label: 'Peran', value: m.peran },
    { label: 'Spesialisasi', value: m.spesialisasi },
    { label: 'Kota', value: m.city },
    { label: 'Berat Badan', value: m.weight },
    { label: 'Bergabung', value: m.joined },
    { label: 'Status', value: m.aktif ? 'Aktif Bertugas' : 'Nonaktif' },
  ]
})

const filters = ['Semua', 'Lari', 'Gym']
const activeFilter = ref('Semua')

const filteredActivities = computed(() => {
  if (!member.value) return []
  return activeFilter.value === 'Semua'
    ? member.value.activities
    : member.value.activities.filter(a => a.type === activeFilter.value)
})
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.ins-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  place-content: center;
  color: #1c1917;
  background: #f5f1ec;
  border: 1px solid #ece7e2;
}

/* Kartu spotlight — identitas + statistik + info, panel gelap ala reactbits
   "Profile 5" (samakan dgn ProfilScreen.vue anggota, prefiks .ins- di sini). */
.ins-card {
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
.ins-card::before {
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

.ins-card-status {
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
.ins-card-status.is-off { background: rgba(168, 162, 158, 0.15); border-color: rgba(168, 162, 158, 0.35); color: #d6cfc8; }
.ins-card-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25); }
.ins-card-status.is-off .ins-card-status-dot { background: #a8a29e; box-shadow: 0 0 0 3px rgba(168, 162, 158, 0.25); }

.ins-card-avatar-wrap {
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
.ins-card-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.ins-card-avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.ins-card-name {
  position: relative;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Chakra Petch", system-ui, sans-serif;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.2px;
}
.ins-verified { flex-shrink: 0; }

.ins-card-role { position: relative; margin: 5px 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6); }

.ins-card-stats {
  position: relative;
  display: flex;
  width: 100%;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.ins-card-stat { flex: 1; min-width: 0; padding: 0 4px; border-right: 1px solid rgba(255, 255, 255, 0.08); }
.ins-card-stat:last-child { border-right: none; }
.ins-card-stat-value { margin: 0; font-size: 12.5px; font-weight: 700; color: #ffffff; letter-spacing: -0.1px; line-height: 1.25; overflow-wrap: break-word; }
.ins-card-stat-label { margin: 4px 0 0; font-size: 9px; color: rgba(255, 255, 255, 0.45); line-height: 1.3; }

.ins-card-tabs {
  position: relative;
  display: flex;
  gap: 4px;
  width: 100%;
  margin-top: 22px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}
.ins-card-tab {
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
.ins-card-tab.is-active { background: #ffffff; color: #1c1917; }

.ins-card-tab-content { position: relative; width: 100%; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }

.ins-card-linkrow {
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
.ins-card-linkrow-label { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.ins-card-linkrow-value { font-size: 13.5px; font-weight: 700; color: #ffffff; white-space: nowrap; }

.ins-card-cta {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 18px;
  padding: 15px;
  border: none;
  cursor: pointer;
  border-radius: 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 16px 32px -16px rgba(252, 76, 2, 0.7);
  transition: transform 0.15s ease;
}
.ins-card-cta:hover:not(:disabled) { transform: translateY(-1px); }
.ins-card-cta:disabled { opacity: 0.65; cursor: default; }

/* Grafik jarak */
.ins-chart { display: flex; align-items: flex-end; gap: 8px; height: 96px; }
.ins-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.ins-chart-bar { width: 100%; max-width: 24px; border-radius: 6px; background: linear-gradient(180deg, #ff914d, #fc4c02); }
.ins-chart-label { font-size: 10.5px; color: #a8a29e; }

/* Aktivitas + filter */
.ins-act-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }

.ins-sync-ic { flex-shrink: 0; }
.ins-sync-ic.is-spinning { animation: ins-sync-spin 0.9s linear infinite; }
@keyframes ins-sync-spin { to { transform: rotate(360deg); } }

.ins-filter-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.ins-filter-row::-webkit-scrollbar { display: none; }

.ins-filter-chip {
  flex: 0 0 auto;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 999px;
  background: #ffffff;
  color: #57534e;
  transition: all 0.15s ease;
  box-shadow: 0 10px 24px -20px rgba(17, 18, 20, 0.5);
}

.ins-filter-chip.is-active {
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.ins-act-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-content: start;
  gap: 10px;
  margin-top: 12px;
}

/* Log lengkap tanpa paginasi — dibatasi tinggi & scroll sendiri biar halaman tak melar. */
.ins-act-list--scroll {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}

.ins-act-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.ins-act-ic { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-content: center; }
.ins-act-ic.is-orange { background: #ffedd5; color: #ea580c; }
.ins-act-ic.is-blue   { background: #ccfbf1; color: #0f766e; }

.ins-act-body { flex: 1; min-width: 0; }
.ins-act-name { margin: 0; font-size: 13.5px; font-weight: 700; color: #1c1917; }
.ins-act-meta { margin: 3px 0 0; font-size: 11.5px; color: #57534e; }
.ins-act-date { font-size: 11.5px; font-weight: 700; color: #a8a29e; white-space: nowrap; }

.ins-act-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #a8a29e;
  padding: 24px;
  font-size: 13px;
}

.ins-notfound {
  text-align: center;
  color: #a8a29e;
  padding: 40px;
  font-size: 14px;
}
</style>
