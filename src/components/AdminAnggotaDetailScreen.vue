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
      <!-- Hero identitas -->
      <div class="ins-hero">
        <div class="ins-hero-avatar">{{ initials }}</div>
        <div class="ins-hero-info">
          <p class="ins-hero-name">{{ member.name }}</p>
          <p class="ins-hero-id mui-mono">{{ member.memberId }}</p>
        </div>
      </div>

      <!-- Ringkasan cepat -->
      <div class="ins-quick-row">
        <div v-for="q in quickStats" :key="q.label" class="ins-quick">
          <div class="ins-quick-ic" :class="q.cls" v-html="q.icon"></div>
          <div>
            <p class="ins-quick-value mui-mono">{{ q.value }}</p>
            <p class="ins-quick-label">{{ q.label }}</p>
          </div>
        </div>
      </div>

      <!-- Grafik jarak mingguan -->
      <section class="mui-block">
        <h2 class="mui-section-title">Jarak 7 Hari Terakhir</h2>
        <div class="mui-card">
          <div class="ins-chart">
            <div v-for="(h, i) in member.bars" :key="i" class="ins-chart-col">
              <span class="ins-chart-bar" :style="{ height: h + '%' }"></span>
              <span class="ins-chart-label">{{ dayLabels[i] }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Informasi diri -->
      <section class="mui-block">
        <h2 class="mui-section-title">Informasi Diri</h2>
        <div class="ins-grid">
          <div v-for="info in infoDiri" :key="info.label" class="ins-info">
            <p class="ins-info-label">{{ info.label }}</p>
            <p class="ins-info-value">{{ info.value }}</p>
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

        <div class="ins-act-list">
          <div v-for="(act, i) in visibleActivities" :key="i" class="ins-act-item">
            <span class="ins-act-ic" :class="act.type === 'Lari' ? 'is-orange' : 'is-blue'" v-html="act.type === 'Lari' ? icons.run : icons.gym"></span>
            <div class="ins-act-body">
              <p class="ins-act-name">{{ act.name }}</p>
              <p class="ins-act-meta">{{ act.meta }}</p>
            </div>
            <span class="ins-act-cal mui-mono">{{ act.kkal }} kkal</span>
          </div>
          <p v-if="filteredActivities.length === 0" class="ins-act-empty">Tidak ada aktivitas untuk filter ini.</p>
        </div>

        <button
          v-if="filteredActivities.length > INITIAL_VISIBLE"
          class="ins-act-toggle"
          type="button"
          @click="showAllActivities = !showAllActivities"
        >
          {{ showAllActivities ? 'Sembunyikan' : `Tampilkan Semua (${filteredActivities.length})` }}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showAllActivities ? 'rotate(180deg)' : 'none' }"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
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
import AdminTabBar from './AdminTabBar.vue'

const route = useRoute()
const router = useRouter()

const athleteId = computed(() => Number(route.params.id))
const { detail } = useAdminParticipantDetail(athleteId)

// Bentuk `member` dari data nyata (profil + aktivitas), lengkap dengan agregat ringkas.
const member = computed(() => {
  const d = detail.value
  if (!d?.profile) return null
  const acts = d.activities || []
  const runs = acts.filter((a) => a.type === 'run')
  const weekSince = Date.now() - 7 * 86400000
  const weekRuns = runs.filter((a) => new Date(a.startDate).getTime() >= weekSince)
  const weekKm = weekRuns.reduce((s, a) => s + (a.distanceKm || 0), 0)
  const maxKm = Math.max(1, ...weekRuns.map((a) => a.distanceKm || 0))
  const last = acts[0]
  return {
    name: d.profile.name,
    peran: 'Atlet',
    spesialisasi: d.profile.city || 'ARFF',
    aktif: true,
    memberId: `#${d.profile.athleteId}`,
    weight: d.profile.weight ? `${d.profile.weight} kg` : '—',
    joined: '—',
    bars: weekRuns.slice(0, 7).reverse().map((a) => Math.round(((a.distanceKm || 0) / maxKm) * 100)),
    stats: {
      weekKm: weekKm.toFixed(1),
      avgHr: last?.avgHeartrate ? Math.round(last.avgHeartrate) : '—',
      effort: last?.sufferScore ?? '—',
    },
    activities: acts.map((a) => ({
      type: a.type === 'run' ? 'Lari' : 'Gym',
      name: a.name,
      meta: a.type === 'run'
        ? `${a.distanceKm ?? '—'} km · ${a.durationLabel ?? '—'} mnt`
        : `${a.durationLabel ?? '—'} mnt · ${a.avgHeartrate ? Math.round(a.avgHeartrate) + ' bpm' : '—'}`,
      kkal: a.calories ?? '—',
    })),
  }
})

const initials = computed(() =>
  member.value ? member.value.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '',
)

function kembali() {
  router.push('/admin/anggota')
}

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

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
    { label: 'Km Minggu Ini', value: s.weekKm, cls: 'is-orange', icon: icons.distance },
    { label: 'Rata HR (bpm)', value: String(s.avgHr), cls: 'is-blue', icon: icons.heart },
    { label: 'Relative Effort', value: String(s.effort), cls: 'is-green', icon: icons.effort },
  ]
})

const infoDiri = computed(() => {
  if (!member.value) return []
  const m = member.value
  return [
    { label: 'ID Anggota', value: m.memberId },
    { label: 'Peran', value: m.peran },
    { label: 'Spesialisasi', value: m.spesialisasi },
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

// Daftar bisa dilipat — tampilkan beberapa dulu agar tak memenuhi layar.
const INITIAL_VISIBLE = 4
const showAllActivities = ref(false)
watch(activeFilter, () => { showAllActivities.value = false })
const visibleActivities = computed(() =>
  showAllActivities.value ? filteredActivities.value : filteredActivities.value.slice(0, INITIAL_VISIBLE),
)
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

/* Hero identitas */
.ins-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, #292524 0%, #1c1917 100%);
  color: #ffffff;
}

.ins-hero-avatar {
  flex: 0 0 auto;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-content: center;
  font-size: 19px;
  font-weight: 700;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.ins-hero-info { min-width: 0; }
.ins-hero-name { margin: 0; font-family: "Playfair Display", Georgia, serif; font-size: 19px; font-weight: 600; }
.ins-hero-id { margin: 4px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.65); }

/* Ringkasan cepat */
.ins-quick-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.ins-quick {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.ins-quick-ic {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-content: center;
}

.ins-quick-ic.is-orange { background: #ffedd5; color: #ea580c; }
.ins-quick-ic.is-blue   { background: #ccfbf1; color: #0f766e; }
.ins-quick-ic.is-green  { background: #d1fae5; color: #059669; }

.ins-quick-value { margin: 0; font-size: 18px; font-weight: 700; color: #1c1917; letter-spacing: -0.3px; }
.ins-quick-label { margin: 2px 0 0; font-size: 11px; color: #a8a29e; }

/* Grafik jarak */
.ins-chart { display: flex; align-items: flex-end; gap: 8px; height: 96px; }
.ins-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
.ins-chart-bar { width: 100%; max-width: 24px; border-radius: 6px; background: linear-gradient(180deg, #ff914d, #fc4c02); }
.ins-chart-label { font-size: 10.5px; color: #a8a29e; }

/* Info diri */
.ins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.ins-info {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.ins-info-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #a8a29e;
}

.ins-info-value { margin: 0; font-size: 15px; font-weight: 700; color: #1c1917; }

/* Aktivitas + filter */
.ins-act-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

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
  gap: 10px;
  margin-top: 12px;
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
.ins-act-cal { font-size: 12.5px; font-weight: 700; color: #fc4c02; white-space: nowrap; }

.ins-act-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #a8a29e;
  padding: 24px;
  font-size: 13px;
}

.ins-act-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #57534e;
  background: #ffffff;
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 10px 24px -20px rgba(17, 18, 20, 0.5);
  transition: transform 0.15s ease, color 0.15s ease;
}
.ins-act-toggle:hover { color: #fc4c02; transform: translateY(-1px); }
.ins-act-toggle svg { transition: transform 0.2s ease; flex-shrink: 0; }

.ins-notfound {
  text-align: center;
  color: #a8a29e;
  padding: 40px;
  font-size: 14px;
}
</style>
