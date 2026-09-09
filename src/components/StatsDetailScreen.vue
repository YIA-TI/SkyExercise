<template>
<div class="mui">
  <div class="mui-col">
    <!-- Header -->
    <header class="mui-header">
      <div class="h-left">
        <button class="sd-back" type="button" aria-label="Kembali" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">{{ meta.title }}</p>
          <p class="mui-h-sub">{{ meta.sub }}</p>
        </div>
      </div>
      <span class="mui-pill">{{ meta.pill }}</span>
    </header>

    <div v-if="loading && !stats" class="mui-card sd-hero">
      <div class="mui-skel" style="width: 60%; height: 34px; margin: 0 auto;"></div>
      <div class="mui-skel mui-skel--text" style="width: 80%; margin: 12px auto 0;"></div>
    </div>
    <template v-else>
    <!-- ── Jarak ── -->
    <template v-if="type === 'distance'">
      <div class="mui-card sd-hero">
        <p class="sd-hero-value mui-mono">{{ distance.weekKm }}<small>km</small></p>
        <p class="sd-hero-note">Total jarak lari <b>7 hari terakhir</b> · {{ distance.runCount }} lari.</p>
        <div class="sd-bars">
          <span v-for="(h, i) in distance.bars" :key="i" class="sd-bar" :style="{ height: h + '%' }"></span>
        </div>
      </div>
      <div class="sd-mini-grid">
        <div class="sd-mini"><p class="sd-mini-label">Pace</p><p class="sd-mini-value mui-mono">{{ distance.pace }}</p></div>
        <div class="sd-mini"><p class="sd-mini-label">Pace Terbaik</p><p class="sd-mini-value mui-mono">{{ distance.bestPace }}</p></div>
        <div class="sd-mini"><p class="sd-mini-label">Elevasi</p><p class="sd-mini-value mui-mono">{{ distance.elevation }} m</p></div>
      </div>
      <section class="sd-block">
        <h2 class="mui-section-title">Lari Terbaru</h2>
        <div class="mui-card sd-list">
          <div v-for="r in distance.recent" :key="r.name" class="sd-row">
            <span class="sd-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </span>
            <div class="sd-row-body">
              <p class="sd-row-name">{{ r.name }}</p>
              <p class="sd-row-time">{{ r.date }} · pace {{ r.pace }} /km</p>
            </div>
            <span class="sd-row-val mui-mono">{{ r.km }} km</span>
          </div>
          <p v-if="distance.recent.length === 0" class="sd-empty">Belum ada aktivitas lari.</p>
        </div>
      </section>
    </template>

    <!-- ── Detak Jantung (avg/max — Strava) ── -->
    <template v-else-if="type === 'heart-rate'">
      <div class="mui-card sd-hero">
        <p class="sd-hero-value mui-mono">{{ heartRate.avg }}<small>bpm</small></p>
        <p class="sd-hero-note">Detak jantung <b>rata-rata</b> sesi terakhir (maks {{ heartRate.max }} bpm).</p>
        <div class="sd-bars">
          <span v-for="(h, i) in heartRate.bars" :key="i" class="sd-bar" :style="{ height: h + '%' }"></span>
        </div>
      </div>
      <div class="sd-mini-grid sd-mini-grid--2">
        <div class="sd-mini"><p class="sd-mini-label">Rata-rata</p><p class="sd-mini-value mui-mono">{{ heartRate.avg }}</p></div>
        <div class="sd-mini"><p class="sd-mini-label">Maksimum</p><p class="sd-mini-value mui-mono">{{ heartRate.max }}</p></div>
      </div>
      <section class="sd-block">
        <h2 class="mui-section-title">Lari Terbaru</h2>
        <div class="mui-card sd-list">
          <div v-for="r in distance.recent" :key="r.name + r.date" class="sd-row">
            <span class="sd-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </span>
            <div class="sd-row-body">
              <p class="sd-row-name">{{ r.name }}</p>
              <p class="sd-row-time">{{ r.date }}</p>
            </div>
            <span class="sd-row-val mui-mono">{{ r.avgHr }} bpm</span>
          </div>
          <p v-if="distance.recent.length === 0" class="sd-empty">Belum ada aktivitas lari.</p>
        </div>
      </section>
    </template>

    <!-- ── Kalori (tanpa makro) ── -->
    <template v-else-if="type === 'calories'">
      <div class="mui-card sd-hero">
        <p class="sd-hero-value mui-mono">{{ calories.today }}<small>kkal</small></p>
        <p class="sd-hero-note">Total kalori terbakar dari aktivitas <b>hari ini</b>.</p>
      </div>
      <section class="sd-block">
        <h2 class="mui-section-title">Per Aktivitas</h2>
        <div class="mui-card sd-list">
          <div v-for="a in calories.perActivity" :key="a.name" class="sd-row">
            <span class="sd-dot" :style="{ background: a.type === 'Lari' ? '#fc4c02' : '#0d9488' }"></span>
            <div class="sd-row-body">
              <p class="sd-row-name">{{ a.name }}</p>
              <p class="sd-row-time">{{ a.type }}</p>
            </div>
            <span class="sd-row-val mui-mono">{{ a.kcal }} kkal</span>
          </div>
          <p v-if="calories.perActivity.length === 0" class="sd-empty">Belum ada aktivitas hari ini.</p>
        </div>
      </section>
    </template>

    <!-- ── Relative Effort (suffer score — Strava) ── -->
    <template v-else-if="type === 'effort'">
      <div class="mui-card sd-hero">
        <p class="sd-hero-value mui-mono">{{ effort.last }}<small>poin</small></p>
        <p class="sd-hero-note">Relative Effort (suffer score) sesi terakhir — zona <b>{{ effort.zone }}</b>.</p>
        <div class="sd-bars">
          <span v-for="(h, i) in effort.bars" :key="i" class="sd-bar" :style="{ height: h + '%' }"></span>
        </div>
      </div>
      <div class="sd-mini-grid sd-mini-grid--2">
        <div class="sd-mini"><p class="sd-mini-label">Minggu Ini</p><p class="sd-mini-value mui-mono">{{ effort.weekTotal }}</p></div>
        <div class="sd-mini"><p class="sd-mini-label">Zona</p><p class="sd-mini-value mui-mono">{{ effort.zone }}</p></div>
      </div>
    </template>
    </template>
  </div>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  distance as mockDistance,
  heartRate as mockHeartRate,
  calories as mockCalories,
  effort as mockEffort,
} from '../store/stats.js'
import { useHomeStats } from '../composables/useMemberData.js'

const route = useRoute()
const router = useRouter()

// Statistik nyata (Strava via Supabase) — fallback ke skeleton mock saat loading/kosong.
const { stats, loading } = useHomeStats()
const distance = computed(() => ({ ...mockDistance, ...(stats.value?.distance || {}) }))
const heartRate = computed(() => ({ ...mockHeartRate, ...(stats.value?.heartRate || {}) }))
const calories = computed(() => ({ ...mockCalories, ...(stats.value?.calories || {}) }))
const effort = computed(() => ({ ...mockEffort, ...(stats.value?.effort || {}) }))

const type = computed(() => route.params.type)

const metaMap = {
  distance:     { title: 'Jarak', sub: 'Lari 7 hari terakhir', pill: 'Strava' },
  'heart-rate': { title: 'Detak Jantung', sub: 'Rata-rata & maksimum', pill: 'Sesi terakhir' },
  calories:     { title: 'Kalori', sub: 'Dari aktivitas', pill: 'Hari ini' },
  effort:       { title: 'Relative Effort', sub: 'Intensitas latihan', pill: 'Strava' },
}
const meta = computed(() => metaMap[type.value] || { title: 'Statistik', sub: '', pill: '' })

function kembali() { router.push('/home') }
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.sd-back {
  width: 40px; height: 40px; border-radius: 12px; cursor: pointer;
  display: grid; place-content: center; color: #F8FAFC;
  background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.14);
}

.sd-block { display: flex; flex-direction: column; gap: 12px; }

/* Hero */
.sd-hero { display: flex; flex-direction: column; gap: 12px; }
.sd-hero-value { margin: 0; font-size: 40px; font-weight: 700; color: #F8FAFC; letter-spacing: -1.5px; }
.sd-hero-value small { font-size: 15px; font-weight: 700; color: rgba(248, 250, 252, 0.5); margin-left: 5px; }
.sd-hero-note { margin: 0; font-size: 13px; line-height: 19px; color: rgba(248, 250, 252, 0.75); }

/* Bars */
.sd-bars { display: flex; align-items: flex-end; gap: 5px; height: 90px; }
.sd-bar { flex: 1; border-radius: 4px; background: linear-gradient(180deg, #ff914d, #fc4c02); }

/* Mini grid */
.sd-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.sd-mini-grid--2 { grid-template-columns: repeat(2, 1fr); width: 100%; }
.sd-mini { background: rgba(255, 255, 255, 0.10); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 16px; padding: 14px; box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5); }
.sd-mini-label { margin: 0 0 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(248, 250, 252, 0.5); }
.sd-mini-value { margin: 0; font-size: 22px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.5px; }

/* List rows */
.sd-list { display: flex; flex-direction: column; gap: 12px; }
.sd-row { display: flex; align-items: center; gap: 10px; }
.sd-row--active { background: #fff7ed; margin: -6px -8px; padding: 6px 8px; border-radius: 12px; }
.sd-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.sd-ic { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: grid; place-content: center; background: rgba(251, 146, 60, 0.18); color: #FDBA74; }
.sd-row-body { flex: 1; min-width: 0; }
.sd-row-name { flex: 1; margin: 0; font-size: 13.5px; font-weight: 700; color: #F8FAFC; }
.sd-row-time { margin: 2px 0 0; font-size: 11px; color: rgba(248, 250, 252, 0.5); }
.sd-row-val { font-size: 13px; font-weight: 700; color: #F8FAFC; white-space: nowrap; }
.sd-empty { text-align: center; color: rgba(248, 250, 252, 0.5); font-size: 13px; padding: 16px 0; }

</style>
