<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <!-- Header + kembali -->
    <header class="mui-header">
      <div class="h-left">
        <button class="rl-back" type="button" aria-label="Kembali" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">Rincian Latihan</p>
          <p class="mui-h-sub">{{ activity ? formatTanggal(activity.startDate) : '—' }}</p>
        </div>
      </div>
      <span class="rl-strava">
        <span class="rl-dot"></span> Strava
      </span>
    </header>

    <template v-if="loading">
      <p class="rl-empty">Memuat rincian aktivitas…</p>
    </template>

    <template v-else-if="activity">
      <!-- Info sesi -->
      <div class="mui-card rl-session">
        <p class="rl-session-title">{{ activity.name || (activity.type === 'run' ? 'Lari' : 'Gym') }}</p>
        <p class="rl-session-type">Sport Type: {{ activity.sportType }}{{ activity.sufferScore != null ? ` · Relative Effort ${activity.sufferScore}` : '' }}</p>
      </div>

      <!-- Ringkasan -->
      <div class="rl-summary">
        <div v-for="s in ringkasan" :key="s.label" class="rl-sum-card">
          <p class="rl-sum-label">{{ s.label }}</p>
          <p class="rl-sum-value mui-mono" :style="s.color ? { color: s.color } : null">
            {{ s.value }}<span class="rl-sum-unit">{{ s.unit }}</span>
          </p>
        </div>
      </div>

      <p v-if="activity.type === 'gym'" class="rl-note">
        Catatan: set/reps/beban untuk sesi gym tidak tersedia dari Strava — perlu input manual.
      </p>
      <p v-else class="rl-note">
        Catatan: grafik & split per-km memerlukan data time-series Strava yang tidak disimpan
        (lihat docs/database-schema.md) — hanya ringkasan sesi yang ditampilkan.
      </p>
    </template>

    <p v-else class="rl-empty">Aktivitas tidak ditemukan.</p>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityDetail } from '../composables/useMemberData.js'
import MemberTabBar from './MemberTabBar.vue'

const route = useRoute()
const router = useRouter()

function kembali() { router.back() }

function formatTanggal(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const activityId = computed(() => route.params.id)
const { activity, loading } = useActivityDetail(activityId)

const ringkasan = computed(() => {
  const a = activity.value
  if (!a) return []
  const rows = []
  if (a.type === 'run') {
    rows.push({ label: 'Jarak Total', value: a.distanceKm ?? '—', unit: 'km' })
    rows.push({ label: 'Pace', value: a.pacePerKm ?? '—', unit: '/km' })
  }
  rows.push({ label: 'Kalori', value: a.calories ?? '—', unit: 'kkal' })
  rows.push({
    label: 'Detak Rata-rata',
    value: a.avgHeartrate ? Math.round(a.avgHeartrate) : '—',
    unit: 'bpm',
    color: '#ef4444',
  })
  rows.push({ label: 'Durasi Sesi', value: a.durationLabel ?? '—', unit: '' })
  if (a.type === 'run' && a.elevationGain != null) {
    rows.push({ label: 'Elevasi', value: Math.round(a.elevationGain), unit: 'm' })
  }
  if (a.maxHeartrate) {
    rows.push({ label: 'Detak Maksimum', value: Math.round(a.maxHeartrate), unit: 'bpm' })
  }
  return rows
})
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.rl-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #ece7e2;
  cursor: pointer;
  display: grid;
  place-content: center;
  color: #1c1917;
  background: #f5f1ec;
}

.rl-strava {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
  background: rgba(252, 76, 2, 0.9);
  padding: 6px 12px;
  border-radius: 999px;
}

.rl-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; }

.rl-session-title { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #1c1917; }
.rl-session-type { margin: 0; font-size: 12.5px; color: #57534e; }

.rl-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.rl-sum-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.rl-sum-label { margin: 0 0 8px; font-size: 12px; color: #57534e; }
.rl-sum-value { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #1c1917; }
.rl-sum-unit { font-size: 12px; font-weight: 700; color: #a8a29e; margin-left: 3px; }

.rl-note { margin: 4px 2px 0; font-size: 11.5px; color: #a8a29e; line-height: 16px; }

.rl-empty {
  text-align: center;
  color: #a8a29e;
  padding: 40px;
  font-size: 14px;
}
</style>
