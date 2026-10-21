<template>
<div class="mui">
  <div class="mui-col mui-col--full">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Personnel Report</p>
          <p class="mui-h-sub">Registration data × activity performance, side by side</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && rows" />
      <span v-else class="mui-pill">Admin View</span>
    </header>

    <section class="mui-block">
      <h2 class="mui-section-title">Period</h2>
      <DateRangeFilter v-model:start="filterStart" v-model:end="filterEnd" />
    </section>

    <!-- Ringkasan agregat — angka gabungan saja (bukan menyorot satu nama), biar
         kelihatan "sehat"-nya divisi secara umum sebelum masuk ke tabel detail. -->
    <section class="mui-block">
      <div v-if="loading && !rows" class="rp-stats">
        <div v-for="i in 4" :key="i" class="rp-stat">
          <div class="mui-skel mui-skel--text" style="width: 60%;"></div>
          <div class="mui-skel mui-skel--text" style="width: 40%; margin-top: 8px;"></div>
        </div>
      </div>
      <div v-else class="rp-stats">
        <div v-for="s in summaryStats" :key="s.label" class="rp-stat" :style="{ '--acc': s.acc }">
          <p class="rp-stat-value mui-mono">{{ s.value }}</p>
          <p class="rp-stat-label">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <section class="mui-block">
      <div class="rp-head-row">
        <h2 class="mui-section-title">Personnel Table</h2>
        <div class="rp-head-actions">
          <div class="rp-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="search" type="text" placeholder="Search name..." />
          </div>
          <button class="rp-pdf-btn" type="button" :disabled="!canExport || exporting" @click="downloadReportPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ exporting ? 'Preparing…' : 'Download PDF' }}
          </button>
        </div>
      </div>

      <div v-if="loading && !rows" class="rp-list">
        <div v-for="i in 5" :key="i" class="rp-skel-row">
          <div class="mui-skel mui-skel--circle" style="width: 34px; height: 34px; flex-shrink: 0;"></div>
          <div class="mui-skel mui-skel--text" style="width: 60%;"></div>
        </div>
      </div>
      <p v-else-if="filteredRows.length === 0" class="qf-muted">No personnel found.</p>
      <div v-else class="rp-list-scroll">
        <div class="rp-list">
        <div class="rp-list-head">
          <button
            v-for="col in REPORT_COLUMNS" :key="col.key" type="button"
            class="rp-head-cell" :class="{ 'is-sorted': sortKey === col.key, 'is-num': col.numeric }"
            @click="setSort(col.key)"
          >
            {{ col.label }}
            <span class="rp-sort-ic" v-if="sortKey === col.key">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </button>
        </div>

        <div
          v-for="row in filteredRows" :key="row.athleteId" class="rp-row"
          :style="{ '--tone': avatarColor(row.name) }"
        >
          <span class="rp-name-cell">
            <span class="rp-avatar">{{ initialsOf(row.name) }}</span>
            {{ row.name }}
          </span>
          <span class="rp-cell is-num mui-mono">{{ row.age ?? '—' }}</span>
          <span class="rp-cell"><span class="rp-chip" :class="'is-' + row.employmentStatus">{{ row.employmentStatusLabel }}</span></span>
          <span class="rp-cell"><span class="rp-chip" :class="'is-' + row.competency">{{ row.competencyLabel }}</span></span>
          <span class="rp-cell is-num mui-mono">{{ row.questDone }}/{{ row.questTotal }}</span>
          <span class="rp-cell is-num mui-mono">{{ row.totalSessions }}</span>
          <span class="rp-cell is-num mui-mono">{{ row.totalKm }}</span>
          <span class="rp-cell is-num mui-mono">{{ row.activeDays }}</span>
        </div>
        </div>
      </div>
      <p class="rp-footnote">Figures reflect the selected period only — sort any column to compare personnel; this table doesn't label anyone, it just lays out the numbers.</p>
    </section>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authState } from '../store/auth.js'
import { useQuestSummary, useAthletesEmployeeInfo } from '../composables/useAdminData.js'
import { showToast } from '../store/toast.js'
import { toDateStr } from '../lib/normalize.js'
import DateRangeFilter from './DateRangeFilter.vue'
import RefreshingBadge from './RefreshingBadge.vue'

const displayName = computed(() => authState.userName || 'Admin')
const initials = computed(() =>
  displayName.value.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
)

// Default 4 minggu penuh (sama dgn pola di AdminMonitoringScreen.vue) — snap ke
// batas minggu supaya total selalu genap, bukan nyerempet minggu ke-5.
function defaultStart() {
  const today = new Date()
  const dayIdx = (today.getDay() + 6) % 7 // Senin = 0
  const monday = new Date(today)
  monday.setDate(monday.getDate() - dayIdx - 21)
  return toDateStr(monday)
}
const filterStart = ref(defaultStart())
const filterEnd = ref(toDateStr(new Date()))

const { summary: questSummaryData, loading } = useQuestSummary({ start: filterStart, end: filterEnd })
const { employeeInfo } = useAthletesEmployeeInfo()
const questProgressRows = computed(() => questSummaryData.value?.rows ?? [])

function initialsOf(name) {
  return (name || '—').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
const AVATAR_PALETTE = ['#2563eb', '#7c3aed', '#0d9488', '#d97706', '#e11d48', '#0891b2']
function avatarColor(name) {
  let hash = 0
  for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function calcAge(birthDateStr) {
  if (!birthDateStr) return null
  const today = new Date()
  const birth = new Date(birthDateStr)
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday = today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age--
  return age
}

const EMPLOYMENT_STATUS_LABEL = { organik: 'Organik', penunjang: 'Penunjang' }
const COMPETENCY_LABEL = { basic: 'Basic', junior: 'Junior', senior: 'Senior' }

// Ringkasan quest selesai — sama persis dgn athleteSummary() di AdminMonitoringScreen.vue
// (bonus dikecualikan, sel yg blm berlaku dikeluarkan dari total).
function athleteSummary(pr) {
  const applicable = pr.questCols.filter((qc) => qc.scope !== 'bonus' && qc.total)
  const done = applicable.filter((qc) => {
    if (!qc.total) return false
    if (qc.achieved === 0) return false
    return qc.achieved === qc.total
  }).length
  return { done, total: applicable.length }
}

// ── Join data registrasi (usia/status/kompetensi) dgn ringkasan quest per-atlet
// — bukan pipeline baru, cuma menggabungkan dua sumber yg sudah dihitung. ──
const REPORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age', numeric: true },
  { key: 'employmentStatusLabel', label: 'Employee Status' },
  { key: 'competencyLabel', label: 'Competency' },
  { key: 'questDone', label: 'Quest Done', numeric: true },
  { key: 'totalSessions', label: 'Total Sessions', numeric: true },
  { key: 'totalKm', label: 'Total Km', numeric: true },
  { key: 'activeDays', label: 'Active Days', numeric: true },
]

const reportRows = computed(() => {
  const infoByAthlete = new Map((employeeInfo.value ?? []).map((e) => [e.athleteId, e]))
  return questProgressRows.value.map((pr) => {
    const info = infoByAthlete.get(pr.athleteId)
    const summary = athleteSummary(pr)
    const activeDaysCol = pr.questCols.find((c) => c.questId === 'bonus-active-days')
    return {
      athleteId: pr.athleteId,
      name: pr.name,
      age: calcAge(info?.birthDate),
      employmentStatus: info?.employmentStatus || null,
      employmentStatusLabel: EMPLOYMENT_STATUS_LABEL[info?.employmentStatus] || '—',
      competency: info?.competency || null,
      competencyLabel: COMPETENCY_LABEL[info?.competency] || '—',
      questDone: summary.done,
      questTotal: summary.total,
      totalSessions: pr.totals.lariSesi + pr.totals.gymSesi,
      totalKm: pr.totals.lariKm,
      activeDays: activeDaysCol?.achieved ?? 0,
    }
  })
})

const search = ref('')
const searchedRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return reportRows.value
  return reportRows.value.filter((r) => r.name.toLowerCase().includes(q))
})

// Sort client-side di atas array yg sudah ada di memori — tidak perlu query baru.
// Default: urut dari paling aktif (Active Days terbanyak) ke paling jarang —
// proxy "rajin vs malas" yang paling adil (konsistensi, bukan cuma volume).
// Admin tetap bisa klik kolom lain kapan saja utk urutan berbeda.
const sortKey = ref('activeDays')
const sortDir = ref('desc')
function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}
const filteredRows = computed(() => {
  const rows = [...searchedRows.value]
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  rows.sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string') return av.localeCompare(bv) * dir
    return (av - bv) * dir
  })
  return rows
})

// Ringkasan agregat (angka gabungan saja, tidak menyorot satu nama tertentu).
const summaryStats = computed(() => {
  const rows = reportRows.value
  const n = rows.length
  const totalDone = rows.reduce((s, r) => s + r.questDone, 0)
  const totalTarget = rows.reduce((s, r) => s + r.questTotal, 0)
  const avgCompletion = totalTarget ? Math.round((totalDone / totalTarget) * 100) : 0
  const totalSessions = rows.reduce((s, r) => s + r.totalSessions, 0)
  const totalActiveDays = rows.reduce((s, r) => s + r.activeDays, 0)
  return [
    { label: 'Total Personnel', value: String(n), acc: '#2563eb' },
    { label: 'Avg Quest Completion', value: `${avgCompletion}%`, acc: '#059669' },
    { label: 'Total Sessions', value: String(totalSessions), acc: '#d97706' },
    { label: 'Total Active Days', value: String(totalActiveDays), acc: '#7c3aed' },
  ]
})

// Alias utk v-if di template — questSummaryData null sebelum data pertama kali
// masuk (beda dari questProgressRows yg selalu array lewat fallback `?? []`).
const rows = questSummaryData

const canExport = computed(() => !loading.value && reportRows.value.length > 0)
const exporting = ref(false)

// jsPDF + autotable dimuat lazy — berat (ikut html2canvas), cuma dipakai di tombol ini.
async function downloadReportPdf() {
  if (!canExport.value || exporting.value) return
  exporting.value = true
  try {
    const [{ default: jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Personnel Report', 14, 16)
    doc.setFontSize(10)
    doc.text(`Period: ${filterStart.value} to ${filterEnd.value}`, 14, 22)

    const head = [REPORT_COLUMNS.map((c) => c.label)]
    const body = filteredRows.value.map((row) => [
      row.name,
      row.age ?? '—',
      row.employmentStatusLabel,
      row.competencyLabel,
      `${row.questDone}/${row.questTotal}`,
      row.totalSessions,
      row.totalKm,
      row.activeDays,
    ])

    autoTable(doc, {
      head,
      body,
      startY: 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    })

    doc.save(`personnel-report_${filterStart.value}_${filterEnd.value}.pdf`)
    showToast('PDF downloaded successfully')
  } catch (e) {
    showToast(e?.message || 'Failed to generate PDF', 'error')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* ── Ringkasan agregat ── */
.rp-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
}
.rp-stat {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid color-mix(in srgb, var(--acc, #2563eb) 24%, transparent);
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
}
.rp-stat::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 3px;
  background: var(--acc, #2563eb);
  opacity: 0.9;
}
.rp-stat-value { margin: 0; font-size: 24px; font-weight: 700; color: color-mix(in srgb, var(--acc, #2563eb) 65%, #0f172a); letter-spacing: -0.5px; }
.rp-stat-label { margin: 6px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.55); }

/* ── Head row: search + download ── */
.rp-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.rp-head-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.rp-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #ffffff;
  border-radius: 12px;
  border: 1.5px solid rgba(37, 99, 235, 0.14);
  color: rgba(15, 23, 42, 0.5);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.rp-search:focus-within { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }
.rp-search input { flex: 1; min-width: 160px; border: none; outline: none; background: transparent; padding: 10px 0; font-family: inherit; font-size: 13.5px; color: #0f172a; }

.rp-pdf-btn {
  display: inline-flex; align-items: center; gap: 7px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; color: #ffffff;
  padding: 10px 16px; border-radius: 999px; white-space: nowrap;
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.6);
  transition: transform 0.15s ease;
}
.rp-pdf-btn:hover:not(:disabled) { transform: translateY(-1px); }
.rp-pdf-btn:disabled { opacity: 0.6; cursor: default; }

/* ── Baris kartu bulat berwarna per personil (bukan tabel HTML polos) — tiap
   baris dapat warna identitas sendiri dari nama (var(--tone), sama teknik dgn
   rowColor() di AdminPeringkatScreen.vue): border + glow bayangan lembut
   warnanya, angka tetap mentah/polos (tidak diblok warna, tidak ada label
   menghakimi) — cuma "kemasannya" yang dibikin senada dgn leaderboard admin. ── */
/* Scroll horizontal di layar sempit — grid-nya punya min-width tetap (lihat
   di bawah) supaya kolom tidak terpaksa menyempit/berdempetan di mobile,
   tinggal digeser ke samping kalau tak cukup lebar. */
.rp-list-scroll { overflow-x: auto; padding-bottom: 4px; }
.rp-list { display: flex; flex-direction: column; gap: 10px; min-width: 760px; }

.rp-list-head {
  display: grid;
  grid-template-columns: 1.7fr 60px 120px 110px 100px 110px 90px 100px;
  gap: 16px;
  padding: 0 18px;
}
.rp-head-cell {
  display: flex; align-items: center; justify-content: flex-start; gap: 4px;
  border: none; background: none; cursor: pointer; font-family: inherit;
  padding: 8px 0;
  color: rgba(15, 23, 42, 0.5);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: left;
  transition: color 0.15s ease;
}
.rp-head-cell.is-num { justify-content: flex-end; text-align: right; }
.rp-head-cell:hover { color: rgba(15, 23, 42, 0.8); }
.rp-head-cell.is-sorted { color: #1d4ed8; }
.rp-sort-ic { font-size: 9px; }

.rp-row {
  display: grid;
  grid-template-columns: 1.7fr 60px 120px 110px 100px 110px 90px 100px;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1.5px solid color-mix(in srgb, var(--tone, #2563eb) 30%, transparent);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 14px 26px -22px color-mix(in srgb, var(--tone, #2563eb) 50%, transparent);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.rp-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -18px color-mix(in srgb, var(--tone, #2563eb) 60%, transparent);
}

.rp-name-cell { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #0f172a; min-width: 0; }
.rp-avatar {
  flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-content: center;
  font-size: 11px; font-weight: 800; color: #ffffff;
  background: linear-gradient(135deg, var(--tone, #2563eb) 0%, color-mix(in srgb, var(--tone, #2563eb) 55%, white) 100%);
  box-shadow: 0 4px 10px -4px var(--tone, #2563eb);
}

.rp-cell { font-size: 13px; color: #0f172a; }
.rp-cell.is-num { text-align: right; }

/* Chip status/kompetensi — warna identitas beda per nilai, solid & jelas
   (bukan semburat), konsisten dgn pola chip di tempat lain (lb-tier-chip dll). */
.rp-chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  color: #fff;
}
.rp-chip.is-organik { background: #2563eb; }
.rp-chip.is-penunjang { background: #7c3aed; }
.rp-chip.is-basic { background: #0d9488; }
.rp-chip.is-junior { background: #d97706; }
.rp-chip.is-senior { background: #e11d48; }

.rp-skel-row { display: flex; align-items: center; gap: 12px; padding: 12px 18px; background: #ffffff; border: 1px solid rgba(37, 99, 235, 0.1); border-radius: 16px; }
.rp-footnote { margin: 4px 2px 0; font-size: 11.5px; color: rgba(15, 23, 42, 0.45); }
</style>
