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

    <!-- Ringkasan quest (harian + mingguan) — monitoring progress user -->
    <section class="mui-block">
      <div class="qs-head-row">
        <h2 class="mui-section-title">Ringkasan Quest</h2>
        <button class="qs-pdf-btn" type="button" :disabled="!canExportQuest || exportingQuest" @click="downloadQuestPdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ exportingQuest ? 'Menyiapkan…' : 'Download PDF' }}
        </button>
      </div>
      <DateRangeFilter v-model:start="questFilterStart" v-model:end="questFilterEnd" />
      <p class="qs-legend">
        Badge menunjukkan capaian pada periode terpilih (mis. "3/4 minggu" untuk quest mingguan,
        "12/28 hari" untuk quest harian). Kolom <strong>Hari Aktif (Bonus)</strong> mencatat hari
        lari/gym meski tanpa quest yang cocok — nilai plus di luar sistem quest.
      </p>

      <p v-if="questLoading" class="qf-muted">Memuat…</p>
      <p v-else-if="questError" class="qf-error">Gagal memuat: {{ questError.message || questError }}</p>
      <template v-else-if="questSummaryData">
        <p v-if="questProgressRows.length === 0" class="qf-muted">Belum ada personil terdaftar.</p>

        <div v-else class="qs-table-wrap" :style="{ '--quest-count': columnDefs.length }">
          <div class="qs-row qs-row--head">
            <div class="qs-cell qs-cell--name">Nama</div>
            <div v-for="col in columnDefs" :key="col.questId" class="qs-cell qs-cell--col" :class="{ 'is-bonus': col.scope === 'bonus' }">
              {{ col.title }}
              <span v-if="col.scope !== 'bonus'" class="qs-col-scope">{{ col.scope === 'mingguan' ? 'Mingguan' : 'Harian' }}</span>
            </div>
          </div>

          <template v-for="pr in questProgressRows" :key="pr.athleteId">
            <div
              class="qs-row qs-row--athlete"
              role="button"
              tabindex="0"
              @click="toggleQuestExpand(pr.athleteId)"
              @keyup.enter="toggleQuestExpand(pr.athleteId)"
            >
              <div class="qs-cell qs-cell--name">
                <svg
                  class="qs-chevron"
                  :class="{ 'is-open': expandedIds.has(pr.athleteId) }"
                  xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                ><polyline points="9 18 15 12 9 6"/></svg>
                {{ pr.name }}
              </div>
              <div v-for="qc in pr.questCols" :key="qc.questId" class="qs-cell qs-cell--col">
                <span class="qs-badge" :class="[badgeClassQuest(qc), { 'is-bonus': qc.scope === 'bonus' }]">
                  <template v-if="qc.scope === 'bonus'">{{ qc.achieved }} hari · {{ qc.totalKm }} km</template>
                  <template v-else>{{ qc.total ? `${qc.achieved}/${qc.total} ${qc.unit}` : 'Belum ada' }}</template>
                </span>
              </div>
            </div>

            <template v-if="expandedIds.has(pr.athleteId)">
              <div v-for="(w, wi) in questSummaryData.weeks" :key="w.periodKey" class="qs-row qs-row--quest">
                <div class="qs-cell qs-cell--name qs-cell--week">{{ w.label }}</div>
                <div v-for="qc in pr.questCols" :key="qc.questId" class="qs-cell qs-cell--col">
                  <template v-if="qc.scope === 'mingguan'">
                    <svg v-if="qc.perWeek[wi]" class="qs-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span v-else-if="qc.perWeek[wi] === false" class="qs-dash">–</span>
                    <span v-else class="qs-na">n/a</span>
                  </template>
                  <div v-else-if="qc.scope === 'bonus'" class="qs-bonus-days">
                    <span v-for="d in qc.perWeek[wi]" :key="d.dateStr" class="qs-bonus-day">
                      {{ d.label }}<template v-if="d.km > 0"> · {{ d.km }} km</template><template v-else-if="d.hasGym"> · Gym</template>
                    </span>
                    <span v-if="qc.perWeek[wi].length === 0" class="qs-dash">–</span>
                  </div>
                  <span v-else-if="qc.perWeekTotal[wi] > 0" class="qs-week-count">{{ qc.perWeek[wi] }}/{{ qc.perWeekTotal[wi] }}</span>
                  <span v-else class="qs-na">n/a</span>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminMonitoring, useQuestSummary } from '../composables/useAdminData.js'
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

// ── Ringkasan quest (harian + mingguan + bonus aktivitas) — kolom = quest, expand = rincian per minggu ──
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
const { summary: questSummaryData, loading: questLoading, error: questError } = useQuestSummary({ start: questFilterStart, end: questFilterEnd })

// Data sudah lengkap (achieved/total/scope/unit/perWeek) dari questSummary.js — tinggal dipakai.
const questProgressRows = computed(() => questSummaryData.value?.rows ?? [])

// Header kolom: quest aktif (harian + mingguan) + satu kolom bonus di akhir.
const columnDefs = computed(() => {
  const s = questSummaryData.value
  if (!s) return []
  return [
    ...s.quests.map((q) => ({ questId: q.id, title: q.title, scope: q.scope })),
    { questId: 'bonus-active-days', title: 'Hari Aktif (Bonus)', scope: 'bonus' },
  ]
})

const expandedIds = ref(new Set())
function toggleQuestExpand(id) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

function badgeClassQuest(qc) {
  if (!qc.total || qc.achieved === 0) return 'is-none'
  if (qc.achieved === qc.total) return 'is-full'
  return 'is-partial'
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

/* ----- Ringkasan quest ----- */
.qs-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

.qs-pdf-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12.5px; font-weight: 700; color: #fff; padding: 10px 16px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}
.qs-pdf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.qs-legend { margin: 0; font-size: 12px; line-height: 1.5; color: #78716c; }
.qs-legend strong { color: #57534e; }

.qf-muted { color: #a8a29e; font-size: 13px; }
.qf-error { margin: 0; color: #dc2626; font-size: 12.5px; font-weight: 600; }

/* Matriks personil x quest — grid dgn kolom dinamis sesuai jumlah quest aktif + bonus */
.qs-table-wrap {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}

.qs-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) repeat(var(--quest-count), minmax(120px, 160px));
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
.qs-cell--week { padding-left: 22px; }
.qs-cell--col {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  text-align: center; font-size: 11.5px; font-weight: 700; color: #57534e; line-height: 1.3; white-space: normal;
}
.qs-cell--col.is-bonus { color: #7c3aed; }

.qs-col-scope {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #a8a29e;
}

.qs-chevron { flex: 0 0 auto; color: #a8a29e; transition: transform 0.2s ease; }
.qs-chevron.is-open { transform: rotate(90deg); }

.qs-badge {
  font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap;
}
.qs-badge.is-full    { background: #d1fae5; color: #059669; }
.qs-badge.is-partial { background: #fff2e8; color: #c2410c; }
.qs-badge.is-none    { background: #f5f1ec; color: #a8a29e; }
.qs-badge.is-bonus    { background: #ede9fe; color: #7c3aed; }

.qs-check { color: #059669; }
.qs-dash { color: #d6cfc8; font-weight: 700; }
.qs-week-count { font-size: 11.5px; font-weight: 700; color: #57534e; }
.qs-na { font-size: 10.5px; font-style: italic; color: #d6cfc8; }

.qs-bonus-days { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.qs-bonus-day { font-size: 10.5px; font-weight: 700; color: #7c3aed; white-space: nowrap; }
</style>
