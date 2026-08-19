<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Monitoring ARFF</p>
          <p class="mui-h-sub">Halo, {{ firstName }} · Administrator</p>
        </div>
      </div>
      <span class="mui-pill">ARFF Command</span>
    </header>

    <!-- Ringkasan stat -->
    <section class="mui-block">
      <h2 class="mui-section-title">Ringkasan Divisi</h2>
      <div class="ad-stats">
        <div v-for="s in stats" :key="s.label" class="ad-stat" :class="s.cls">
          <div class="ad-stat-icon" v-html="s.icon"></div>
          <div>
            <p class="ad-stat-value mui-mono">{{ s.value }}</p>
            <p class="ad-stat-label">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Aktivitas terbaru -->
    <section class="mui-block">
      <h2 class="mui-section-title">Aktivitas Latihan Terbaru</h2>
      <DateRangeFilter v-model:start="filterStart" v-model:end="filterEnd" />
      <div class="ad-list">
        <article
          v-for="a in recentActivities"
          :key="a.id"
          class="ad-act"
          role="button"
          tabindex="0"
          @click="goInspect(a.id)"
          @keyup.enter="goInspect(a.id)"
        >
          <div class="ad-act-avatar">{{ a.name[0] }}</div>
          <div class="ad-act-body">
            <div class="ad-act-top">
              <span class="ad-act-name">{{ a.name }}</span>
              <span class="mui-tag" :class="a.type === 'Running' ? 'mui-tag--blue' : 'mui-tag--orange'">{{ a.type }}</span>
            </div>
            <p class="ad-act-meta">{{ a.duration }} · <span class="mui-mono">{{ a.value }}</span></p>
          </div>
          <span class="mui-tag mui-tag--green">{{ a.status }}</span>
          <svg class="ad-act-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </article>
      </div>
    </section>
  </div>

  <AdminTabBar />
</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminMonitoring } from '../composables/useAdminData.js'
import { daysAgoDateStr, toDateStr } from '../lib/normalize.js'
import AdminTabBar from './AdminTabBar.vue'
import DateRangeFilter from './DateRangeFilter.vue'

const router = useRouter()

function goInspect(id) {
  router.push(`/admin/anggota/${id}`)
}

const displayName = computed(() => authState.userName || 'Rahmat Hidayat')
const firstName = computed(() => displayName.value.split(' ')[0])
const initials = computed(() =>
  displayName.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const filterStart = ref(daysAgoDateStr(7))
const filterEnd = ref(toDateStr(new Date()))

const { summary, recent } = useAdminMonitoring({ start: filterStart, end: filterEnd })

const ICONS = {
  members: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  route: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  bars: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',
}

const stats = computed(() => [
  { label: 'Total Anggota', value: String(summary.value?.totalMembers ?? '—'), cls: 'is-blue', icon: ICONS.members },
  { label: 'Sesi Hari Ini', value: String(summary.value?.sessionsToday ?? '—'), cls: 'is-orange', icon: ICONS.clock },
  { label: 'Jarak Bulan Ini', value: summary.value ? `${summary.value.distanceMonthKm} km` : '—', cls: 'is-green', icon: ICONS.route },
  { label: 'Total Peserta Aktif', value: String(summary.value?.totalMembers ?? '—'), cls: 'is-purple', icon: ICONS.bars },
]);

const recentActivities = computed(() =>
  (recent.value || []).map((a) => ({
    id: a.athleteId,
    name: a.athleteName || '—',
    type: a.type === 'run' ? 'Running' : 'Gym',
    duration: `${a.durationLabel ?? '—'} mnt`,
    value: a.type === 'run' ? `${a.distanceKm ?? '—'} km` : `${a.calories ?? '—'} kkal`,
    status: 'Selesai',
  })),
)
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.ad-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.ad-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.ad-stat-icon {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-content: center;
}

.ad-stat.is-blue .ad-stat-icon   { background: #ccfbf1; color: #0f766e; }
.ad-stat.is-orange .ad-stat-icon { background: #ffedd5; color: #ea580c; }
.ad-stat.is-green .ad-stat-icon  { background: #d1fae5; color: #059669; }
.ad-stat.is-purple .ad-stat-icon { background: #f3e8ff; color: #9333ea; }

.ad-stat-value { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #1c1917; }
.ad-stat-label { margin: 4px 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #a8a29e; }

.ad-list { display: flex; flex-direction: column; gap: 10px; }

.ad-act {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ad-act:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(17, 18, 20, 0.45);
}

.ad-act-chevron { flex: 0 0 auto; color: #d6cfc8; }

.ad-act-avatar {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-content: center;
  font-weight: 700;
  font-size: 15px;
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.ad-act-body { flex: 1; min-width: 0; }
.ad-act-top { display: flex; align-items: center; gap: 8px; }
.ad-act-name { font-size: 14px; font-weight: 700; color: #1c1917; }
.ad-act-meta { margin: 3px 0 0; font-size: 12px; color: #57534e; }
</style>
