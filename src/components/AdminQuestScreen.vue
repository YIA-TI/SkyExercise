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
            <span>Metrik</span>
            <select v-model="form.metric">
              <option value="run_distance">Jarak lari (km)</option>
              <option value="run_sessions">Jumlah sesi lari</option>
              <option value="gym_sessions">Jumlah sesi gym</option>
              <option value="gym_duration">Durasi gym (menit)</option>
            </select>
          </label>
        </div>

        <div class="qf-row">
          <label class="qf-field qf-narrow">
            <span>Target</span>
            <input v-model.number="form.target" type="number" min="0" step="0.1" required />
          </label>
          <label class="qf-field qf-narrow">
            <span>Satuan</span>
            <input v-model="form.unit" type="text" placeholder="km / sesi / x" />
          </label>
          <label class="qf-field qf-narrow">
            <span>Urutan</span>
            <input v-model.number="form.sort_order" type="number" min="0" />
          </label>
        </div>

        <p v-if="formError" class="qf-error">{{ formError }}</p>
        <button class="qf-submit" type="submit" :disabled="saving">
          {{ saving ? 'Menyimpan…' : 'Tambah Quest' }}
        </button>
      </form>
    </section>

    <!-- Daftar quest -->
    <section class="mui-block">
      <h2 class="mui-section-title">Daftar Quest</h2>
      <p v-if="loading" class="qf-muted">Memuat…</p>
      <div v-else class="ql-list">
        <article v-for="q in quests" :key="q.id" class="ql-item" :class="{ 'is-off': !q.active }">
          <div class="ql-body">
            <div class="ql-top">
              <span class="ql-title">{{ q.title }}</span>
              <span class="mui-tag" :class="q.scope === 'harian' ? 'mui-tag--blue' : 'mui-tag--orange'">{{ q.scope }}</span>
            </div>
            <p class="ql-meta">{{ metricLabel(q.metric) }} · target {{ q.target }} {{ q.unit }} · {{ q.reward }} XP</p>
          </div>
          <div class="ql-actions">
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
import { reactive, ref, computed } from 'vue'
import { authState } from '../store/auth.js'
import { useAdminQuests } from '../composables/useAdminQuests.js'
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
  metric: 'run_distance',
  target: 5,
  unit: 'km',
  reward: 100,
  sort_order: 0,
})

const METRIC_LABELS = {
  run_distance: 'Jarak lari',
  run_sessions: 'Sesi lari',
  gym_sessions: 'Sesi gym',
  gym_duration: 'Durasi gym',
}
function metricLabel(m) { return METRIC_LABELS[m] || m }

async function submit() {
  formError.value = ''
  saving.value = true
  try {
    await create({
      title: form.title,
      description: form.description || null,
      scope: form.scope,
      metric: form.metric,
      target: form.target,
      unit: form.unit || null,
      reward: form.reward,
      sort_order: form.sort_order,
    })
    form.title = ''
    form.description = ''
  } catch (e) {
    formError.value = 'Gagal menyimpan: ' + (e?.message || e)
  } finally {
    saving.value = false
  }
}

async function toggleActive(q) {
  try { await update(q.id, { active: !q.active }) } catch (e) { alert(e?.message || e) }
}

async function hapus(q) {
  if (!window.confirm(`Hapus quest "${q.title}"?`)) return
  try { await remove(q.id) } catch (e) { alert(e?.message || e) }
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
  display: flex; align-items: center; gap: 12px; background: #fff;
  border-radius: 16px; padding: 14px 16px; box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}
.ql-item.is-off { opacity: 0.55; }
.ql-body { flex: 1; min-width: 0; }
.ql-top { display: flex; align-items: center; gap: 8px; }
.ql-title { font-size: 14px; font-weight: 700; color: #1c1917; }
.ql-meta { margin: 4px 0 0; font-size: 12px; color: #57534e; }
.ql-actions { display: flex; gap: 8px; flex-shrink: 0; }
.ql-btn {
  border: 1px solid #ece7e2; background: #f5f1ec; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #57534e; padding: 8px 12px; border-radius: 10px;
}
.ql-btn--del { background: #fee2e2; border-color: #fecaca; color: #dc2626; }
</style>
