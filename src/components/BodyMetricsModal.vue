<template>
<div class="bm-modal-backdrop">
  <div class="bm-modal mui-card" role="dialog" aria-modal="true" aria-labelledby="bm-modal-title">
    <button v-if="dismissible" class="bm-modal-close" type="button" aria-label="Tutup" @click="closeBodyMetricsModal">✕</button>
    <p id="bm-modal-title" class="bm-modal-title">{{ dismissible ? 'Edit Data Tubuh' : 'Lengkapi Data Tubuh' }}</p>
    <p class="bm-modal-sub">
      {{ dismissible ? 'Perbarui berat & tinggi badan untuk BMI yang akurat.' : 'Isi berat & tinggi badan dulu sebelum lanjut menggunakan aplikasi.' }}
    </p>

    <form class="gp-form" @submit.prevent="handleSubmit">
      <label class="gp-label" for="bmm-weight">Berat Badan (kg)</label>
      <div class="gp-input-wrap">
        <input
          id="bmm-weight"
          v-model.number="weight"
          class="gp-input"
          type="number"
          min="1"
          step="0.1"
          placeholder="mis. 68"
          inputmode="decimal"
        />
      </div>

      <label class="gp-label" for="bmm-height">Tinggi Badan (cm)</label>
      <div class="gp-input-wrap">
        <input
          id="bmm-height"
          v-model.number="height"
          class="gp-input"
          type="number"
          min="1"
          step="0.1"
          placeholder="mis. 172"
          inputmode="decimal"
        />
      </div>

      <p v-if="bmiPreview" class="bm-preview">
        BMI kamu: <strong>{{ bmiPreview }}</strong> ({{ bmiCategoryPreview }})
      </p>

      <p v-if="errorMsg" class="gp-error">{{ errorMsg }}</p>

      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Menyimpan…' : 'Simpan Data Tubuh' }}
      </button>
    </form>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { authState, reloadAuth } from '../store/auth.js'
import { closeBodyMetricsModal } from '../store/bodyMetricsModal.js'
import { useProfile } from '../composables/useMemberData.js'
import { updateBodyMetrics } from '../services/profile.js'
import { calcBmi, bmiCategory } from '../lib/normalize.js'

const { profile } = useProfile()

// Bisa ditutup kalau ini dibuka manual untuk edit (bukan gerbang wajib-isi pertama kali).
const dismissible = computed(() => !authState.needsBodyMetrics)

const weight = ref(null)
const height = ref(null)

// Pre-fill dari data yang sudah tersimpan begitu profil selesai dimuat — hanya sekali,
// tanpa menimpa ketikan user.
const stopPrefill = watch(profile, (p) => {
  if (!p) return
  if (weight.value == null) weight.value = p.weight ?? null
  if (height.value == null) height.value = p.height ?? null
  stopPrefill()
}, { immediate: true })

const bmiPreview = computed(() => calcBmi(weight.value, height.value))
const bmiCategoryPreview = computed(() => bmiCategory(bmiPreview.value))

const saving = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() =>
  Number(weight.value) > 0 && Number(height.value) > 0 && !saving.value,
)

async function handleSubmit() {
  if (!canSubmit.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    await updateBodyMetrics(weight.value, height.value)
    await reloadAuth() // authState.needsBodyMetrics jadi false -> modal ini otomatis hilang
    closeBodyMetricsModal() // jaga-jaga kalau dibuka manual (edit mode)
  } catch (e) {
    errorMsg.value = 'Gagal menyimpan: ' + (e?.message || e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.bm-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 10, 46, 0.72);
  backdrop-filter: blur(4px);
}

.bm-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
}

.bm-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: grid;
  place-content: center;
  color: rgba(248, 250, 252, 0.75);
  background: rgba(255, 255, 255, 0.08);
  font-size: 14px;
}
.bm-modal-close:hover { background: rgba(255, 255, 255, 0.14); }

.bm-modal-title {
  margin: 0 0 6px;
  font-family: "Chakra Petch", system-ui, sans-serif;
  font-size: 19px;
  font-weight: 700;
  color: #F8FAFC;
}

.bm-modal-sub {
  margin: 0 0 18px;
  font-size: 12.5px;
  color: rgba(248, 250, 252, 0.65);
}

.gp-form { display: flex; flex-direction: column; }

.gp-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #F8FAFC;
}

.gp-label:not(:first-child) { margin-top: 18px; }

.gp-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.gp-input-wrap:focus-within {
  background: rgba(255, 255, 255, 0.14);
  border-color: #fc4c02;
  box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.15);
}

.gp-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-family: inherit;
  font-size: 15px;
  color: #F8FAFC;
  color-scheme: dark;
}

.gp-input::placeholder { color: rgba(248, 250, 252, 0.5); }

.bm-preview {
  margin: 16px 2px 0;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.75);
}

.gp-error {
  margin: 8px 2px 0;
  font-size: 12px;
  color: #dc2626;
}

.gp-submit {
  margin-top: 24px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 16px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #1c1917;
  box-shadow: 0 16px 32px -16px rgba(17, 18, 20, 0.7);
  transition: all 0.2s ease-in-out;
}

.gp-submit:hover:not(:disabled) { transform: scale(1.01); }
.gp-submit:active:not(:disabled) { transform: scale(0.98); }
.gp-submit:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
