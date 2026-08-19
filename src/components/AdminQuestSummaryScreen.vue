<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <header class="mui-header">
      <div class="h-left">
        <button class="qs-back" type="button" aria-label="Kembali" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">Ringkasan Quest Mingguan</p>
          <p class="mui-h-sub">Status tercapai/tidak seluruh personil per minggu</p>
        </div>
      </div>
    </header>

    <section class="mui-block">
      <h2 class="mui-section-title">Periode</h2>
      <DateRangeFilter v-model:start="filterStart" v-model:end="filterEnd" />
    </section>

    <section class="mui-block">
      <div class="qs-head-row">
        <h2 class="mui-section-title">Matriks Personil × Minggu</h2>
        <button class="qs-pdf-btn" type="button" :disabled="!canExport || exporting" @click="downloadPdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ exporting ? 'Menyiapkan…' : 'Download PDF' }}
        </button>
      </div>

      <p v-if="loading" class="qf-muted">Memuat…</p>
      <p v-else-if="error" class="qf-error">Gagal memuat: {{ error.message || error }}</p>
      <template v-else-if="summary">
        <p v-if="summary.quests.length === 0" class="qf-muted">Belum ada quest mingguan aktif.</p>
        <p v-else-if="summary.rows.length === 0" class="qf-muted">Belum ada personil terdaftar.</p>

        <div v-else class="qs-table-wrap" :style="{ '--week-count': summary.weeks.length }">
          <div class="qs-row qs-row--head">
            <div class="qs-cell qs-cell--name">Nama</div>
            <div v-for="w in summary.weeks" :key="w.periodKey" class="qs-cell qs-cell--week">{{ w.label }}</div>
          </div>

          <template v-for="row in summary.rows" :key="row.athleteId">
            <div
              class="qs-row qs-row--athlete"
              role="button"
              tabindex="0"
              @click="toggleExpand(row.athleteId)"
              @keyup.enter="toggleExpand(row.athleteId)"
            >
              <div class="qs-cell qs-cell--name">
                <svg
                  class="qs-chevron"
                  :class="{ 'is-open': expandedIds.has(row.athleteId) }"
                  xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                ><polyline points="9 18 15 12 9 6"/></svg>
                {{ row.name }}
              </div>
              <div v-for="w in row.weeks" :key="w.periodKey" class="qs-cell qs-cell--week">
                <span class="qs-badge" :class="badgeClass(w)">{{ w.totalQuests ? `${w.achievedCount}/${w.totalQuests}` : '—' }}</span>
              </div>
            </div>

            <template v-if="expandedIds.has(row.athleteId)">
              <div v-for="(q, qi) in summary.quests" :key="q.id" class="qs-row qs-row--quest">
                <div class="qs-cell qs-cell--name qs-cell--quest">{{ q.title }}</div>
                <div v-for="w in row.weeks" :key="w.periodKey" class="qs-cell qs-cell--week">
                  <svg v-if="w.quests[qi]?.claimed" class="qs-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else class="qs-dash">–</span>
                </div>
              </div>
            </template>
          </template>
        </div>
      </template>
    </section>
  </div>

  <AdminTabBar />
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestSummary } from '../composables/useAdminData.js'
import { daysAgoDateStr, toDateStr } from '../lib/normalize.js'
import AdminTabBar from './AdminTabBar.vue'
import DateRangeFilter from './DateRangeFilter.vue'

const router = useRouter()
function kembali() {
  router.push('/admin/quests')
}

// Default 4 minggu terakhir — cukup lebar untuk melihat pola mingguan.
const filterStart = ref(daysAgoDateStr(28))
const filterEnd = ref(toDateStr(new Date()))

const { summary, loading, error } = useQuestSummary({ start: filterStart, end: filterEnd })

const expandedIds = ref(new Set())
function toggleExpand(id) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

function badgeClass(w) {
  if (!w.totalQuests || w.achievedCount === 0) return 'is-none'
  if (w.achievedCount === w.totalQuests) return 'is-full'
  return 'is-partial'
}

const canExport = computed(() => !loading.value && (summary.value?.quests?.length ?? 0) > 0 && (summary.value?.rows?.length ?? 0) > 0)
const exporting = ref(false)

// jsPDF + autotable dimuat lazy (dynamic import) — berat (ikut html2canvas) dan cuma
// dipakai di tombol ini, jadi tak perlu ikut bundle utama semua layar admin.
// Export selalu granular per (personil, quest) — sama datanya dengan tampilan yang
// di-expand, tak tergantung baris mana yang sedang terbuka di layar.
async function downloadPdf() {
  if (!canExport.value || exporting.value) return
  exporting.value = true
  try {
    const [{ default: jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const { weeks, quests, rows } = summary.value

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Ringkasan Quest Mingguan', 14, 16)
    doc.setFontSize(10)
    doc.text(`Periode: ${filterStart.value} s.d. ${filterEnd.value}`, 14, 22)

    const head = [['Nama', 'Quest', ...weeks.map((w) => w.label)]]
    const body = []
    rows.forEach((row) => {
      quests.forEach((q, qi) => {
        body.push([
          row.name,
          q.title,
          ...row.weeks.map((w) => (w.quests[qi]?.claimed ? 'Tercapai' : '-')),
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

    doc.save(`ringkasan-quest-mingguan_${filterStart.value}_${filterEnd.value}.pdf`)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.qs-back {
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

.qs-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

.qs-pdf-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; color: #fff; padding: 10px 16px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}
.qs-pdf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.qf-muted { color: #a8a29e; font-size: 13px; }
.qf-error { margin: 0; color: #dc2626; font-size: 12.5px; font-weight: 600; }

/* Matriks personil x minggu — grid dgn kolom dinamis sesuai jumlah minggu */
.qs-table-wrap {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.qs-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) repeat(var(--week-count), 100px);
  align-items: center;
}

.qs-row--head {
  padding: 12px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #a8a29e;
  border-bottom: 1px solid #f5f1ec;
}

.qs-row--athlete {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13.5px; font-weight: 700; color: #1c1917;
  border-bottom: 1px solid #f5f1ec;
  transition: background 0.15s ease;
}
.qs-row--athlete:hover { background: #f5f1ec; }

.qs-row--quest {
  padding: 10px 16px;
  background: #faf8f6;
  font-size: 12.5px; color: #57534e;
  border-bottom: 1px solid #f5f1ec;
}

.qs-cell--name { display: flex; align-items: center; gap: 8px; min-width: 0; }
.qs-cell--quest { padding-left: 22px; }
.qs-cell--week { display: flex; justify-content: center; }

.qs-chevron { flex: 0 0 auto; color: #a8a29e; transition: transform 0.2s ease; }
.qs-chevron.is-open { transform: rotate(90deg); }

.qs-badge {
  font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap;
}
.qs-badge.is-full    { background: #d1fae5; color: #059669; }
.qs-badge.is-partial { background: #fff2e8; color: #c2410c; }
.qs-badge.is-none    { background: #f5f1ec; color: #a8a29e; }

.qs-check { color: #059669; }
.qs-dash { color: #d6cfc8; font-weight: 700; }
</style>
