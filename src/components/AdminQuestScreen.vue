<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Kelola Quest</p>
          <p class="mui-h-sub">Atur misi latihan peserta</p>
        </div>
      </div>
      <span class="mui-pill">{{ quests.length }} Quest</span>
    </header>

    <!-- Form tambah quest -->
    <section class="mui-block">
      <h2 class="mui-section-title">Tambah Quest</h2>
      <form class="qf" @submit.prevent="submit">
        <div class="qf-row">
          <label class="qf-field">
            <span>Judul</span>
            <input v-model="form.title" type="text" placeholder="mis. Lari 5 KM" required />
          </label>
          <label class="qf-field qf-narrow">
            <span>Reward (XP)</span>
            <input v-model.number="form.reward" type="number" min="0" required />
          </label>
        </div>

        <label class="qf-field">
          <span>Deskripsi</span>
          <input v-model="form.description" type="text" placeholder="Keterangan singkat" />
        </label>

        <div class="qf-row">
          <label class="qf-field">
            <span>Periode</span>
            <select v-model="form.scope">
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
            </select>
          </label>
          <label class="qf-field">
            <span>{{ form.scope === 'mingguan' ? 'Tanggal (dalam minggu target)' : 'Tanggal' }}</span>
            <input v-model="form.quest_date" type="date" required />
          </label>
          <label class="qf-field">
            <span>Metrik</span>
            <select v-model="form.metric">
              <option value="run_distance">Jarak lari (km)</option>
              <option value="run_sessions">Jumlah sesi lari</option>
              <option value="gym_sessions">Jumlah sesi gym</option>
              <option value="gym_duration">Durasi gym (menit)</option>
            </select>
          </label>
        </div>
        <p v-if="questDatePreview" class="qf-hint">Berlaku: {{ questDatePreview }}</p>

        <label class="qf-field qf-narrow">
          <span>Target ({{ targetUnit }})</span>
          <input v-model.number="form.target" type="number" min="0" :step="targetStep" required />
        </label>

        <p v-if="formError" class="qf-error">{{ formError }}</p>
        <button class="qf-submit" type="submit" :disabled="saving">
          {{ saving ? 'Menyimpan…' : 'Tambah Quest' }}
        </button>
      </form>
    </section>

    <!-- Daftar quest -->
    <section class="mui-block">
      <h2 class="mui-section-title">Daftar Quest</h2>
      <div v-if="loading" class="ql-list">
        <div v-for="i in 3" :key="i" class="ql-item">
          <div class="ql-body">
            <div class="mui-skel mui-skel--text" style="width: 45%;"></div>
            <div class="mui-skel mui-skel--text" style="width: 75%; margin-top: 8px;"></div>
          </div>
          <div class="mui-skel" style="width: 84px; height: 32px; flex-shrink: 0;"></div>
        </div>
      </div>
      <div v-else class="ql-list">
        <article v-for="q in quests" :key="q.id" class="ql-item" :class="{ 'is-off': !q.active }">
          <div class="ql-body">
            <div class="ql-top">
              <span class="ql-title">{{ q.title }}</span>
              <span class="mui-tag" :class="q.scope === 'harian' ? 'mui-tag--blue' : 'mui-tag--orange'">{{ q.scope }}</span>
            </div>
            <p class="ql-meta">
              {{ metricLabel(q.metric) }} · target {{ q.target }} {{ q.unit }} · {{ q.reward }} XP
              <template v-if="questPeriodLabel(q.scope, q.quest_date)"> · {{ questPeriodLabel(q.scope, q.quest_date) }}</template>
            </p>

            <div v-if="editingId === q.id" class="ql-edit-date">
              <input v-model="editDate" type="date" />
              <span v-if="questPeriodLabel(q.scope, editDate)" class="qf-hint">Berlaku: {{ questPeriodLabel(q.scope, editDate) }}</span>
              <div class="ql-edit-date-actions">
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="saveDate(q)">
                  {{ savingDate ? 'Menyimpan…' : 'Simpan' }}
                </button>
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="cancelEditDate">Batal</button>
              </div>
            </div>
          </div>
          <div class="ql-actions">
            <button v-if="editingId !== q.id" class="ql-btn" type="button" @click="startEditDate(q)">Ubah Tanggal</button>
            <button class="ql-btn" type="button" @click="toggleActive(q)">
              {{ q.active ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
            <button class="ql-btn ql-btn--del" type="button" @click="hapus(q)">Hapus</button>
          </div>
        </article>
        <p v-if="quests.length === 0" class="qf-muted">Belum ada quest.</p>
      </div>
    </section>
  </div>

  <AdminTabBar />
</div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { authState } from '../store/auth.js'
import { useAdminQuests } from '../composables/useAdminQuests.js'
import { questPeriodLabel } from '../services/questSummary.js'
import { showToast } from '../store/toast.js'
import AdminTabBar from './AdminTabBar.vue'

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

async function submit() {
  formError.value = ''
  saving.value = true
  try {
    await create({
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
    form.title = ''
    form.description = ''
    form.quest_date = ''
    showToast('Quest berhasil ditambahkan')
  } catch (e) {
    formError.value = 'Gagal menyimpan: ' + (e?.message || e)
    showToast('Gagal menambahkan quest', 'error')
  } finally {
    saving.value = false
  }
}

async function toggleActive(q) {
  try {
    await update(q.id, { active: !q.active })
    showToast(q.active ? 'Quest dinonaktifkan' : 'Quest diaktifkan')
  } catch (e) {
    showToast(e?.message || 'Gagal mengubah status quest', 'error')
  }
}

const editingId = ref(null)
const editDate = ref('')
const savingDate = ref(false)

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
  try {
    await update(q.id, { quest_date: editDate.value || null })
    cancelEditDate()
    showToast('Tanggal quest berhasil diperbarui')
  } catch (e) {
    showToast(e?.message || 'Gagal memperbarui tanggal', 'error')
  } finally {
    savingDate.value = false
  }
}

async function hapus(q) {
  if (!window.confirm(`Hapus quest "${q.title}"?`)) return
  try {
    await remove(q.id)
    showToast('Quest berhasil dihapus')
  } catch (e) {
    showToast(e?.message || 'Gagal menghapus quest', 'error')
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.qf { display: flex; flex-direction: column; gap: 12px; }
.qf-row { display: flex; gap: 12px; flex-wrap: wrap; }
.qf-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; }
.qf-field.qf-narrow { flex: 0 1 130px; }
.qf-field span { font-size: 12px; font-weight: 600; color: #57534e; }
.qf-field input, .qf-field select {
  border: 1.5px solid #ece7e2; border-radius: 12px; padding: 11px 12px;
  font-family: inherit; font-size: 14px; color: #1c1917; background: #fff; outline: none;
}
.qf-field input:focus, .qf-field select:focus { border-color: #fc4c02; }
.qf-hint { margin: -4px 0 0; font-size: 12px; font-weight: 600; color: #ea580c; }
.qf-submit {
  align-self: flex-start; border: none; cursor: pointer; font-family: inherit;
  font-size: 14px; font-weight: 700; color: #fff; padding: 12px 20px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}
.qf-submit:disabled { opacity: 0.6; cursor: default; }
.qf-error { margin: 0; color: #dc2626; font-size: 12.5px; font-weight: 600; }
.qf-muted { color: #a8a29e; font-size: 13px; }

.ql-list { display: flex; flex-direction: column; gap: 10px; }
.ql-item {
  display: flex; align-items: flex-start; gap: 12px; background: #fff;
  border-radius: 16px; padding: 14px 16px; box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}
.ql-item.is-off { opacity: 0.55; }
.ql-body { flex: 1; min-width: 0; }
.ql-top { display: flex; align-items: center; gap: 8px; }
.ql-title { font-size: 14px; font-weight: 700; color: #1c1917; }
.ql-meta { margin: 4px 0 0; font-size: 12px; color: #57534e; }
.ql-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
.ql-btn {
  border: 1px solid #ece7e2; background: #f5f1ec; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #57534e; padding: 8px 12px; border-radius: 10px;
}
.ql-btn--del { background: #fee2e2; border-color: #fecaca; color: #dc2626; }
.ql-btn--sm { padding: 6px 10px; font-size: 11.5px; }
.ql-btn:disabled { opacity: 0.6; cursor: default; }

.ql-edit-date {
  display: flex; flex-direction: column; gap: 6px; margin-top: 8px; padding-top: 8px;
  border-top: 1px dashed #ece7e2;
}
.ql-edit-date input[type="date"] {
  align-self: flex-start; border: 1.5px solid #ece7e2; border-radius: 10px; padding: 8px 10px;
  font-family: inherit; font-size: 13px; color: #1c1917; background: #fff; outline: none;
}
.ql-edit-date input[type="date"]:focus { border-color: #fc4c02; }
.ql-edit-date-actions { display: flex; gap: 8px; }
</style>
