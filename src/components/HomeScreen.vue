<template>
<div class="aeroguard-home">
  <div class="app-column">

    <!-- Kartu hero: sapaan + status Strava dalam satu panel -->
    <div class="hero-card">
    <!-- Header sapaan -->
    <header class="greeting-card">
      <div class="greeting-left">
        <div class="avatar">{{ initials }}</div>
        <div class="greeting-text">
          <p class="hello">Hi, {{ firstName }}!</p>
          <p class="role">ARFF Member · Ready to train</p>
        </div>
      </div>
      <button class="icon-btn" type="button" aria-label="Notifications" @click="goNotifikasi">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span class="dot"></span>
      </button>
    </header>

    <!-- Konektor Strava -->
    <div class="strava-card" :class="{ 'is-disconnected': !stravaState.connected }">
      <div class="strava-left">
        <span class="strava-icon">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
          </svg>
        </span>
        <div v-if="stravaState.connected">
          <p class="strava-title">Connected to Strava</p>
          <p class="strava-sub">Last synced: {{ stravaState.lastSynced }}</p>
        </div>
        <div v-else>
          <p class="strava-title">Strava not connected</p>
          <p class="strava-sub">Connect to sync activities automatically</p>
        </div>
      </div>
      <button v-if="stravaState.connected" class="strava-sync" type="button" :disabled="syncing" @click="handleSync">
        <svg class="spin-icon" :class="{ 'is-spinning': syncing }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {{ syncing ? 'Syncing…' : 'Sync' }}
      </button>
      <button v-else class="strava-sync" type="button" @click="goConnectStrava">Connect</button>
    </div>
    </div>

    <!-- Reminder mingguan: update berat badan -->
    <div v-if="showWeightReminder" class="weight-reminder">
      <span class="weight-reminder-text">Time for your weekly update — update your weight for an accurate BMI.</span>
      <div class="weight-reminder-actions">
        <button class="weight-reminder-btn" type="button" @click="goUpdateWeight">Update</button>
        <button class="weight-reminder-dismiss" type="button" aria-label="Close" @click="dismissWeightReminder">✕</button>
      </div>
    </div>

    <!-- Statistik — coverflow 3D, putar & pilih -->
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">Statistics</h2>
        <RefreshingBadge v-if="statsLoading && stats" label="Refreshing…" />
        <span v-else class="swipe-hint">Swipe ↔</span>
      </div>

      <div v-if="statsLoading && !stats" class="stats-skel">
        <div class="mui-skel" style="width: 100%; height: 100%; border-radius: 26px;"></div>
      </div>
      <div v-else class="sphere" @pointerdown="onDown">
        <div class="sphere-stage" :class="{ 'is-dragging': dragging }">
          <article
            v-for="(c, i) in cards"
            :key="c.type"
            class="stat-card"
            :class="[`stat-${c.type}`, { 'is-center': isCenter(i), 'no-anim': noAnim[i] }]"
            :style="cardStyle(i)"
            tabindex="0"
            @click="onCardClick(i)"
            @keyup.enter="onCardClick(i)"
          >
            <div class="stat-inner">
              <!-- Jarak -->
              <template v-if="c.type === 'distance'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Distance</span>
                  <span class="hchip">This week</span>
                </div>
                <p class="stat-big mono">{{ distance.weekKm }}<small>km</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in distance.bars" :key="k" class="mini-bar" :style="{ height: h + '%' }"></span>
                </div>
                <p class="stat-note">Pace {{ distance.pace }} /km · {{ distance.runCount }} runs</p>
              </template>

              <!-- Detak Jantung (avg/max per sesi — Strava) -->
              <template v-else-if="c.type === 'heart-rate'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Heart Rate</span>
                  <span class="hchip hchip--orange">Last session</span>
                </div>
                <p class="stat-big mono">{{ heartRate.avg }}<small>bpm avg</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in heartRate.bars" :key="k" class="mini-bar" :style="{ height: (h - 100) + '%' }"></span>
                </div>
                <p class="stat-note">Max {{ heartRate.max }} bpm</p>
              </template>

              <!-- Kalori (tanpa makro) -->
              <template v-else-if="c.type === 'calories'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Calories</span>
                  <span class="hchip">Today</span>
                </div>
                <p class="stat-big mono">{{ calories.today }}<small>kcal</small></p>
                <p class="stat-note">Last session burned {{ calories.lastSession }} kcal</p>
              </template>

              <!-- Relative Effort (suffer score — Strava) -->
              <template v-else-if="c.type === 'effort'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Relative Effort</span>
                  <span class="hchip hchip--orange">Zone {{ effort.zone }}</span>
                </div>
                <p class="stat-big mono">{{ effort.last }}<small>pts</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in effort.bars" :key="k" class="mini-bar" :style="{ height: h + '%' }"></span>
                </div>
                <p class="stat-note">This week {{ effort.weekTotal }} pts</p>
              </template>

              <span class="stat-more">
                {{ isCenter(i) ? 'Tap for details' : 'Swipe to center' }}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </div>
          </article>
        </div>
      </div>

      <!-- Dot indikator -->
      <div class="sphere-dots">
        <button
          v-for="(c, i) in cards"
          :key="c.type"
          class="sphere-dot"
          :class="{ 'is-active': isCenter(i) }"
          :aria-label="`Go to card ${i + 1}`"
          @click="goTo(i)"
        ></button>
      </div>
    </section>

    <!-- My Activity + Filter -->
    <section class="stats-wrap act-section">
      <div class="stats-head">
        <h2 class="section-title">My Activity</h2>
        <RefreshingBadge v-if="activitiesLoading && rawActivities" label="Refreshing…" />
        <span v-else class="hchip">{{ filteredActivities.length }} activities</span>
      </div>

      <div class="filter-row">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-chip"
          :class="{ 'is-active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >{{ f.label }}</button>
      </div>

      <div v-if="activitiesLoading && !rawActivities" class="act-list">
        <div v-for="i in 4" :key="i" class="act-item">
          <div class="mui-skel mui-skel--circle" style="width: 40px; height: 40px; flex-shrink: 0;"></div>
          <div class="act-body">
            <div class="mui-skel mui-skel--text" style="width: 60%;"></div>
            <div class="mui-skel mui-skel--text" style="width: 40%; margin-top: 6px;"></div>
          </div>
        </div>
      </div>
      <div v-else class="act-list">
        <div
          v-for="a in visibleActivities"
          :key="a.id"
          class="act-item"
          role="button"
          tabindex="0"
          @click="goRincian(a.id)"
          @keyup.enter="goRincian(a.id)"
        >
          <span class="act-ic" :class="a.cls" v-html="a.icon"></span>
          <div class="act-body">
            <p class="act-name">{{ a.name }}</p>
            <p class="act-meta">{{ a.meta }}</p>
          </div>
          <span class="act-time mono">{{ a.waktu }}</span>
        </div>
        <p v-if="filteredActivities.length === 0" class="act-empty">No activities for this filter.</p>
      </div>

      <button
        v-if="filteredActivities.length > INITIAL_VISIBLE"
        class="act-toggle"
        type="button"
        @click="showAllActivities = !showAllActivities"
      >
        {{ showAllActivities ? 'Hide' : `Show All (${filteredActivities.length})` }}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: showAllActivities ? 'rotate(180deg)' : 'none' }"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </section>

  </div>
</div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { openBodyMetricsModal } from '../store/bodyMetricsModal.js'
import {
  distance as mockDistance,
  heartRate as mockHeartRate,
  calories as mockCalories,
  effort as mockEffort,
} from '../store/stats.js'
import { stravaState } from '../store/strava.js'
import { useStravaConnection } from '../composables/useStravaConnection.js'
import { useHomeStats, useActivities, checkAchievements } from '../composables/useMemberData.js'
import { achievementEn } from '../lib/achievementsEn.js'
import RefreshingBadge from './RefreshingBadge.vue'
import { formatDateTime } from '../lib/normalize.js'
import { showToast } from '../store/toast.js'

const router = useRouter()

const displayName = computed(() => authState.userName || 'Citra Dewi')
const firstName = computed(() => displayName.value.split(' ')[0])
const initials = computed(() =>
  displayName.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

// ── Notifikasi (lonceng) — halaman sendiri di /notifikasi ──
function goNotifikasi() {
  router.push('/notifikasi')
}

// ── Konektor Strava ──
const { sync } = useStravaConnection()
const syncing = ref(false)

async function handleSync() {
  if (syncing.value) return
  syncing.value = true
  try {
    await sync()
    // Ambil ulang data (statistik + My Activity) begitu sinkron selesai.
    await Promise.all([refreshStats(), refreshActivities()])
    await runAchievementCheck()
  } finally {
    syncing.value = false
  }
}

// Evaluasi ulang achievement (RPC) & toast perayaan utk yang baru unlock —
// dipanggil saat Home dimuat & tiap kali selesai sinkron Strava (aktivitas baru
// paling mungkin memenuhi kriteria tepat setelah sinkron).
async function runAchievementCheck() {
  try {
    const newlyUnlocked = await checkAchievements()
    newlyUnlocked.forEach((a) => showToast(`New achievement: ${achievementEn(a).name}!`))
  } catch {
    // Diam-diam abaikan — bukan alur kritis, jangan ganggu Home kalau gagal.
  }
}

function goConnectStrava() {
  router.push('/strava/authorize')
}

// ── Reminder mingguan: update berat badan (dismiss hanya untuk sesi ini) ──
const weightReminderDismissed = ref(false)
const showWeightReminder = computed(() =>
  authState.needsWeightReminder && !weightReminderDismissed.value,
)
function dismissWeightReminder() {
  weightReminderDismissed.value = true
}
function goUpdateWeight() {
  openBodyMetricsModal()
}

function goRincian(id) {
  router.push(`/latihan/rincian/${id}`)
}

// ── Statistik (Strava) — nilai nyata, fallback ke skeleton mock saat loading/kosong ──
const { stats, loading: statsLoading, refresh: refreshStats } = useHomeStats()
const distance = computed(() => ({ ...mockDistance, ...(stats.value?.distance || {}) }))
const heartRate = computed(() => ({ ...mockHeartRate, ...(stats.value?.heartRate || {}) }))
const calories = computed(() => ({ ...mockCalories, ...(stats.value?.calories || {}) }))
const effort = computed(() => ({ ...mockEffort, ...(stats.value?.effort || {}) }))

// ── Coverflow 3D (kartu berputar di ekuator "bola", looping) ──
const cards = [
  { type: 'distance' },
  { type: 'heart-rate' },
  { type: 'calories' },
  { type: 'effort' },
]

const position = ref(0)     // indeks pecahan; kartu tengah = round(position)
const dragging = ref(false)
let startX = 0
let startPos = 0
let moved = false

const DRAG_UNIT = 200       // px seret untuk memutar satu kartu

// Offset kartu-i dari pusat, di-wrap agar looping (jalur terpendek)
function offset(i) {
  const n = cards.length
  let o = ((i - position.value) % n + n) % n
  if (o > n / 2) o -= n
  return o
}

function isCenter(i) {
  return Math.abs(offset(i)) < 0.5
}

// Ref ke elemen .aeroguard-home untuk baca CSS custom properties
const homeEl = ref(null)
onMounted(() => {
  // Ganti ref setelah mount
  homeEl.value = document.querySelector('.aeroguard-home')
  runAchievementCheck()
})

function getCSSVar(name, fallback) {
  if (!homeEl.value) return fallback
  const raw = getComputedStyle(homeEl.value).getPropertyValue(name).trim()
  return parseFloat(raw) || fallback
}

function cardStyle(i) {
  const o = offset(i)
  const abs = Math.abs(o)
  const hidden = abs > 1.5   // hanya 3 kartu tampak (tengah + 2 sisi)
  // Baca nilai dari CSS custom properties (fluid per breakpoint)
  const gap   = getCSSVar('--card-gap',   230)
  const depth = getCSSVar('--card-depth', 180)
  const rot   = getCSSVar('--card-rot',   44)   // dalam deg, ambil angka
  return {
    transform: `translateX(${o * gap}px) translateZ(${-abs * depth}px) rotateY(${-o * rot}deg) scale(${Math.max(0.72, 1 - abs * 0.14)})`,
    opacity: hidden ? 0 : 1 - abs * 0.04,
    zIndex: Math.round(100 - abs * 10),
    pointerEvents: hidden ? 'none' : 'auto',
  }
}

// Matikan transisi untuk kartu yang "melompat" saat looping (biar tak terbang menyeberang)
const noAnim = ref(cards.map(() => false))
let prevOff = cards.map((_, i) => offset(i))
watch(position, () => {
  cards.forEach((_, i) => {
    const o = offset(i)
    if (Math.abs(o - prevOff[i]) > cards.length / 2) {
      noAnim.value[i] = true
      requestAnimationFrame(() => requestAnimationFrame(() => { noAnim.value[i] = false }))
    }
    prevOff[i] = o
  })
})

function onDown(e) {
  dragging.value = true
  moved = false
  startX = e.clientX
  startPos = position.value
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
function onMove(e) {
  if (!dragging.value) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 4) moved = true
  position.value = startPos - dx / DRAG_UNIT
}
function onUp() {
  if (!dragging.value) return
  dragging.value = false
  position.value = Math.round(position.value)   // snap ke kartu tengah
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
})

function onCardClick(i) {
  if (moved) { moved = false; return }          // baru menyeret → jangan aksi
  const o = offset(i)
  if (Math.abs(o) < 0.5) {
    router.push(`/stats/${cards[i].type}`)        // kartu tengah → detail
  } else {
    goTo(i)                                        // sisi → putar ke tengah
  }
}

function goTo(i) {
  position.value = Math.round(position.value + offset(i))
}

// ── My Activity + Filter (hanya Lari & Gym) ──
const runIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
const gymIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>'

// value dikirim apa adanya ke fetchActivities()/Supabase query (lihat
// services/activities.js, filter === 'Lari'/'Gym') — JANGAN diterjemahkan,
// cuma label tampilannya yg bahasa Inggris.
const filters = [
  { value: 'Semua', label: 'All' },
  { value: 'Lari', label: 'Run' },
  { value: 'Gym', label: 'Gym' },
]
const activeFilter = ref('Semua')

// Aktivitas nyata dari Strava (seluruh histori, difilter server-side lewat composable).
const { activities: rawActivities, loading: activitiesLoading, refresh: refreshActivities } = useActivities(activeFilter)

const filteredActivities = computed(() =>
  (rawActivities.value || []).map((a) => ({
    id: a.activityId,
    icon: a.type === 'run' ? runIcon : gymIcon,
    cls: a.type === 'run' ? 'is-orange' : 'is-blue',
    name: a.name,
    waktu: formatDateTime(a.startDate),
    meta: a.type === 'run'
      ? `${a.distanceKm ?? '—'} km · ${a.durationLabel ?? '—'}`
      : `${a.durationLabel ?? '—'} · ${a.avgHeartrate ? Math.round(a.avgHeartrate) + ' bpm' : '—'}`,
  })),
)

// Daftar bisa dilipat — tampilkan beberapa dulu agar tak memenuhi layar.
const INITIAL_VISIBLE = 4
const showAllActivities = ref(false)
watch(activeFilter, () => { showAllActivities.value = false }) // reset saat ganti filter
const visibleActivities = computed(() =>
  showAllActivities.value ? filteredActivities.value : filteredActivities.value.slice(0, INITIAL_VISIBLE),
)
</script>

<style>
@import '../assets/mobile-ui.css';

/* ========== HOME DASHBOARD — konsep "Clean Sky" (simple, putih-biru) ========== */

/* ── CSS Custom Properties untuk coverflow yang fluid ── */
.aeroguard-home {
  --card-w: min(320px, calc(100vw - 80px));
  --card-h: 272px;
  --card-pad: 22px;    /* padding dalam kartu */
  --bars-h: 44px;      /* tinggi mini-bars */
  --card-gap: 230px;   /* jarak antar kartu horizontal */
  --card-depth: 180px; /* kedalaman Z per slot */
  --card-rot: 44deg;   /* rotasi Y per slot */

  position: relative;
  z-index: 0;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  /* Latar putih ke biru muda, bersih tanpa motif — senada dgn .mui di mobile-ui.css. */
  background-image:
    radial-gradient(880px 440px at 100% -8%, rgba(59, 130, 246, 0.14), transparent 62%),
    radial-gradient(800px 480px at -10% 108%, rgba(96, 165, 250, 0.12), transparent 58%),
    linear-gradient(160deg, #ffffff 0%, #eff6ff 55%, #dbeafe 100%);
  background-color: #eff6ff;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-attachment: fixed;
  animation: none;
  font-family: "Barlow", system-ui, sans-serif;
  color: #0f172a;
  box-sizing: border-box;
}

/* Layar kecil: kartu & gap lebih sempit */
@media (max-width: 400px) {
  .aeroguard-home {
    --card-w: min(280px, calc(100vw - 60px));
    --card-gap: 190px;
    --card-depth: 150px;
    --card-rot: 40deg;
  }
}
/* Layar sangat kecil */
@media (max-width: 340px) {
  .aeroguard-home {
    --card-w: calc(100vw - 48px);
    --card-gap: 160px;
    --card-depth: 130px;
    --card-rot: 36deg;
  }
}
/* Tablet / small desktop — kartu tumbuh LINEAR dari ukuran mobile (600px) sampai
   400x320 (1023px), pakai formula `a*vw + b` (bukan vw murni) supaya benar-benar
   membesar sejak awal breakpoint — vw murni membuatnya "mentok" di nilai minimum
   sampai lebar layar sangat besar, itu sebabnya sebelumnya terasa kurang besar. */
@media (min-width: 600px) {
  .aeroguard-home {
    --card-w: clamp(320px, 18.9vw + 207px, 400px);
    --card-gap: 260px;
    --card-h: clamp(272px, 11.35vw + 204px, 320px);
    --card-pad: 24px;
    --bars-h: 48px;
  }
}
/* Desktop lebar — kartu maksimal sedikit lebih besar lagi */
@media (min-width: 1024px) {
  .aeroguard-home {
    --card-w: clamp(360px, 30vw, 420px);
    --card-gap: 280px;
    --card-h: clamp(290px, 26vw, 340px);
  }
}

/* ── Wrapper utama ── */
.aeroguard-home .app-column {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  min-height: 100vh;
  padding: clamp(16px, 3vw, 28px);
  padding-bottom: 120px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Desktop ≥ 768px: konten di kanan tab-bar sidebar */
@media (min-width: 768px) {
  .aeroguard-home .app-column {
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: clamp(28px, 4vw, 48px);
  }
}
/* Desktop lebar ≥ 1024px: beri ruang lebih */
@media (min-width: 1024px) {
  .aeroguard-home .app-column {
    max-width: 780px;
    padding: 32px 40px;
    padding-bottom: 48px;
  }
}

.aeroguard-home .mono {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-numeric: tabular-nums;
}

.aeroguard-home .section-title {
  margin: 0;
  font-family: "Barlow Condensed", system-ui, sans-serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #0f172a;
}

/* ----- Greeting ----- */
.aeroguard-home .greeting-card {
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: 22px; color: #0f172a;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 18px 36px -28px rgba(15, 23, 42, 0.22);
}
.aeroguard-home .greeting-card::before {
  content: ''; position: absolute; top: -70%; right: -6%;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, rgba(37, 99, 235, 0) 70%);
  pointer-events: none;
}
.aeroguard-home .greeting-left { position: relative; display: flex; align-items: center; gap: 12px; }
.aeroguard-home .avatar {
  width: 44px; height: 44px; border-radius: 14px; display: grid; place-content: center;
  color: #fff; font-weight: 700; font-size: 15px;
  background: linear-gradient(45deg, #2563eb 0%, #60a5fa 100%);
  box-shadow: 0 8px 18px -8px rgba(37, 99, 235, 0.5);
  flex-shrink: 0;
}
.aeroguard-home .hello { margin: 0; font-family: "Barlow Condensed", system-ui, sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.1px; }
.aeroguard-home .role { margin: 2px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.6); }
.aeroguard-home .icon-btn {
  position: relative; display: grid; place-content: center; width: 40px; height: 40px;
  border-radius: 12px; border: 1px solid rgba(37, 99, 235, 0.14); cursor: pointer; color: rgba(15, 23, 42, 0.65);
  background: rgba(37, 99, 235, 0.06); flex-shrink: 0;
}
.aeroguard-home .icon-btn .dot {
  position: absolute; top: 9px; right: 10px; width: 8px; height: 8px; border-radius: 50%;
  background: #fc4c02; border: 2px solid #ffffff;
}

/* ----- Konektor Strava ----- */
.aeroguard-home .strava-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.25);
  flex-wrap: wrap;
}
@media (min-width: 400px) {
  .aeroguard-home .strava-card { flex-wrap: nowrap; }
}
.aeroguard-home .strava-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
.aeroguard-home .strava-icon {
  flex: 0 0 auto;
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-content: center; color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 8px 18px -8px rgba(252, 100, 45, 0.7);
}
.aeroguard-home .strava-card.is-disconnected .strava-icon { filter: grayscale(0.4); opacity: 0.75; }
.aeroguard-home .strava-title { margin: 0; font-size: 13.5px; font-weight: 700; color: #0f172a; }
.aeroguard-home .strava-sub { margin: 2px 0 0; font-size: 11.5px; color: rgba(15, 23, 42, 0.6); }
.aeroguard-home .strava-sync {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
  padding: 9px 14px;
  border-radius: 999px;
  background: #1c1917;
  transition: transform 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;
}
.aeroguard-home .strava-sync:hover:not(:disabled) { transform: translateY(-1px); }
.aeroguard-home .strava-sync:disabled { opacity: 0.75; cursor: default; }
.aeroguard-home .stats-skel { height: calc(var(--card-h) + 50px); }

/* ----- Reminder mingguan: berat badan ----- */
.aeroguard-home .weight-reminder {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.25);
  color: #FDBA74;
}
.aeroguard-home .weight-reminder-text { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; }
.aeroguard-home .weight-reminder-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.aeroguard-home .weight-reminder-btn {
  border: none; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700;
  color: #ffffff; padding: 8px 14px; border-radius: 10px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}
.aeroguard-home .weight-reminder-dismiss {
  border: none; background: none; cursor: pointer; color: #FDBA74; font-size: 13px;
  padding: 4px; line-height: 1;
}

/* ----- Section wrap ----- */
.aeroguard-home .stats-wrap { display: flex; flex-direction: column; gap: 12px; }
.aeroguard-home .stats-head { display: flex; align-items: center; justify-content: space-between; }
.aeroguard-home .swipe-hint { font-size: 12px; font-weight: 600; color: rgba(15, 23, 42, 0.45); }
.aeroguard-home .hchip {
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
  background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.14);
  color: #1d4ed8; white-space: nowrap;
}
.aeroguard-home .hchip--orange { background: rgba(251, 146, 60, 0.16); color: #c2410c; }
.aeroguard-home .hchip--green { background: rgba(16, 185, 129, 0.14); color: #047857; }

/* ----- Sphere coverflow (pakai CSS custom properties) ----- */
.aeroguard-home .sphere {
  position: relative;
  height: calc(var(--card-h) + 50px);
  perspective: 1200px;
  touch-action: pan-y;
  user-select: none;
  /* Hanya clip horizontal (kartu yang keluar viewport) — vertikal dibiarkan
     visible supaya glow/box-shadow kartu tengah tak terpotong tajam di tepi
     bawah (dulu "overflow: hidden" ikut motong shadow, kelihatan batas kotak). */
  overflow-x: hidden;
  overflow-y: visible;
  /* Kartu samping memudar sebelum kena batas overflow, jadi terlihat "menghilang
     halus" bukan "terpotong" tajam di tepi. */
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
}
.aeroguard-home .sphere-stage {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.aeroguard-home .stat-card {
  position: absolute;
  top: 18px;
  left: 50%;
  width: var(--card-w);
  height: var(--card-h);
  margin-left: calc(var(--card-w) / -2);
  box-sizing: border-box;
  cursor: pointer;
  /* Kartu samping diberi tinta warna aksen tipis (bukan putih polos) supaya
     ikut "bertema" sesuai jenisnya meski belum di tengah/fokus. Lapisan
     gradasi putih diagonal di atas = sapuan "kilap kaca" (glossy sheen). */
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 32%),
    linear-gradient(165deg, color-mix(in srgb, var(--acc) 20%, white) 0%, color-mix(in srgb, var(--acc) 7%, white) 100%);
  /* Pinggiran glossy ikut warna aksen tiap kartu (dulu emas dipaksa sama
     rata, jadi tabrakan di kartu pink/ungu) — bevel kaca tetap (highlight
     putih di atas, rim pucat, bayangan gelap di bawah), cuma tintnya kini
     senada kartunya sendiri, lebih menyatu & "sengaja" terasa. */
  border: 1.5px solid var(--acc);
  border-radius: 26px;
  padding: var(--card-pad);
  overflow: hidden;
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.85),
    inset 0 0 0 1px color-mix(in srgb, var(--acc2) 55%, white),
    inset 0 -1.5px 0 color-mix(in srgb, var(--acc) 55%, black),
    0 0 0 1px color-mix(in srgb, var(--acc) 28%, transparent),
    0 20px 40px -24px rgba(15, 23, 42, 0.22);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s ease, box-shadow 0.35s ease;
}
.aeroguard-home .sphere-stage.is-dragging .stat-card,
.aeroguard-home .stat-card.no-anim {
  transition: none;
}
/* Blur (backdrop-filter) hanya dipakai di kartu tengah (rotasi ~0deg, nyaris
   datar) — kartu samping tetap solid tanpa blur supaya aman dari bug WebKit
   yang dikenal soal backdrop-filter di dalam elemen ber-perspective/rotateY. */
.aeroguard-home .stat-card.is-center {
  /* Warna solid rata, tanpa lapisan putih/semburat — sempat dicoba dikasih
     highlight kaca & sapuan diagonal putih tapi malah kelihatan kaya
     semburat kotor, jadi dibalikin flat sesuai var(--acc)/--acc2 saja. */
  background: linear-gradient(145deg, var(--acc) 0%, var(--acc2) 100%);
  border-color: var(--acc2);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  /* Bevel lebih tegas di kartu tengah, tintnya ikut var(--acc)/--acc2 —
     highlight terang di tepi atas, rim pucat & bayangan gelap senada warna
     kartu di tepi bawah, kesan bingkai logam mengkilap yg "pas" warnanya. */
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.85),
    inset 0 0 0 1px color-mix(in srgb, var(--acc2) 60%, white),
    inset 0 -1.5px 0 color-mix(in srgb, var(--acc) 60%, black),
    0 0 0 1px color-mix(in srgb, var(--acc) 35%, transparent),
    0 20px 40px -16px color-mix(in srgb, var(--acc) 55%, transparent);
}
/* Cahaya lembut di pojok kartu — detail dekoratif supaya tiap kartu terasa
   "hidup", bukan blok warna polos rata. */
.aeroguard-home .stat-card::after {
  content: '';
  position: absolute;
  top: -40%; right: -20%;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--acc) 16%, transparent) 0%, transparent 70%);
  pointer-events: none;
}
.aeroguard-home .stat-card.is-center::after {
  width: 220px; height: 220px;
  background: radial-gradient(circle, color-mix(in srgb, var(--acc2) 30%, transparent) 0%, transparent 70%);
}
.aeroguard-home .stat-card.is-center .stat-inner {
  position: relative;
  z-index: 1;
}
/* Semua elemen di dalam kartu gradasi dibuat putih supaya tetap kontras. */
.aeroguard-home .stat-card.is-center .stat-card-title { color: #ffffff; }
.aeroguard-home .stat-card.is-center .stat-big {
  background: none;
  -webkit-text-fill-color: #ffffff;
  color: #ffffff;
}
.aeroguard-home .stat-card.is-center .stat-big small {
  -webkit-text-fill-color: rgba(255, 255, 255, 0.78);
  color: rgba(255, 255, 255, 0.78);
}
.aeroguard-home .stat-card.is-center .stat-note { color: rgba(255, 255, 255, 0.82); }
.aeroguard-home .stat-card.is-center .stat-more { color: #ffffff; }
.aeroguard-home .stat-card.is-center .mini-bar { background: rgba(255, 255, 255, 0.55); }
.aeroguard-home .stat-card.is-center .hchip {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}
.aeroguard-home .stat-card.is-center::before { display: none; }
.aeroguard-home .stat-card:focus,
.aeroguard-home .stat-card:focus-visible { outline: none; }
.aeroguard-home .stat-card:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 45%, transparent), 0 20px 40px -24px rgba(15, 23, 42, 0.3);
}
.aeroguard-home .stat-inner {
  display: flex; flex-direction: column; gap: 12px; height: 100%;
}
.aeroguard-home .stat-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.aeroguard-home .stat-card-title { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: #0f172a; }
.aeroguard-home .stat-big { margin: 0; font-size: clamp(26px, 5vw, 34px); font-weight: 700; color: #0f172a; letter-spacing: -1px; }
.aeroguard-home .stat-big small { font-size: 13px; font-weight: 700; color: rgba(15, 23, 42, 0.45); margin-left: 4px; }
.aeroguard-home .stat-note { margin: 0; font-size: 11.5px; color: rgba(15, 23, 42, 0.6); }
.aeroguard-home .stat-more {
  margin-top: auto; display: inline-flex; align-items: center; gap: 2px;
  font-size: 12px; font-weight: 700; color: #2563eb;
}

/* mini bars */
.aeroguard-home .mini-bars { display: flex; align-items: flex-end; gap: 4px; height: var(--bars-h); }
.aeroguard-home .mini-bar { flex: 1; border-radius: 3px; background: linear-gradient(180deg, #60a5fa, #2563eb); }

/* dot indikator */
.aeroguard-home .sphere-dots { display: flex; justify-content: center; gap: 7px; }
.aeroguard-home .sphere-dot {
  width: 7px; height: 7px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
  background: rgba(37, 99, 235, 0.2); transition: all 0.2s ease;
}
.aeroguard-home .sphere-dot.is-active { width: 20px; border-radius: 999px; background: #2563eb; }

/* ----- Aksen judul section: tiap blok punya nuansa sendiri (sama2 biru, beda intensitas) ----- */
.aeroguard-home .stats-head .section-title { display: flex; align-items: center; gap: 9px; }
.aeroguard-home .stats-head .section-title::before {
  content: ''; width: 4px; height: 16px; border-radius: 4px; flex-shrink: 0;
  background: linear-gradient(180deg, #60a5fa, #2563eb);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
}
.aeroguard-home .act-section .section-title::before {
  background: linear-gradient(180deg, #38bdf8, #0284c7);
  box-shadow: 0 0 10px rgba(2, 132, 199, 0.4);
}

/* ----- My Activity + Filter ----- */
.aeroguard-home .filter-row {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
}
.aeroguard-home .filter-row::-webkit-scrollbar { display: none; }
.aeroguard-home .filter-chip {
  flex: 0 0 auto; border: 1px solid rgba(37, 99, 235, 0.16); cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; padding: 8px 16px; border-radius: 999px;
  background: #ffffff;
  color: rgba(15, 23, 42, 0.7); transition: all 0.15s ease;
  box-shadow: 0 10px 24px -20px rgba(15, 23, 42, 0.18);
}
.aeroguard-home .filter-chip.is-active {
  color: #fff; background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
}

/* Activity list: 1 kolom default → 2 kolom di ≥ 560px */
.aeroguard-home .act-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 560px) {
  .aeroguard-home .act-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .aeroguard-home .act-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.aeroguard-home .act-item {
  display: flex; align-items: center; gap: 12px; background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 16px; padding: 12px 14px; box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
  cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 0;
}
.aeroguard-home .act-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(15, 23, 42, 0.2);
}
.aeroguard-home .act-ic { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-content: center; }
.aeroguard-home .act-ic.is-orange { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }
.aeroguard-home .act-ic.is-blue { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.aeroguard-home .act-ic.is-green { background: rgba(16, 185, 129, 0.14); color: #047857; }
.aeroguard-home .act-ic.is-cyan { background: rgba(245, 158, 11, 0.14); color: #b45309; }
.aeroguard-home .act-body { flex: 1; min-width: 0; overflow: hidden; }
.aeroguard-home .act-name { margin: 0; font-size: 13.5px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aeroguard-home .act-meta { margin: 3px 0 0; font-size: 11.5px; color: rgba(15, 23, 42, 0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aeroguard-home .act-time { font-size: 12px; font-weight: 700; color: rgba(15, 23, 42, 0.55); white-space: nowrap; flex-shrink: 0; }
.aeroguard-home .act-empty { grid-column: 1 / -1; text-align: center; color: rgba(15, 23, 42, 0.5); padding: 24px; font-size: 13px; }

.aeroguard-home .act-toggle {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.65);
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 10px 24px -20px rgba(15, 23, 42, 0.18);
  transition: transform 0.15s ease, color 0.15s ease;
}
.aeroguard-home .act-toggle:hover { color: #2563eb; transform: translateY(-1px); }
.aeroguard-home .act-toggle svg { transition: transform 0.2s ease; flex-shrink: 0; }

/* ----- Kartu hero: sapaan + Strava dalam satu panel ----- */
.aeroguard-home .hero-card {
  position: relative; z-index: 20; overflow: hidden; border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  box-shadow:
    0 24px 48px -30px rgba(15, 23, 42, 0.25),
    0 14px 36px -20px rgba(37, 99, 235, 0.12);
}
/* Garis gradien biru di tepi atas (chrome umum, bukan Strava) */
.aeroguard-home .hero-card::before {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 2px; border-radius: 24px 24px 0 0;
  background: linear-gradient(90deg, transparent, #2563eb 35%, #60a5fa 65%, transparent);
  opacity: 0.8; z-index: 1;
}
.aeroguard-home .hero-card .greeting-card {
  background: transparent; border: none; box-shadow: none;
  border-radius: 0; padding: 20px 20px 16px;
}
.aeroguard-home .hero-card .greeting-card::before { display: none; }
.aeroguard-home .hero-card .strava-card {
  position: relative;
  background: linear-gradient(135deg, rgba(252, 100, 45, 0.1) 0%, rgba(255, 145, 77, 0.05) 100%);
  border: none;
  border-radius: 0; padding: 16px 20px;
}
/* Garis pemisah tipis gradien (senada aksen biru di tepi atas kartu), bukan
   border-top polos — supaya transisi antar panel terasa lebih halus. */
.aeroguard-home .hero-card .strava-card::before {
  content: ''; position: absolute; left: 20px; right: 20px; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.14) 15%, rgba(37, 99, 235, 0.14) 85%, transparent);
}
.aeroguard-home .hero-card .strava-card.is-disconnected { background: rgba(15, 23, 42, 0.025); }
.aeroguard-home .hero-card .strava-title { font-size: 14px; }
.aeroguard-home .hero-card .strava-sub { color: rgba(15, 23, 42, 0.55); }
.aeroguard-home .hero-card .hello { font-size: 20px; }
.aeroguard-home .hero-card .avatar {
  width: 50px; height: 50px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14), 0 10px 20px -8px rgba(37, 99, 235, 0.4);
}
.aeroguard-home .hero-card .strava-icon {
  width: 44px; height: 44px; border-radius: 14px;
  box-shadow: 0 0 0 4px rgba(252, 100, 45, 0.12), 0 10px 20px -8px rgba(252, 100, 45, 0.6);
}
.aeroguard-home .hero-card .strava-sync {
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 22px -12px rgba(252, 76, 2, 0.9);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
/* Micro-interaction: sedikit mengangkat & menyala saat hover, mengecil saat ditekan */
.aeroguard-home .hero-card .strava-sync:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -12px rgba(252, 76, 2, 1);
}
.aeroguard-home .hero-card .strava-sync:active:not(:disabled) {
  transform: scale(0.96);
}


/* ========== TAMPILAN LEBIH HIDUP (hanya visual, struktur & data tetap) ========== */

/* Warna per jenis statistik — tiap kartu punya identitas sendiri, dipilih dari
   makna metriknya (bukan rainbow acak): jarak = biru (brand umum), detak
   jantung = merah muda (denyut), kalori = oranye hangat (energi/panas),
   effort = ungu (intensitas). Supaya carousel tak terasa monoton satu warna. */
.aeroguard-home .stat-card { --acc: #2563eb; --acc2: #60a5fa; }
.aeroguard-home .stat-distance   { --acc: #2563eb; --acc2: #60a5fa; }
.aeroguard-home .stat-heart-rate { --acc: #e11d48; --acc2: #fb7185; }
.aeroguard-home .stat-calories   { --acc: #d97706; --acc2: #fbbf24; }
.aeroguard-home .stat-effort     { --acc: #7c3aed; --acc2: #c4b5fd; }

/* Garis aksen tipis di tepi atas kartu */
/* Garis aksen hanya di kartu tengah; kartu samping tidak miring-melayang */
.aeroguard-home .stat-card:not(.is-center)::before { display: none; }
.aeroguard-home .stat-card::before {
  content: ''; position: absolute; left: 22px; right: 22px; top: 0; height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--acc), var(--acc2));
  opacity: 0.9;
}
/* Angka utama dengan gradasi warna kartunya */
.aeroguard-home .stat-card .stat-big {
  background: linear-gradient(95deg, #0f172a 35%, var(--acc));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.aeroguard-home .stat-card .stat-big small { -webkit-text-fill-color: rgba(15, 23, 42, 0.45); }
/* Batang mini mengikuti warna kartu */
.aeroguard-home .stat-card .mini-bar { background: linear-gradient(180deg, var(--acc2), var(--acc)); }
.aeroguard-home .stat-card.is-center {
  animation: none;
}

/* Baris aktivitas: garis warna di kiri sesuai jenis (lari/gym — fungsi penanda
   jenis, bukan dekorasi acak). */
.aeroguard-home .act-item {
  position: relative; overflow: hidden;
}
.aeroguard-home .act-item::before {
  content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #fbbf24, #d97706);
}
.aeroguard-home .act-item:has(.is-orange)::before { background: linear-gradient(180deg, #60a5fa, #2563eb); }

/* Daftar aktivitas kosong: kotak putus-putus yang lebih terlihat */
.aeroguard-home .act-empty {
  border: 1px dashed rgba(37, 99, 235, 0.25); border-radius: 18px;
  background: rgba(37, 99, 235, 0.04);
  color: rgba(15, 23, 42, 0.6);
}

/* Blok statistik muncul bertahap saat halaman dibuka */
@keyframes home-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.aeroguard-home .greeting-card,
.aeroguard-home .strava-card,
.aeroguard-home .stats-wrap { animation: home-rise 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) backwards; }
.aeroguard-home .strava-card { animation-delay: 0.06s; }
.aeroguard-home .stats-wrap:nth-of-type(1) { animation-delay: 0.12s; }
.aeroguard-home .stats-wrap:nth-of-type(2) { animation-delay: 0.18s; }

@media (prefers-reduced-motion: reduce) {
  .aeroguard-home .greeting-card,
  .aeroguard-home .strava-card,
  .aeroguard-home .stats-wrap,
  .aeroguard-home .stat-card.is-center { animation: none; }
}
</style>
