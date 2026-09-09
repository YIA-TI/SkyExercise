<template>
<div class="aeroguard-home">
  <div class="app-column">

    <!-- Header sapaan -->
    <header class="greeting-card">
      <div class="greeting-left">
        <div class="avatar">{{ initials }}</div>
        <div class="greeting-text">
          <p class="hello">Halo, {{ firstName }}!</p>
          <p class="role">Anggota ARFF · Siap latihan</p>
        </div>
      </div>
      <button class="icon-btn" type="button" aria-label="Notifikasi">
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
          <p class="strava-title">Terhubung dengan Strava</p>
          <p class="strava-sub">Sinkron terakhir: {{ stravaState.lastSynced }}</p>
        </div>
        <div v-else>
          <p class="strava-title">Strava belum terhubung</p>
          <p class="strava-sub">Hubungkan untuk sinkron aktivitas otomatis</p>
        </div>
      </div>
      <button v-if="stravaState.connected" class="strava-sync" type="button" :disabled="syncing" @click="handleSync">
        <svg class="spin-icon" :class="{ 'is-spinning': syncing }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {{ syncing ? 'Menyinkronkan…' : 'Sinkronkan' }}
      </button>
      <button v-else class="strava-sync" type="button" @click="goConnectStrava">Hubungkan</button>
    </div>

    <!-- Reminder mingguan: update berat badan -->
    <div v-if="showWeightReminder" class="weight-reminder">
      <span class="weight-reminder-text">Sudah 7 hari — update berat badan kamu untuk BMI yang akurat.</span>
      <div class="weight-reminder-actions">
        <button class="weight-reminder-btn" type="button" @click="goUpdateWeight">Update</button>
        <button class="weight-reminder-dismiss" type="button" aria-label="Tutup" @click="dismissWeightReminder">✕</button>
      </div>
    </div>

    <!-- Statistik — coverflow 3D, putar & pilih -->
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">Statistik</h2>
        <RefreshingBadge v-if="statsLoading && stats" />
        <span v-else class="swipe-hint">Putar ↔</span>
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
            :class="{ 'is-center': isCenter(i), 'no-anim': noAnim[i] }"
            :style="cardStyle(i)"
            tabindex="0"
            @click="onCardClick(i)"
            @keyup.enter="onCardClick(i)"
          >
            <div class="stat-inner">
              <!-- Jarak -->
              <template v-if="c.type === 'distance'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Jarak</span>
                  <span class="hchip">Minggu ini</span>
                </div>
                <p class="stat-big mono">{{ distance.weekKm }}<small>km</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in distance.bars" :key="k" class="mini-bar" :style="{ height: h + '%' }"></span>
                </div>
                <p class="stat-note">Pace {{ distance.pace }} /km · {{ distance.runCount }} lari</p>
              </template>

              <!-- Detak Jantung (avg/max per sesi — Strava) -->
              <template v-else-if="c.type === 'heart-rate'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Detak Jantung</span>
                  <span class="hchip hchip--orange">Sesi terakhir</span>
                </div>
                <p class="stat-big mono">{{ heartRate.avg }}<small>bpm avg</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in heartRate.bars" :key="k" class="mini-bar" :style="{ height: (h - 100) + '%' }"></span>
                </div>
                <p class="stat-note">Maks {{ heartRate.max }} bpm</p>
              </template>

              <!-- Kalori (tanpa makro) -->
              <template v-else-if="c.type === 'calories'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Kalori</span>
                  <span class="hchip">Hari ini</span>
                </div>
                <p class="stat-big mono">{{ calories.today }}<small>kkal</small></p>
                <p class="stat-note">Sesi terakhir {{ calories.lastSession }} kkal terbakar</p>
              </template>

              <!-- Relative Effort (suffer score — Strava) -->
              <template v-else-if="c.type === 'effort'">
                <div class="stat-card-head">
                  <span class="stat-card-title">Relative Effort</span>
                  <span class="hchip hchip--orange">Zona {{ effort.zone }}</span>
                </div>
                <p class="stat-big mono">{{ effort.last }}<small>poin</small></p>
                <div class="mini-bars">
                  <span v-for="(h, k) in effort.bars" :key="k" class="mini-bar" :style="{ height: h + '%' }"></span>
                </div>
                <p class="stat-note">Minggu ini {{ effort.weekTotal }} poin</p>
              </template>

              <span class="stat-more">
                {{ isCenter(i) ? 'Ketuk untuk detail' : 'Geser ke tengah' }}
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
          :aria-label="`Ke kartu ${i + 1}`"
          @click="goTo(i)"
        ></button>
      </div>
    </section>

    <!-- My Activity + Filter -->
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">My Activity</h2>
        <RefreshingBadge v-if="activitiesLoading && rawActivities" />
        <span v-else class="hchip">{{ filteredActivities.length }} aktivitas</span>
      </div>

      <div class="filter-row">
        <button
          v-for="f in filters"
          :key="f"
          class="filter-chip"
          :class="{ 'is-active': activeFilter === f }"
          @click="activeFilter = f"
        >{{ f }}</button>
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
        <p v-if="filteredActivities.length === 0" class="act-empty">Tidak ada aktivitas untuk filter ini.</p>
      </div>

      <button
        v-if="filteredActivities.length > INITIAL_VISIBLE"
        class="act-toggle"
        type="button"
        @click="showAllActivities = !showAllActivities"
      >
        {{ showAllActivities ? 'Sembunyikan' : `Tampilkan Semua (${filteredActivities.length})` }}
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
import RefreshingBadge from './RefreshingBadge.vue'
import { formatDateTime } from '../lib/normalize.js'
import { showToast } from '../store/toast.js'

const router = useRouter()

const displayName = computed(() => authState.userName || 'Citra Dewi')
const firstName = computed(() => displayName.value.split(' ')[0])
const initials = computed(() =>
  displayName.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

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
    newlyUnlocked.forEach((a) => showToast(`Achievement baru: ${a.name}!`))
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
    opacity: hidden ? 0 : 1 - abs * 0.22,
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

const filters = ['Semua', 'Lari', 'Gym']
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

/* ========== HOME DASHBOARD ========== */

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
  /* Latar bold ala peta rute Strava — grain + gradient besar & jenuh, plus drift
     lambat supaya terasa hidup. Garis diagonal (::before) & motif rute (::after)
     ada di lapisan terpisah supaya masing-masing bisa berdenyut (pulse) sendiri. */
  background-image:
    var(--grain),
    radial-gradient(880px 440px at 100% -8%, rgba(252, 76, 2, 0.22), transparent 62%),
    radial-gradient(800px 480px at -10% 108%, rgba(124, 58, 237, 0.30), transparent 58%),
    linear-gradient(160deg, #3b1a0a 0%, #4c1d95 45%, #1e1b4b 75%, #0f0a2e 100%);
  background-color: #0f0a2e;
  background-repeat: repeat, no-repeat, no-repeat, no-repeat;
  background-size: 180px 180px, auto, auto, cover;
  background-attachment: fixed;
  animation: bg-drift 18s ease-in-out infinite;
  font-family: "Chakra Petch", system-ui, sans-serif;
  box-sizing: border-box;
}

/* Garis diagonal ganda (oranye/teal, saling silang) — lapisan terpisah supaya
   bisa berdenyut (pulse) sendiri, kesan "detak" energi ala Strava. */
.aeroguard-home::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(135deg, rgba(252, 76, 2, 0.09) 0, rgba(252, 76, 2, 0.09) 3px, transparent 3px, transparent 46px),
    repeating-linear-gradient(45deg, rgba(196, 181, 253, 0.08) 0, rgba(196, 181, 253, 0.08) 2px, transparent 2px, transparent 70px);
  animation: stripe-pulse 3s ease-in-out infinite;
}

/* Motif rute GPS di sudut — lapisan terpisah dengan ritme pulse sendiri (denyut
   live-tracking), letaknya tak ikut drift latar utama. */
.aeroguard-home::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--route-line);
  background-repeat: no-repeat;
  background-size: 640px 640px;
  background-position: 110% 110%;
  animation: route-pulse 2.5s ease-in-out infinite;
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
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #F8FAFC;
}

/* ----- Greeting ----- */
.aeroguard-home .greeting-card {
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: 22px; color: #F8FAFC;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 36px -28px rgba(15, 23, 42, 0.4);
}
.aeroguard-home .greeting-card::before {
  content: ''; position: absolute; top: -70%; right: -6%;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(252, 76, 2, 0.16) 0%, rgba(252, 76, 2, 0) 70%);
  pointer-events: none;
}
.aeroguard-home .greeting-left { position: relative; display: flex; align-items: center; gap: 12px; }
.aeroguard-home .avatar {
  width: 44px; height: 44px; border-radius: 14px; display: grid; place-content: center;
  color: #fff; font-weight: 700; font-size: 15px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 8px 18px -8px rgba(252, 100, 45, 0.7);
  flex-shrink: 0;
}
.aeroguard-home .hello { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
.aeroguard-home .role { margin: 2px 0 0; font-size: 12px; color: rgba(248, 250, 252, 0.65); }
.aeroguard-home .icon-btn {
  position: relative; display: grid; place-content: center; width: 40px; height: 40px;
  border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.14); cursor: pointer; color: rgba(248, 250, 252, 0.75);
  background: rgba(255, 255, 255, 0.08); flex-shrink: 0;
}
.aeroguard-home .icon-btn .dot {
  position: absolute; top: 9px; right: 10px; width: 8px; height: 8px; border-radius: 50%;
  background: #fc4c02; border: 2px solid rgba(255, 255, 255, 0.3);
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
.aeroguard-home .strava-title { margin: 0; font-size: 13.5px; font-weight: 700; color: #F8FAFC; }
.aeroguard-home .strava-sub { margin: 2px 0 0; font-size: 11.5px; color: rgba(248, 250, 252, 0.65); }
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
.aeroguard-home .swipe-hint { font-size: 12px; font-weight: 600; color: rgba(248, 250, 252, 0.5); }
.aeroguard-home .hchip {
  font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.10); color: rgba(248, 250, 252, 0.75); white-space: nowrap;
}
.aeroguard-home .hchip--orange { background: rgba(251, 146, 60, 0.18); color: #FDBA74; }
.aeroguard-home .hchip--green { background: rgba(52, 211, 153, 0.18); color: #6EE7B7; }

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
  /* Kartu samping tetap solid (bukan transparan tipis) supaya tak "hilang" di
     atas latar — lihat catatan di bawah soal kenapa blur tak dipakai di sini. */
  background: rgba(30, 27, 75, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 26px;
  padding: var(--card-pad);
  overflow: hidden;
  box-shadow: 0 20px 40px -24px rgba(17, 18, 20, 0.5);
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
   yang dikenal soal backdrop-filter di dalam elemen ber-perspective/rotateY.
   Opacity latar & blur dinaikkan (dari 0.10/14px) supaya efek glass tak
   terlalu tembus pandang. */
.aeroguard-home .stat-card.is-center {
  background: rgba(30, 27, 75, 0.42);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  /* Diperkecil jangkauannya (dari 0 30px 55px -20px) — glow sebesar itu
     "bocor" sampai dekat batas section berikutnya & masih kelihatan terpotong
     meski overflow-y sudah visible. Sekarang muat di buffer .sphere sendiri. */
  box-shadow: 0 14px 28px -14px rgba(252, 76, 2, 0.4);
}
.aeroguard-home .stat-card:focus,
.aeroguard-home .stat-card:focus-visible { outline: none; }
.aeroguard-home .stat-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(252, 76, 2, 0.4), 0 20px 40px -24px rgba(17, 18, 20, 0.5);
}
.aeroguard-home .stat-inner {
  display: flex; flex-direction: column; gap: 12px; height: 100%;
}
.aeroguard-home .stat-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.aeroguard-home .stat-card-title { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; color: #F8FAFC; }
.aeroguard-home .stat-big { margin: 0; font-size: clamp(26px, 5vw, 34px); font-weight: 700; color: #F8FAFC; letter-spacing: -1px; }
.aeroguard-home .stat-big small { font-size: 13px; font-weight: 700; color: rgba(248, 250, 252, 0.5); margin-left: 4px; }
.aeroguard-home .stat-note { margin: 0; font-size: 11.5px; color: rgba(248, 250, 252, 0.65); }
.aeroguard-home .stat-more {
  margin-top: auto; display: inline-flex; align-items: center; gap: 2px;
  font-size: 12px; font-weight: 700; color: #fc4c02;
}

/* mini bars */
.aeroguard-home .mini-bars { display: flex; align-items: flex-end; gap: 4px; height: var(--bars-h); }
.aeroguard-home .mini-bar { flex: 1; border-radius: 3px; background: linear-gradient(180deg, #ff914d, #fc4c02); }

/* dot indikator */
.aeroguard-home .sphere-dots { display: flex; justify-content: center; gap: 7px; }
.aeroguard-home .sphere-dot {
  width: 7px; height: 7px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
  background: rgba(255, 255, 255, 0.25); transition: all 0.2s ease;
}
.aeroguard-home .sphere-dot.is-active { width: 20px; border-radius: 999px; background: #fc4c02; }

/* ----- My Activity + Filter ----- */
.aeroguard-home .filter-row {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
}
.aeroguard-home .filter-row::-webkit-scrollbar { display: none; }
.aeroguard-home .filter-chip {
  flex: 0 0 auto; border: 1px solid rgba(255, 255, 255, 0.16); cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; padding: 8px 16px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  color: rgba(248, 250, 252, 0.75); transition: all 0.15s ease;
  box-shadow: 0 10px 24px -20px rgba(17, 18, 20, 0.5);
}
.aeroguard-home .filter-chip.is-active {
  color: #fff; background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
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
  display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px; padding: 12px 14px; box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 0;
}
.aeroguard-home .act-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px -22px rgba(17, 18, 20, 0.45);
}
.aeroguard-home .act-ic { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: grid; place-content: center; }
.aeroguard-home .act-ic.is-orange { background: rgba(251, 146, 60, 0.18); color: #FDBA74; }
.aeroguard-home .act-ic.is-blue { background: rgba(45, 212, 191, 0.18); color: #5EEAD4; }
.aeroguard-home .act-ic.is-green { background: rgba(52, 211, 153, 0.18); color: #6EE7B7; }
.aeroguard-home .act-ic.is-cyan { background: rgba(45, 212, 191, 0.18); color: #5EEAD4; }
.aeroguard-home .act-body { flex: 1; min-width: 0; overflow: hidden; }
.aeroguard-home .act-name { margin: 0; font-size: 13.5px; font-weight: 700; color: #F8FAFC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aeroguard-home .act-meta { margin: 3px 0 0; font-size: 11.5px; color: rgba(248, 250, 252, 0.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aeroguard-home .act-time { font-size: 12px; font-weight: 700; color: rgba(248, 250, 252, 0.65); white-space: nowrap; flex-shrink: 0; }
.aeroguard-home .act-empty { grid-column: 1 / -1; text-align: center; color: rgba(248, 250, 252, 0.5); padding: 24px; font-size: 13px; }

.aeroguard-home .act-toggle {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.75);
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 10px 24px -20px rgba(17, 18, 20, 0.5);
  transition: transform 0.15s ease, color 0.15s ease;
}
.aeroguard-home .act-toggle:hover { color: #fc4c02; transform: translateY(-1px); }
.aeroguard-home .act-toggle svg { transition: transform 0.2s ease; flex-shrink: 0; }
</style>
