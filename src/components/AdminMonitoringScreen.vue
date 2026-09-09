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
      <DateRangeFilter v-model:start="questFilterStart" v-model:end="questFilterEnd" />

      <div v-if="summaryLoading" class="ad-stats">
        <div v-for="i in 4" :key="i" class="ad-stat">
          <div class="mui-skel mui-skel--circle" style="width: 46px; height: 46px;"></div>
          <div style="flex: 1;">
            <div class="mui-skel mui-skel--text" style="width: 50%; height: 20px;"></div>
            <div class="mui-skel mui-skel--text" style="width: 70%; margin-top: 8px;"></div>
          </div>
        </div>
      </div>
      <div v-else class="ad-stats">
        <div v-for="s in stats" :key="s.label" class="ad-stat" :class="s.cls">
          <div class="ad-stat-icon" v-html="s.icon"></div>
          <div>
            <p class="ad-stat-value mui-mono">{{ s.value }}</p>
            <p class="ad-stat-label">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <div class="ad-charts-grid">
        <div class="ad-chart">
          <p class="ad-chart-title">Distribusi Status Quest Personil</p>
          <div v-if="questLoading" class="ad-chart-rows">
            <div v-for="i in 3" :key="i" class="ad-chart-row">
              <div class="mui-skel mui-skel--text" style="width: 100px;"></div>
              <div class="mui-skel" style="height: 10px; border-radius: 6px;"></div>
              <div class="mui-skel mui-skel--text" style="width: 24px;"></div>
            </div>
          </div>
          <template v-else>
            <div class="ad-chart-rows">
              <div v-for="b in questStatusChart" :key="b.key" class="ad-chart-row">
                <span class="ad-chart-label">
                  <span class="ad-chart-dot" :style="{ background: b.color }"></span>
                  {{ b.label }}
                </span>
                <div class="ad-chart-track">
                  <div class="ad-chart-fill" :style="{ width: b.pct + '%', background: b.color }"></div>
                </div>
                <span class="ad-chart-value mui-mono">{{ b.count }}</span>
              </div>
            </div>
            <p v-if="questStatusTotal === 0" class="qf-muted">Belum ada data quest pada periode ini.</p>
          </template>
        </div>

        <div class="ad-chart">
          <p class="ad-chart-title">Selesai vs Belum Selesai — Lari &amp; GYM</p>
          <div v-if="questLoading" class="ad-chart-rows">
            <div v-for="i in 4" :key="i" class="ad-chart-row">
              <div class="mui-skel mui-skel--text" style="width: 100px;"></div>
              <div class="mui-skel" style="height: 10px; border-radius: 6px;"></div>
              <div class="mui-skel mui-skel--text" style="width: 24px;"></div>
            </div>
          </div>
          <template v-else-if="questCategoryTotal > 0">
            <div v-for="cat in questCategoryChart" :key="cat.key" class="ad-chart-group">
              <p class="ad-chart-group-title">{{ cat.label }} <span class="mui-mono">({{ cat.total }})</span></p>
              <div class="ad-chart-rows">
                <div v-for="b in cat.bars" :key="b.key" class="ad-chart-row">
                  <span class="ad-chart-label">
                    <span class="ad-chart-dot" :style="{ background: b.color }"></span>
                    {{ b.label }}
                  </span>
                  <div class="ad-chart-track">
                    <div class="ad-chart-fill" :style="{ width: b.pct + '%', background: b.color }"></div>
                  </div>
                  <span class="ad-chart-value mui-mono">{{ b.count }}</span>
                </div>
              </div>
            </div>
          </template>
          <p v-else class="qf-muted">Belum ada quest lari/gym yang berlaku pada periode ini.</p>
        </div>
      </div>

      <div class="ad-chart ad-chart--line">
        <p class="ad-chart-title">Persebaran Penyelesaian Quest Mingguan</p>
        <div v-if="questLoading" class="ad-linechart-skel">
          <div class="mui-skel" style="height: 140px; border-radius: 12px;"></div>
        </div>
        <template v-else-if="questCompletionTrend.labels.length">
          <svg class="ad-linechart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <!-- Axis dasar (garis polos, tanpa panah/grid/angka) — gaya line chart basic -->
            <line class="ad-linechart-axis" x1="6" y1="92" x2="6" y2="4" />
            <line class="ad-linechart-axis" x1="6" y1="92" x2="97" y2="92" />

            <polyline
              :points="lariLinePoints"
              fill="none"
              stroke="#fc4c02"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
            <polyline
              :points="gymLinePoints"
              fill="none"
              stroke="#7c3aed"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <!-- Label tanggal Senin tiap minggu (jeda 7 hari) — sejajar dgn titik data, karena
               titik sama-sama berjarak rata sepanjang sumbu-X (lihat trendX). -->
          <div class="ad-linechart-axis-labels">
            <span v-for="(label, i) in questCompletionTrend.labels" :key="i" class="ad-linechart-axis-label">{{ label }}</span>
          </div>
          <div class="ad-linechart-legend">
            <span class="ad-linechart-legend-item"><span class="ad-linechart-dot" style="background: #fc4c02;"></span>Lari</span>
            <span class="ad-linechart-legend-item"><span class="ad-linechart-dot" style="background: #7c3aed;"></span>GYM</span>
          </div>
        </template>
        <p v-else class="qf-muted">Belum ada data quest pada periode ini.</p>
      </div>
    </section>

    <!-- Ringkasan quest (harian + mingguan) — monitoring progress user -->
    <section class="mui-block">
      <div class="qs-head-row">
        <h2 class="mui-section-title">Ringkasan Quest</h2>
        <button class="qs-pdf-btn" type="button" :disabled="!canExportQuest || exportingQuest" @click="downloadQuestPdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ exportingQuest ? 'Menyiapkan…' : 'Download PDF' }}
        </button>
      </div>
      <div v-if="questLoading" class="qs-list qs-list--skel">
        <div v-for="i in 5" :key="i" class="qs-skel-row">
          <div class="mui-skel mui-skel--text" style="width: 38%;"></div>
          <div class="mui-skel" style="width: 70px; height: 22px; border-radius: 999px;"></div>
          <div class="mui-skel" style="width: 70px; height: 22px; border-radius: 999px;"></div>
        </div>
      </div>
      <p v-else-if="questError" class="qf-error">Gagal memuat: {{ questError.message || questError }}</p>
      <template v-else-if="questSummaryData">
        <p v-if="questProgressRows.length === 0" class="qf-muted">Belum ada personil terdaftar.</p>

        <div v-else class="qs-list">
          <template v-for="pr in questProgressRows" :key="pr.athleteId">
            <div
              class="qs-athlete-row"
              role="button"
              tabindex="0"
              @click="toggleQuestExpand(pr.athleteId)"
              @keyup.enter="toggleQuestExpand(pr.athleteId)"
            >
              <svg
                class="qs-chevron"
                :class="{ 'is-open': expandedIds.has(pr.athleteId) }"
                xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              ><polyline points="9 18 15 12 9 6"/></svg>
              <span class="qs-athlete-name">{{ pr.name }}</span>
              <span class="mui-tag mui-tag--gray">{{ athleteSummary(pr).done }}/{{ athleteSummary(pr).total }} selesai</span>
            </div>

            <template v-if="expandedIds.has(pr.athleteId)">
              <div class="qs-quest-list">
                <div v-for="qc in pr.questCols.filter((c) => c.scope !== 'bonus')" :key="qc.questId" class="qs-quest-item">
                  <div class="qs-quest-item-info">
                    <span class="qs-quest-item-name">{{ qc.title }}</span>
                    <span class="qs-quest-item-scope">
                      {{ qc.scope === 'mingguan' ? 'Mingguan' : 'Harian' }}<template v-if="columnMetaById.get(qc.questId)?.periodLabel"> · {{ columnMetaById.get(qc.questId).periodLabel }}</template>
                    </span>
                  </div>
                  <span class="qs-badge" :class="liveStatusClass(qc)">
                    <span class="qs-badge-dot"></span>{{ LIVE_STATUS_LABEL[liveStatusClass(qc)] }}
                  </span>
                  <span class="qs-progress mui-mono">{{ liveProgressText(qc) }}</span>
                </div>

                <div class="qs-totals">
                  <div class="qs-total-card qs-total-card--lari" :class="{ 'is-empty': pr.totals.lariSesi === 0 }">
                    <div class="qs-total-icon"><Footprints :size="18" :stroke-width="2.25" /></div>
                    <div class="qs-total-body">
                      <p class="qs-total-title">Total Lari</p>
                      <div v-if="pr.totals.lariSesi > 0" class="qs-total-stats">
                        <span class="qs-total-stat"><strong>{{ pr.totals.lariKm }}</strong> km</span>
                        <span class="qs-total-stat"><strong>{{ pr.totals.lariSesi }}</strong> sesi</span>
                        <span class="qs-total-stat"><strong>{{ pr.totals.lariMenit }}</strong> menit</span>
                      </div>
                      <p v-else class="qs-total-empty">Belum ada aktivitas lari</p>
                    </div>
                  </div>
                  <div class="qs-total-card qs-total-card--gym" :class="{ 'is-empty': pr.totals.gymSesi === 0 }">
                    <div class="qs-total-icon"><Dumbbell :size="18" :stroke-width="2.25" /></div>
                    <div class="qs-total-body">
                      <p class="qs-total-title">Total GYM</p>
                      <div v-if="pr.totals.gymSesi > 0" class="qs-total-stats">
                        <span class="qs-total-stat"><strong>{{ pr.totals.gymMenit }}</strong> menit</span>
                        <span class="qs-total-stat"><strong>{{ pr.totals.gymSesi }}</strong> sesi</span>
                      </div>
                      <p v-else class="qs-total-empty">Belum ada aktivitas gym</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </template>
    </section>
  </div>
</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Footprints, Dumbbell } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useAdminMonitoring, useQuestSummary } from '../composables/useAdminData.js'
import { questPeriodLabel } from '../services/questSummary.js'
import { showToast } from '../store/toast.js'
import { toDateStr } from '../lib/normalize.js'
import DateRangeFilter from './DateRangeFilter.vue'

const displayName = computed(() => authState.userName || 'Rahmat Hidayat')
const firstName = computed(() => displayName.value.split(' ')[0])
const initials = computed(() =>
  displayName.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

// ── Periode terpilih — satu filter dipakai bersama oleh Ringkasan Divisi & Ringkasan Quest ──
// Default 4 minggu penuh (Senin minggu ini - 21 hari, s.d. hari ini) — snap ke batas
// minggu supaya total selalu genap 4, bukan 5 (kalau pakai N hari kalender mentah,
// rentangnya bisa menyerempet minggu ke-5 tergantung hari apa "hari ini").
function defaultQuestStart() {
  const today = new Date()
  const dayIdx = (today.getDay() + 6) % 7 // Senin = 0
  const monday = new Date(today)
  monday.setDate(monday.getDate() - dayIdx - 21)
  return toDateStr(monday)
}
const questFilterStart = ref(defaultQuestStart())
const questFilterEnd = ref(toDateStr(new Date()))

const { summary, loading: summaryLoading } = useAdminMonitoring({ start: questFilterStart, end: questFilterEnd })
const { summary: questSummaryData, loading: questLoading, error: questError } = useQuestSummary({ start: questFilterStart, end: questFilterEnd })

// Data sudah lengkap (achieved/total/scope/unit/perWeek) dari questSummary.js — tinggal dipakai.
const questProgressRows = computed(() => questSummaryData.value?.rows ?? [])

// Header kolom: quest aktif (harian + mingguan) + satu kolom bonus di akhir.
const columnDefs = computed(() => {
  const s = questSummaryData.value
  if (!s) return []
  return [
    ...s.quests.map((q) => ({
      questId: q.id, title: q.title, scope: q.scope,
      periodLabel: questPeriodLabel(q.scope, q.quest_date),
    })),
    { questId: 'bonus-active-days', title: 'Hari Aktif (Bonus)', scope: 'bonus', periodLabel: null },
  ]
})

// 'is-na' = periode ini di luar target quest (belum berlaku / bukan hari-minggu-nya) —
// dibedakan dari 'is-none' (memang belum dikerjakan sama sekali pada periode yang berlaku).
function badgeClassQuest(qc) {
  if (!qc.total) return 'is-na'
  if (qc.achieved === 0) return 'is-none'
  if (qc.achieved === qc.total) return 'is-full'
  return 'is-partial'
}

// Status/Progress "live" per quest di daftar per-atlet — beda dari badgeClassQuest di atas
// (itu hitung jumlah periode tercapai sepanjang rentang filter, dipakai chart & PDF).
// Ini pakai capaian metrik nyata (km/sesi/menit) vs target pada periode aktif PALING AKHIR
// dlm rentang filter (mis. hari ini utk quest harian, minggu ini utk quest mingguan).
function liveStatusClass(qc) {
  if (qc.metricValue === null || !qc.metricTarget) return 'is-na'
  if (qc.metricValue <= 0) return 'is-none'
  if (qc.metricValue >= qc.metricTarget) return 'is-full'
  return 'is-partial'
}
const LIVE_STATUS_LABEL = { 'is-full': 'Selesai', 'is-partial': 'Berjalan', 'is-none': 'Belum Mulai', 'is-na': 'Belum Berlaku' }

function formatMetric(v, unit) {
  return unit === 'km' ? v.toFixed(1) : Math.round(v)
}
function liveProgressText(qc) {
  if (qc.metricValue === null || !qc.metricTarget) return 'Belum ada data'
  return `${formatMetric(qc.metricValue, qc.metricUnit)}/${formatMetric(qc.metricTarget, qc.metricUnit)} ${qc.metricUnit}`
}

// Lookup periodLabel per quest (dipakai di daftar quest per-atlet, key by questId
// krn columnDefs cuma sekali dihitung, bukan per baris atlet).
const columnMetaById = computed(() => new Map(columnDefs.value.map((c) => [c.questId, c])))

// Ringkasan "X/Y selesai" di baris atlet (kolektif, bonus dikecualikan sama spt grafik).
function athleteSummary(pr) {
  const applicable = pr.questCols.filter((qc) => qc.scope !== 'bonus' && qc.total)
  const done = applicable.filter((qc) => badgeClassQuest(qc) === 'is-full').length
  return { done, total: applicable.length }
}

// Distribusi status quest (semua personil x quest aktif, kolom bonus dikecualikan karena
// bukan target penyelesaian) — dipakai untuk grafik & kartu "Total Quest Selesai" di
// Ringkasan Divisi. Sel yang belum berlaku (qc.total === 0) dikeluarkan dari perhitungan.
const questStatusChart = computed(() => {
  const counts = { none: 0, partial: 0, full: 0 }
  for (const row of questProgressRows.value) {
    for (const qc of row.questCols) {
      if (qc.scope === 'bonus' || !qc.total) continue
      const cls = badgeClassQuest(qc)
      if (cls === 'is-full') counts.full++
      else if (cls === 'is-partial') counts.partial++
      else counts.none++
    }
  }
  const total = counts.none + counts.partial + counts.full
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)
  return [
    { key: 'none', label: 'Belum Mulai', color: '#dc2626', count: counts.none, pct: pct(counts.none) },
    { key: 'partial', label: 'Sedang Berjalan', color: '#ea580c', count: counts.partial, pct: pct(counts.partial) },
    { key: 'full', label: 'Selesai', color: '#059669', count: counts.full, pct: pct(counts.full) },
  ]
})
const questStatusTotal = computed(() => questStatusChart.value.reduce((s, b) => s + b.count, 0))
const totalQuestSelesai = computed(() => questStatusChart.value.find((b) => b.key === 'full')?.count ?? 0)

// Perbandingan selesai vs belum selesai per kategori aktivitas (Lari/GYM) — kategori
// ditentukan dari `metric` quest asli (run_* → Lari, gym_* → GYM); kolom bonus
// dikecualikan sama seperti questStatusChart di atas. Dipakai grafik bar kedua.
const questCategoryChart = computed(() => {
  const s = questSummaryData.value
  if (!s) return []
  const catByQuestId = new Map(s.quests.map((q) => [q.id, q.metric?.startsWith('gym_') ? 'gym' : 'lari']))
  const counts = { lari: { done: 0, notDone: 0 }, gym: { done: 0, notDone: 0 } }
  for (const row of questProgressRows.value) {
    for (const qc of row.questCols) {
      if (qc.scope === 'bonus' || !qc.total) continue
      const cat = catByQuestId.get(qc.questId)
      if (!cat) continue
      if (badgeClassQuest(qc) === 'is-full') counts[cat].done++
      else counts[cat].notDone++
    }
  }
  return [
    { key: 'lari', label: 'Lari' },
    { key: 'gym', label: 'GYM' },
  ].map(({ key, label }) => {
    const { done, notDone } = counts[key]
    const total = done + notDone
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0)
    return {
      key, label, total,
      bars: [
        { key: 'done', label: 'Selesai', color: '#059669', count: done, pct: pct(done) },
        { key: 'notDone', label: 'Belum Selesai', color: '#dc2626', count: notDone, pct: pct(notDone) },
      ],
    }
  })
})
const questCategoryTotal = computed(() => questCategoryChart.value.reduce((s, c) => s + c.total, 0))

// Tren mingguan penyelesaian quest per kategori (Lari/GYM) — dua seri terpisah,
// dipakai grafik garis "Persebaran Penyelesaian Quest" bergaya basic (axis panah,
// tanpa fill/dot). Kategori & penghitungan sama seperti questCategoryChart di atas,
// bedanya di sini dipecah per minggu (bukan diagregat jadi satu angka) supaya
// trennya kelihatan.
const questCompletionTrend = computed(() => {
  const s = questSummaryData.value
  if (!s || !s.weeks.length) return { labels: [], lari: [], gym: [] }
  const catByQuestId = new Map(s.quests.map((q) => [q.id, q.metric?.startsWith('gym_') ? 'gym' : 'lari']))
  const labels = []
  const lari = []
  const gym = []
  s.weeks.forEach((w, wi) => {
    let lariCount = 0
    let gymCount = 0
    for (const row of questProgressRows.value) {
      for (const qc of row.questCols) {
        if (qc.scope === 'bonus') continue
        const cat = catByQuestId.get(qc.questId)
        if (!cat) continue
        const v = qc.scope === 'mingguan' ? (qc.perWeek[wi] ? 1 : 0) : (qc.perWeek[wi] ?? 0)
        if (cat === 'gym') gymCount += v
        else lariCount += v
      }
    }
    labels.push(w.label.split(' – ')[0])
    lari.push(lariCount)
    gym.push(gymCount)
  })
  return { labels, lari, gym }
})
const trendMax = computed(() => Math.max(1, ...questCompletionTrend.value.lari, ...questCompletionTrend.value.gym))

// Koordinat dlm viewBox 0-100 — svg di-stretch penuh via preserveAspectRatio "none"
// jadi tak perlu ukur lebar container di JS. Margin kiri/bawah (AXIS_L/AXIS_B) disisakan
// utk garis axis; margin atas (AXIS_T) jaga jarak biar titik puncak tak kepotong.
const AXIS_L = 6, AXIS_R = 97, AXIS_T = 4, AXIS_B = 92
function trendX(i) {
  const n = questCompletionTrend.value.labels.length
  return n <= 1 ? (AXIS_L + AXIS_R) / 2 : AXIS_L + (i / (n - 1)) * (AXIS_R - AXIS_L)
}
function trendY(v) {
  return AXIS_B - (v / trendMax.value) * (AXIS_B - AXIS_T)
}
function trendLinePoints(values) {
  return values.map((v, i) => `${trendX(i)},${trendY(v)}`).join(' ')
}
const lariLinePoints = computed(() => trendLinePoints(questCompletionTrend.value.lari))
const gymLinePoints = computed(() => trendLinePoints(questCompletionTrend.value.gym))

const ICONS = {
  members: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  bars: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',
}

const stats = computed(() => [
  { label: 'Total Anggota', value: String(summary.value?.totalMembers ?? '—'), cls: 'is-blue', icon: ICONS.members },
  { label: 'Total Sesi', value: String(summary.value?.totalSessions ?? '—'), cls: 'is-orange', icon: ICONS.clock },
  { label: 'Total Quest Selesai', value: String(totalQuestSelesai.value ?? '—'), cls: 'is-green', icon: ICONS.check },
  { label: 'Total Peserta Aktif', value: String(summary.value?.totalMembers ?? '—'), cls: 'is-purple', icon: ICONS.bars },
]);

const expandedIds = ref(new Set())
function toggleQuestExpand(id) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

// Selalu bisa export selama ada personil — kolom bonus tetap ada meski belum ada quest aktif.
const canExportQuest = computed(() => !questLoading.value && questProgressRows.value.length > 0)
const exportingQuest = ref(false)

// jsPDF + autotable dimuat lazy — berat (ikut html2canvas), cuma dipakai di tombol ini.
// Export selalu granular per (personil, minggu), sama seperti tampilan expand.
async function downloadQuestPdf() {
  if (!canExportQuest.value || exportingQuest.value) return
  exportingQuest.value = true
  try {
    const [{ default: jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const { weeks, rows } = questSummaryData.value
    const cols = columnDefs.value

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Ringkasan Quest', 14, 16)
    doc.setFontSize(10)
    doc.text(`Periode: ${questFilterStart.value} s.d. ${questFilterEnd.value}`, 14, 22)

    const head = [['Nama', 'Minggu', ...cols.map((c) => c.title)]]
    const body = []
    rows.forEach((row) => {
      weeks.forEach((w, wi) => {
        body.push([
          row.name,
          w.label,
          ...row.questCols.map((qc) => {
            if (qc.scope === 'mingguan') {
              if (qc.perWeek[wi] === null) return 'n/a'
              return qc.perWeek[wi] ? 'Tercapai' : '-'
            }
            if (qc.scope === 'bonus') {
              const list = qc.perWeek[wi]
              if (!list.length) return '-'
              return list.map((d) => `${d.label}${d.km > 0 ? ` ${d.km}km` : d.hasGym ? ' Gym' : ''}`).join(', ')
            }
            return qc.perWeekTotal[wi] > 0 ? `${qc.perWeek[wi]}/${qc.perWeekTotal[wi]}` : 'n/a'
          }),
        ])
      })
    })

    autoTable(doc, {
      head,
      body,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [252, 76, 2] },
    })

    doc.save(`ringkasan-quest_${questFilterStart.value}_${questFilterEnd.value}.pdf`)
    showToast('PDF berhasil diunduh')
  } catch (e) {
    showToast(e?.message || 'Gagal membuat PDF', 'error')
  } finally {
    exportingQuest.value = false
  }
}
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
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
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

.ad-stat.is-blue .ad-stat-icon   { background: rgba(45, 212, 191, 0.18); color: #5EEAD4; }
.ad-stat.is-orange .ad-stat-icon { background: rgba(251, 146, 60, 0.18); color: #FDBA74; }
.ad-stat.is-green .ad-stat-icon  { background: rgba(52, 211, 153, 0.18); color: #6EE7B7; }
.ad-stat.is-purple .ad-stat-icon { background: rgba(167, 139, 250, 0.18); color: #C4B5FD; }

.ad-stat-value { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #F8FAFC; }
.ad-stat-label { margin: 4px 0 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(248, 250, 252, 0.5); }

/* Grid berisi kedua chart bar (Distribusi Status Quest + Selesai/Belum Selesai
   Lari & GYM) — berdampingan di layar lebar, ditumpuk di mobile. Grafik garis
   (tren mingguan) tetap di luar grid ini, selalu lebar penuh (butuh ruang utk sumbu-X). */
.ad-charts-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  align-items: start;
}
.ad-charts-grid .ad-chart { margin-top: 0; }

/* Grafik distribusi status quest — bar horizontal per status (belum/berjalan/selesai) */
.ad-chart {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.ad-chart-title { margin: 0 0 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(248, 250, 252, 0.5); }

/* Sub-grup dalam satu chart card (mis. "Lari" / "GYM" masing-masing dgn bar
   Selesai/Belum Selesai sendiri) */
.ad-chart-group + .ad-chart-group { margin-top: 18px; }
.ad-chart-group-title { margin: 0 0 10px; font-size: 12.5px; font-weight: 700; color: rgba(248, 250, 252, 0.85); }
.ad-chart-group-title .mui-mono { font-weight: 600; color: rgba(248, 250, 252, 0.5); }

.ad-chart-rows { display: flex; flex-direction: column; gap: 12px; }

.ad-chart-row {
  display: grid;
  grid-template-columns: 132px 1fr 32px;
  align-items: center;
  gap: 10px;
}

.ad-chart-label { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: rgba(248, 250, 252, 0.75); }
.ad-chart-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }

.ad-chart-track { height: 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.ad-chart-fill { height: 100%; border-radius: 6px; transition: width 0.3s ease; }

.ad-chart-value { font-size: 12.5px; font-weight: 700; color: #F8FAFC; text-align: right; }

/* Grafik garis — persebaran (tren) penyelesaian quest per minggu, gaya basic
   (garis axis polos tanpa panah/grid/angka, plus label tanggal Senin per titik) */
.ad-chart--line { margin-top: 14px; }
.ad-linechart-skel { padding: 4px 0; }
.ad-linechart { display: block; width: 100%; height: 140px; }
.ad-linechart-axis { stroke: rgba(248, 250, 252, 0.35); stroke-width: 1; vector-effect: non-scaling-stroke; }

.ad-linechart-axis-labels { display: flex; gap: 4px; margin-top: 8px; padding: 0 2px; }
.ad-linechart-axis-label {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-linechart-legend { display: flex; gap: 16px; margin-top: 12px; }
.ad-linechart-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: rgba(248, 250, 252, 0.65); }
.ad-linechart-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }


/* ----- Ringkasan quest ----- */
.qs-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

.qs-pdf-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; color: #fff; padding: 10px 16px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}
.qs-pdf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.qf-muted { color: rgba(248, 250, 252, 0.5); font-size: 13px; }
.qf-error { margin: 0; color: #dc2626; font-size: 12.5px; font-weight: 600; }

/* Daftar personil x quest — tiap quest didaftar KE BAWAH per atlet (bukan kolom
   ke samping), diperluas per atlet supaya tetap ringkas utk banyak personil. */
.qs-list {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.qs-list--skel { padding: 4px 0; }
.qs-skel-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}
.qs-skel-row:last-child { border-bottom: none; }

.qs-athlete-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13.5px; font-weight: 700; color: #F8FAFC;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  transition: background 0.15s ease;
}
.qs-athlete-row:hover { background: rgba(255, 255, 255, 0.16); }
.qs-athlete-name { flex: 1; min-width: 0; }

.qs-quest-list {
  padding: 6px 16px 12px 38px;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 3 kolom: Nama Quest | Status (merah/kuning/hijau) | Progress (achieved/target unit) */
.qs-quest-item {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: rgba(248, 250, 252, 0.75);
}
.qs-quest-item-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.qs-quest-item-name { font-weight: 700; color: #F8FAFC; }
.qs-quest-item-scope {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: rgba(248, 250, 252, 0.5);
}

.qs-chevron { flex: 0 0 auto; color: rgba(248, 250, 252, 0.5); transition: transform 0.2s ease; }
.qs-chevron.is-open { transform: rotate(90deg); }

/* Kolom Status — pill warna merah/kuning/hijau (is-none/is-partial/is-full), terpisah
   dari kolom Progress supaya keduanya bisa dibaca sekilas tanpa gabung jadi satu teks. */
.qs-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap;
}
.qs-badge.is-full    { background: rgba(52, 211, 153, 0.18); color: #6EE7B7; }
.qs-badge.is-partial { background: rgba(251, 191, 36, 0.18); color: #FDE68A; }
.qs-badge.is-none    { background: rgba(220, 38, 38, 0.15); color: #fca5a5; }
.qs-badge.is-na      { background: rgba(255, 255, 255, 0.10); color: rgba(248, 250, 252, 0.75); }

/* Indikator visual penyelesaian quest — merah/kuning/hijau, selalu berdampingan dgn teks */
.qs-badge-dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: currentColor; }

/* Kolom Progress — angka capaian vs target quest, rata kanan spy sejajar antar baris */
.qs-progress { font-size: 12.5px; font-weight: 700; color: #F8FAFC; text-align: right; white-space: nowrap; }

/* Total Lari/Total GYM — kartu stat bergaya "achievement", dibedakan tegas dari baris
   quest biasa spy langsung kelihatan (bukan cuma baris teks kecil di ujung daftar). */
.qs-totals { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }

.qs-total-card {
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid transparent;
  transition: background 0.15s ease;
}
.qs-total-card--lari { background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.08) 100%); border-color: rgba(251, 146, 60, 0.3); }
.qs-total-card--gym  { background: linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(167, 139, 250, 0.08) 100%); border-color: rgba(167, 139, 250, 0.3); }
.qs-total-card--lari .qs-total-icon { color: #ea580c; }
.qs-total-card--gym  .qs-total-icon { color: #7c3aed; }

.qs-total-icon {
  flex: 0 0 auto;
  width: 38px; height: 38px;
  display: grid; place-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 14px -8px rgba(17, 18, 20, 0.4);
}

.qs-total-body { min-width: 0; }
.qs-total-title { margin: 0 0 3px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(248, 250, 252, 0.65); }
.qs-total-stats { display: flex; flex-wrap: wrap; gap: 10px; }
.qs-total-stat { font-size: 12.5px; color: rgba(248, 250, 252, 0.65); }
.qs-total-stat strong { font-size: 15px; font-weight: 800; color: #F8FAFC; margin-right: 2px; }
.qs-total-empty { margin: 0; font-size: 12px; font-weight: 600; color: rgba(248, 250, 252, 0.5); font-style: italic; }

/* State kosong — tetap kelihatan (bukan hilang), tapi diredupkan spy tidak berebut
   perhatian dgn atlet yg sudah ada capaian. */
.qs-total-card.is-empty { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.14); }
.qs-total-card.is-empty .qs-total-icon { background: rgba(255, 255, 255, 0.10); color: rgba(248, 250, 252, 0.5); }
</style>
