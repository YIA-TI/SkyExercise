<template>
<div class="mui">
  <div class="mui-col mui-col--full">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Kelola Tantangan</p>
          <p class="mui-h-sub">Atur misi latihan peserta</p>
        </div>
      </div>
      <span class="mui-pill">{{ quests.length }} Tantangan</span>
    </header>

    <!-- Form tambah tantangan -->
    <section class="mui-block">
      <h2 class="mui-section-title">Tambah Tantangan</h2>
      <form class="qf" @submit.prevent="submit">
        <label class="qf-field">
          <span>Judul</span>
          <input v-model="form.title" type="text" placeholder="mis. Lari 5 KM" required />
        </label>

        <label class="qf-field">
          <span>Deskripsi</span>
          <input v-model="form.description" type="text" placeholder="Keterangan singkat" />
        </label>

        <div class="qf-field">
          <span>Periode</span>
          <div class="mui-toggle qf-scope-toggle">
            <button type="button" :class="{ 'is-active': form.scope === 'harian' }" @click="form.scope = 'harian'">
              <Sun :size="15" /> Harian
            </button>
            <button type="button" :class="{ 'is-active': form.scope === 'mingguan' }" @click="form.scope = 'mingguan'">
              <CalendarDays :size="15" /> Mingguan
            </button>
          </div>
        </div>

        <label class="qf-field">
          <span>{{ form.scope === 'mingguan' ? 'Tanggal (dalam minggu target)' : 'Tanggal' }}</span>
          <input v-model="form.quest_date" type="date" required />
        </label>
        <p v-if="questDatePreview" class="qf-hint">Berlaku: {{ questDatePreview }}</p>

        <div class="qf-field">
          <span>Metrik</span>
          <div class="qf-metric-grid">
            <button
              v-for="m in METRIC_OPTIONS" :key="m.value" type="button"
              class="qf-metric-card" :class="{ 'is-active': form.metric === m.value }"
              :style="{ '--mc': metricColor(m.value) }"
              @click="form.metric = m.value"
            >
              <component :is="m.icon" :size="18" />
              <span class="qf-metric-label">{{ m.label }}</span>
              <span class="qf-metric-unit">{{ METRIC_META[m.value].unit }}</span>
            </button>
          </div>
        </div>

        <div class="qf-row">
          <label class="qf-field qf-narrow">
            <span>Target ({{ targetUnit }})</span>
            <input v-model.number="form.target" type="number" min="0" :step="targetStep" required />
          </label>
          <label class="qf-field qf-narrow">
            <span>Reward</span>
            <div class="qf-reward-input">
              <Trophy :size="15" class="qf-reward-icon" />
              <input v-model.number="form.reward" type="number" min="0" required />
              <span class="qf-reward-suffix">XP</span>
            </div>
          </label>
        </div>

        <!-- Preview live — WYSIWYG, bentuk kartunya sama persis dgn kartu di Daftar Tantangan -->
        <div class="qf-preview">
          <p class="qf-preview-label">Preview Tantangan</p>
          <article class="ql-item" :class="'ql-item--' + form.scope">
            <div class="ql-icon-badge" :style="{ '--mc': metricColor(form.metric) }">
              <component :is="metricIcon(form.metric)" :size="18" />
            </div>
            <div class="ql-body">
              <div class="ql-top">
                <span class="ql-title">{{ form.title || 'Judul tantangan…' }}</span>
                <span class="mui-tag" :class="form.scope === 'harian' ? 'mui-tag--blue' : 'mui-tag--orange'">{{ form.scope }}</span>
              </div>
              <p class="ql-meta">
                {{ metricLabel(form.metric) }} · target {{ form.target || 0 }} {{ targetUnit }}
                <template v-if="questDatePreview"> · {{ questDatePreview }}</template>
              </p>
            </div>
            <span class="ql-xp-badge"><Trophy :size="12" /> {{ form.reward || 0 }} XP</span>
          </article>
        </div>

        <p v-if="formError" class="qf-error">{{ formError }}</p>
        <button class="qf-submit" type="submit" :disabled="saving">
          <svg v-if="saving" class="spin-icon is-spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <Rocket v-else :size="16" />
          {{ saving ? 'Menyimpan…' : 'Tambah Tantangan' }}
        </button>
      </form>
    </section>

    <!-- Daftar tantangan -->
    <section class="mui-block">
      <h2 class="mui-section-title">Daftar Tantangan</h2>
      <div v-if="loading" class="ql-list">
        <div v-for="i in 3" :key="i" class="ql-item">
          <div class="mui-skel mui-skel--circle" style="width: 38px; height: 38px; flex-shrink: 0;"></div>
          <div class="ql-body">
            <div class="mui-skel mui-skel--text" style="width: 45%;"></div>
            <div class="mui-skel mui-skel--text" style="width: 75%; margin-top: 8px;"></div>
          </div>
          <div class="mui-skel" style="width: 84px; height: 32px; flex-shrink: 0;"></div>
        </div>
      </div>
      <div v-else class="ql-list">
        <article v-for="q in quests" :key="q.id" class="ql-item" :class="['ql-item--' + q.scope, { 'is-off': !q.active }]">
          <div class="ql-icon-badge" :style="{ '--mc': metricColor(q.metric) }">
            <component :is="metricIcon(q.metric)" :size="18" />
          </div>
          <div class="ql-body">
            <div class="ql-top">
              <span class="ql-title">{{ q.title }}</span>
              <span class="mui-tag" :class="q.scope === 'harian' ? 'mui-tag--blue' : 'mui-tag--orange'">{{ q.scope }}</span>
            </div>
            <p class="ql-meta">
              {{ metricLabel(q.metric) }} · target {{ q.target }} {{ q.unit }}
              <template v-if="questPeriodLabel(q.scope, q.quest_date)"> · {{ questPeriodLabel(q.scope, q.quest_date) }}</template>
            </p>

            <div v-if="editingId === q.id" class="ql-edit-date">
              <input v-model="editDate" type="date" />
              <span v-if="questPeriodLabel(q.scope, editDate)" class="qf-hint">Berlaku: {{ questPeriodLabel(q.scope, editDate) }}</span>
              <div class="ql-edit-date-actions">
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="saveDate(q)">
                  <svg v-if="savingDate" class="spin-icon is-spinning" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  {{ savingDate ? 'Menyimpan…' : 'Simpan' }}
                </button>
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="cancelEditDate">Batal</button>
              </div>
            </div>
          </div>
          <div class="ql-side">
            <span class="ql-xp-badge"><Trophy :size="12" /> {{ q.reward }} XP</span>
            <div class="ql-actions">
              <button v-if="editingId !== q.id" class="ql-icon-btn" type="button" title="Ubah Tanggal" aria-label="Ubah Tanggal" @click="startEditDate(q)">
                <CalendarClock :size="15" />
              </button>
              <label class="ql-switch" :class="{ 'is-disabled': togglingIds.has(q.id) }" :title="q.active ? 'Nonaktifkan' : 'Aktifkan'">
                <input type="checkbox" :checked="q.active" :disabled="togglingIds.has(q.id)" @change="toggleActive(q)" />
                <span class="ql-switch-track"><span class="ql-switch-thumb"></span></span>
              </label>
              <svg class="spin-icon ql-toggle-spinner" :class="{ 'is-spinning': togglingIds.has(q.id) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <button class="ql-icon-btn ql-icon-btn--del" type="button" title="Hapus" aria-label="Hapus" :disabled="deletingIds.has(q.id)" @click="hapus(q)">
                <svg v-if="deletingIds.has(q.id)" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                <Trash2 v-else :size="15" />
              </button>
            </div>
          </div>
        </article>
        <p v-if="quests.length === 0" class="qf-muted">Belum ada tantangan.</p>
      </div>
    </section>
  </div>
</div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { Sun, CalendarDays, Footprints, Repeat, Dumbbell, Timer, Trophy, Rocket, CalendarClock, Trash2 } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useAdminQuests } from '../composables/useAdminQuests.js'
import { questPeriodLabel } from '../services/questSummary.js'
import { backfillQuestClaims } from '../services/adminQuests.js'
import { showToast } from '../store/toast.js'

const initials = computed(() =>
  (authState.userName || 'Admin').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const { quests, loading, create, update, remove } = useAdminQuests()

const saving = ref(false)
const formError = ref('')
const form = reactive({
  title: '',
  description: '',
  scope: 'harian',
  quest_date: '',
  metric: 'run_distance',
  target: 5,
  reward: 100,
})

const questDatePreview = computed(() => questPeriodLabel(form.scope, form.quest_date))

const METRIC_LABELS = {
  run_distance: 'Jarak lari',
  run_sessions: 'Sesi lari',
  gym_sessions: 'Sesi gym',
  gym_duration: 'Durasi gym',
}
function metricLabel(m) { return METRIC_LABELS[m] || m }

// Ikon per metrik — dipakai di kartu picker (form) & badge kartu quest (daftar & preview).
const METRIC_ICONS = {
  run_distance: Footprints,
  run_sessions: Repeat,
  gym_sessions: Dumbbell,
  gym_duration: Timer,
}
function metricIcon(m) { return METRIC_ICONS[m] || Footprints }

// Warna identitas per metrik — dulu semua kartu picker & badge ikon quest sama
// rata biru/abu, jadi 4 metrik terasa seragam sampai dipilih. Sekarang tiap
// metrik punya warna sendiri (dipakai di picker form, preview, & tiap kartu
// quest di daftar), independen dari aksen biru/oranye per periode (harian/
// mingguan) yg tetap di garis tepi kiri kartu — dua sinyal warna beda makna.
const METRIC_COLORS = {
  run_distance: '#2563eb',
  run_sessions: '#0d9488',
  gym_sessions: '#7c3aed',
  gym_duration: '#d97706',
}
function metricColor(m) { return METRIC_COLORS[m] || '#2563eb' }

// Opsi picker metrik (kartu 2x2 di form) — urutan sejajar dgn METRIC_ICONS/METRIC_META.
const METRIC_OPTIONS = [
  { value: 'run_distance', label: 'Jarak Lari', icon: Footprints },
  { value: 'run_sessions', label: 'Sesi Lari', icon: Repeat },
  { value: 'gym_sessions', label: 'Sesi Gym', icon: Dumbbell },
  { value: 'gym_duration', label: 'Durasi Gym', icon: Timer },
]

// Target & satuan mengikuti metrik — jarak dalam km, sesi/hitungan dalam bilangan
// bulat, durasi dalam menit. Mencegah kombinasi ganjil spt "5 menit" utk jarak lari.
const METRIC_META = {
  run_distance: { unit: 'km', step: 0.1, defaultTarget: 5 },
  run_sessions: { unit: 'sesi', step: 1, defaultTarget: 3 },
  gym_sessions: { unit: 'sesi', step: 1, defaultTarget: 2 },
  gym_duration: { unit: 'menit', step: 1, defaultTarget: 30 },
}
const targetUnit = computed(() => METRIC_META[form.metric]?.unit || '')
const targetStep = computed(() => METRIC_META[form.metric]?.step || 1)

watch(() => form.metric, (metric) => {
  form.target = METRIC_META[metric]?.defaultTarget ?? form.target
})

// Quest bertanggal cuma tampil ke atlet pada hari/minggu targetnya sendiri (lihat
// migrasi quest_specific_period) — kalau tanggalnya di masa lalu, atlet tak pernah
// sempat klaim walau aktivitasnya sudah memenuhi target. Backfill menutup celah itu:
// cek activities riil pada periode target, langsung tandai selesai (+kredit XP)
// tanpa perlu klaim manual.
async function runBackfill(questId) {
  try {
    const n = await backfillQuestClaims(questId)
    if (n > 0) showToast(`${n} atlet otomatis dinyatakan selesai dari aktivitas lampau`)
  } catch (e) {
    showToast(e?.message || 'Gagal memeriksa aktivitas lampau', 'error')
  }
}

async function submit() {
  formError.value = ''
  saving.value = true
  try {
    const newId = await create({
      title: form.title,
      description: form.description || null,
      scope: form.scope,
      quest_date: form.quest_date || null,
      metric: form.metric,
      target: form.target,
      unit: targetUnit.value || null,
      reward: form.reward,
      // Sama utk semua quest — daftar diurutkan via `order by sort_order, id`,
      // jadi kalau nilainya sama, urutannya otomatis ikut id (urutan pembuatan).
      sort_order: 0,
    })
    const questDate = form.quest_date
    form.title = ''
    form.description = ''
    form.quest_date = ''
    showToast('Tantangan berhasil ditambahkan')
    if (questDate) await runBackfill(newId)
  } catch (e) {
    formError.value = 'Gagal menyimpan: ' + (e?.message || e)
    showToast('Gagal menambahkan tantangan', 'error')
  } finally {
    saving.value = false
  }
}

async function toggleActive(q) {
  if (togglingIds.value.has(q.id)) return
  togglingIds.value = new Set(togglingIds.value).add(q.id)
  try {
    await update(q.id, { active: !q.active })
    showToast(q.active ? 'Tantangan dinonaktifkan' : 'Tantangan diaktifkan')
  } catch (e) {
    showToast(e?.message || 'Gagal mengubah status tantangan', 'error')
  } finally {
    const next = new Set(togglingIds.value)
    next.delete(q.id)
    togglingIds.value = next
  }
}

const editingId = ref(null)
const editDate = ref('')
const savingDate = ref(false)
const togglingIds = ref(new Set())
const deletingIds = ref(new Set())

function startEditDate(q) {
  editingId.value = q.id
  editDate.value = q.quest_date || ''
}
function cancelEditDate() {
  editingId.value = null
  editDate.value = ''
}
async function saveDate(q) {
  savingDate.value = true
  const newDate = editDate.value
  try {
    await update(q.id, { quest_date: newDate || null })
    if (newDate) await runBackfill(q.id)
    cancelEditDate()
    showToast('Tanggal tantangan berhasil diperbarui')
  } catch (e) {
    showToast(e?.message || 'Gagal memperbarui tanggal', 'error')
  } finally {
    savingDate.value = false
  }
}

async function hapus(q) {
  if (deletingIds.value.has(q.id) || !window.confirm(`Hapus tantangan "${q.title}"?`)) return
  deletingIds.value = new Set(deletingIds.value).add(q.id)
  try {
    await remove(q.id)
    showToast('Tantangan berhasil dihapus')
  } catch (e) {
    showToast(e?.message || 'Gagal menghapus tantangan', 'error')
  } finally {
    const next = new Set(deletingIds.value)
    next.delete(q.id)
    deletingIds.value = next
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.qf { display: flex; flex-direction: column; gap: 12px; }
.qf-row { display: flex; gap: 12px; flex-wrap: wrap; }
.qf-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; }
.qf-field.qf-narrow { flex: 0 1 130px; }
.qf-field span { font-size: 12px; font-weight: 600; color: rgba(15, 23, 42, 0.65); }
.qf-field input {
  border: 1.5px solid rgba(37, 99, 235, 0.14); border-radius: 12px; padding: 11px 12px;
  font-family: inherit; font-size: 14px; color: #0f172a; background: rgba(37, 99, 235, 0.04); outline: none;
}
.qf-field input:focus { border-color: #2563eb; }
.qf-hint { margin: -4px 0 0; font-size: 12px; font-weight: 600; color: #c2410c; }

/* Toggle Periode — pakai .mui-toggle bawaan design-system, cukup tambah gap ikon+label */
.qf-scope-toggle button { gap: 7px; }

/* Picker Metrik — kartu ikon 2x2, gaya "pilih dgn mata" ala form gamifikasi
   (bukan dropdown teks polos) supaya langsung kelihatan bedanya tiap metrik. */
.qf-metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
/* Tiap kartu metrik ditinta warna identitasnya sendiri (var(--mc), lihat
   METRIC_COLORS di script) — bahkan sblm dipilih sudah kelihatan bedanya,
   bukan 4 kartu abu-abu seragam sampai ada yg aktif. */
.qf-metric-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border: 1.5px solid color-mix(in srgb, var(--mc, #2563eb) 22%, transparent);
  border-radius: 14px; padding: 12px 8px;
  background: color-mix(in srgb, var(--mc, #2563eb) 7%, white);
  cursor: pointer; font-family: inherit; color: var(--mc, #2563eb);
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}
.qf-metric-card:hover { border-color: color-mix(in srgb, var(--mc, #2563eb) 50%, transparent); transform: translateY(-1px); }
.qf-metric-card.is-active {
  border-color: transparent; color: #fff;
  background: linear-gradient(135deg, var(--mc, #2563eb) 0%, color-mix(in srgb, var(--mc, #2563eb) 55%, white) 100%);
  box-shadow: 0 10px 20px -12px var(--mc, #2563eb);
}
.qf-metric-label { font-size: 11.5px; font-weight: 700; text-align: center; }
.qf-metric-unit { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; opacity: 0.75; }

/* Reward (XP) — dibungkus spt "chip" koin, bukan angka input polos */
.qf-reward-input {
  display: flex; align-items: center; gap: 6px;
  border: 1.5px solid rgba(37, 99, 235, 0.14); border-radius: 12px; padding: 0 12px;
  background: rgba(37, 99, 235, 0.04);
}
.qf-reward-input:focus-within { border-color: #2563eb; }
.qf-reward-icon { color: #d97706; flex: 0 0 auto; }
.qf-reward-input input {
  flex: 1; min-width: 0; border: none; padding: 11px 0; font-family: inherit;
  font-size: 14px; font-weight: 700; color: #0f172a; background: transparent; outline: none;
}
.qf-reward-suffix { font-size: 11px; font-weight: 800; color: rgba(15, 23, 42, 0.5); letter-spacing: 0.3px; }

.qf-preview { display: flex; flex-direction: column; gap: 6px; }
.qf-preview-label { margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(15, 23, 42, 0.5); }

.qf-submit {
  display: inline-flex; align-items: center; gap: 8px;
  align-self: flex-start; border: none; cursor: pointer; font-family: inherit;
  font-size: 14px; font-weight: 700; color: #fff; padding: 12px 20px; border-radius: 12px;
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
}
.qf-submit:disabled { opacity: 0.6; cursor: default; }
.qf-error { margin: 0; color: #dc2626; font-size: 12.5px; font-weight: 600; }
.qf-muted { color: rgba(15, 23, 42, 0.5); font-size: 13px; }

.ql-list { display: flex; flex-direction: column; gap: 10px; }

/* Kartu quest — aksen warna kiri per periode (biru=harian, oranye=mingguan),
   ikon metrik dlm badge bulat, XP jadi badge "pencapaian" yg menonjol di kanan. */
.ql-item {
  position: relative;
  display: flex; align-items: flex-start; gap: 12px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 16px; padding: 14px 16px 14px 18px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.18);
  border-left: 4px solid transparent;
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.ql-item:hover { transform: translateY(-2px); box-shadow: 0 18px 34px -22px rgba(15, 23, 42, 0.22); }
.ql-item--harian   { border-left-color: #2563eb; }
.ql-item--mingguan { border-left-color: #d97706; }
.ql-item.is-off { opacity: 0.55; }

/* Warna badge ikon ikut metrik-nya (var(--mc)) — independen dari aksen
   biru/oranye periode di garis tepi kartu (lihat .ql-item--harian/mingguan),
   dua sinyal warna beda makna: tepi kiri = kapan, badge ikon = jenis aktivitas. */
.ql-icon-badge {
  flex: 0 0 auto; width: 38px; height: 38px; display: grid; place-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--mc, #2563eb) 14%, white);
  color: var(--mc, #2563eb);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--mc, #2563eb) 10%, transparent);
}

.ql-body { flex: 1; min-width: 0; }
.ql-top { display: flex; align-items: center; gap: 8px; }
.ql-title { font-size: 14px; font-weight: 700; color: #0f172a; }
.ql-meta { margin: 4px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.6); }

.ql-side { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

/* Badge XP — gradien emas, terasa spt lencana pencapaian bukan sekadar angka */
.ql-xp-badge {
  display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
  font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;
  color: #78350f; background: linear-gradient(135deg, #fde68a, #f59e0b);
  box-shadow: 0 4px 10px -4px rgba(245, 158, 11, 0.6);
}

.ql-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.ql-icon-btn {
  display: grid; place-content: center; width: 30px; height: 30px;
  border: 1px solid rgba(37, 99, 235, 0.14); background: rgba(37, 99, 235, 0.04); cursor: pointer;
  color: rgba(15, 23, 42, 0.65); border-radius: 9px;
}
.ql-icon-btn--del { background: rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.25); color: #b91c1c; }
.ql-icon-btn:disabled { opacity: 0.6; cursor: default; }

/* Switch aktif/nonaktif — gaya "power toggle" ala menu game, ganti tombol teks */
.ql-switch { position: relative; display: inline-flex; cursor: pointer; }
.ql-switch input { position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
.ql-switch-track {
  width: 38px; height: 22px; border-radius: 999px; background: rgba(15, 23, 42, 0.14);
  display: flex; align-items: center; padding: 2px; transition: background 0.15s ease;
}
.ql-switch-thumb {
  width: 18px; height: 18px; border-radius: 50%; background: #fff;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.25); transition: transform 0.15s ease;
}
.ql-switch input:checked + .ql-switch-track { background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%); }
.ql-switch input:checked + .ql-switch-track .ql-switch-thumb { transform: translateX(16px); }
.ql-toggle-spinner { opacity: 0; }
.ql-toggle-spinner.is-spinning { opacity: 1; }
.ql-switch.is-disabled { opacity: 0.6; cursor: default; }

.ql-btn {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid rgba(37, 99, 235, 0.14); background: rgba(37, 99, 235, 0.04); cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: rgba(15, 23, 42, 0.65); padding: 8px 12px; border-radius: 10px;
}
.ql-btn--sm { padding: 6px 10px; font-size: 11.5px; }
.ql-btn:disabled { opacity: 0.6; cursor: default; }

.ql-edit-date {
  display: flex; flex-direction: column; gap: 6px; margin-top: 8px; padding-top: 8px;
  border-top: 1px dashed rgba(15, 23, 42, 0.14);
}
.ql-edit-date input[type="date"] {
  align-self: flex-start; border: 1.5px solid rgba(37, 99, 235, 0.14); border-radius: 10px; padding: 8px 10px;
  font-family: inherit; font-size: 13px; color: #0f172a; background: rgba(37, 99, 235, 0.04); outline: none;
}
.ql-edit-date input[type="date"]:focus { border-color: #2563eb; }
.ql-edit-date-actions { display: flex; gap: 8px; }
</style>
