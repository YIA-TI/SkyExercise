<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <!-- Header + kembali -->
    <header class="mui-header">
      <div class="h-left">
        <button class="rl-back" type="button" aria-label="Back" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">Training Details</p>
          <p class="mui-h-sub">{{ activity ? formatTanggal(activity.startDate) : '—' }}</p>
        </div>
      </div>
      <span class="rl-strava">
        <span class="rl-dot"></span> Strava
      </span>
    </header>

    <template v-if="loading">
      <p class="rl-empty">Loading activity details…</p>
    </template>

    <template v-else-if="activity">
      <!-- Info sesi -->
      <div class="mui-card rl-session">
        <p class="rl-session-title">{{ activity.name || (activity.type === 'run' ? 'Run' : 'Gym') }}</p>
        <p class="rl-session-type">Sport Type: {{ activity.sportType }}{{ activity.sufferScore != null ? ` · Relative Effort ${activity.sufferScore}` : '' }}</p>
      </div>

      <!-- Ringkasan -->
      <div class="rl-summary">
        <div v-for="s in ringkasan" :key="s.label" class="rl-sum-card" :style="{ '--acc': s.acc }">
          <p class="rl-sum-label">{{ s.label }}</p>
          <p class="rl-sum-value mui-mono">
            {{ s.value }}<span class="rl-sum-unit">{{ s.unit }}</span>
          </p>
        </div>
      </div>

      <p v-if="activity.type === 'gym'" class="rl-note">
        Note: sets/reps/weight for gym sessions aren't available from Strava — manual entry is needed.
      </p>
      <p v-else class="rl-note">
        Note: charts & per-km splits require Strava time-series data that isn't stored
        (see docs/database-schema.md) — only the session summary is shown.
      </p>
    </template>

    <p v-else class="rl-empty">Activity not found.</p>
  </div>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityDetail } from '../composables/useMemberData.js'

const route = useRoute()
const router = useRouter()

function kembali() { router.back() }

function formatTanggal(iso) {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const activityId = computed(() => route.params.id)
const { activity, loading } = useActivityDetail(activityId)

// Dulu cuma "Detak Rata-rata" yang dikasih warna (merah, ditulis manual) —
// sisanya putih/hitam polos semua. Disamakan: tiap metrik dapat warna
// identitas sendiri (acc), senada pola kartu statistik lain di app.
const ringkasan = computed(() => {
  const a = activity.value
  if (!a) return []
  const rows = []
  if (a.type === 'run') {
    rows.push({ label: 'Total Distance', value: a.distanceKm ?? '—', unit: 'km', acc: '#2563eb' })
    rows.push({ label: 'Pace', value: a.pacePerKm ?? '—', unit: '/km', acc: '#0891b2' })
  }
  rows.push({ label: 'Calories', value: a.calories ?? '—', unit: 'kcal', acc: '#d97706' })
  rows.push({
    label: 'Avg Heart Rate',
    value: a.avgHeartrate ? Math.round(a.avgHeartrate) : '—',
    unit: 'bpm',
    acc: '#e11d48',
  })
  rows.push({ label: 'Session Duration', value: a.durationLabel ?? '—', unit: '', acc: '#7c3aed' })
  if (a.type === 'run' && a.elevationGain != null) {
    rows.push({ label: 'Elevation', value: Math.round(a.elevationGain), unit: 'm', acc: '#059669' })
  }
  if (a.maxHeartrate) {
    rows.push({ label: 'Max Heart Rate', value: Math.round(a.maxHeartrate), unit: 'bpm', acc: '#fb7185' })
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
  border: 1px solid rgba(37, 99, 235, 0.14);
  cursor: pointer;
  display: grid;
  place-content: center;
  color: #0f172a;
  background: #ffffff;
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

.rl-session-title { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #0f172a; }
.rl-session-type { margin: 0; font-size: 12.5px; color: rgba(15, 23, 42, 0.6); }

.rl-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.rl-sum-card {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid color-mix(in srgb, var(--acc, #2563eb) 20%, transparent);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
}
.rl-sum-card::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: var(--acc, #2563eb);
  opacity: 0.9;
}

.rl-sum-label { margin: 0 0 8px; font-size: 12px; color: rgba(15, 23, 42, 0.6); }
.rl-sum-value { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: color-mix(in srgb, var(--acc, #2563eb) 65%, #0f172a); }
.rl-sum-unit { font-size: 12px; font-weight: 700; color: rgba(15, 23, 42, 0.45); margin-left: 3px; }

.rl-note { margin: 4px 2px 0; font-size: 11.5px; color: rgba(15, 23, 42, 0.5); line-height: 16px; }

.rl-empty {
  text-align: center;
  color: rgba(15, 23, 42, 0.5);
  padding: 40px;
  font-size: 14px;
}
</style>
