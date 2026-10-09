<template>
<div class="bm-modal-backdrop">
  <div class="bm-modal mui-card" role="dialog" aria-modal="true" aria-labelledby="bm-modal-title">
    <button v-if="dismissible" class="bm-modal-close" type="button" aria-label="Close" @click="closeBodyMetricsModal">✕</button>
    <p id="bm-modal-title" class="bm-modal-title">{{ dismissible ? 'Edit Body Data' : 'Complete Your Body Data' }}</p>
    <p class="bm-modal-sub">
      {{ dismissible ? 'Update your weight & height for an accurate BMI.' : 'Fill in your weight & height before continuing to use the app.' }}
    </p>

    <!-- Kartu ringkasan BMI: skala berwarna sesuai kategori (dihitung dari input di bawah) -->
    <div class="bm-bmi-card" :class="bmiTone">
      <div class="bm-bmi-top">
        <div>
          <p class="bm-bmi-label">Your BMI</p>
          <p class="bm-bmi-value mui-mono">{{ bmiPreview ?? '—' }}</p>
        </div>
        <span v-if="bmiCategoryPreview" class="bm-bmi-chip">{{ bmiCategoryLabel }}</span>
        <span v-else class="bm-bmi-hint">Enter weight &amp; height</span>
      </div>
      <div class="bm-scale">
        <span class="bm-seg is-kurus"></span>
        <span class="bm-seg is-normal"></span>
        <span class="bm-seg is-gemuk"></span>
        <span class="bm-seg is-obes"></span>
        <span v-if="bmiPreview" class="bm-marker" :style="{ left: markerPct + '%' }"></span>
      </div>
      <div class="bm-scale-labels">
        <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
      </div>
    </div>

    <form class="gp-form" @submit.prevent="handleSubmit">
      <label class="gp-label" for="bmm-weight">Weight (kg)</label>
      <div class="gp-input-wrap">
        <input
          id="bmm-weight"
          v-model.number="weight"
          class="gp-input"
          type="number"
          min="1"
          step="0.1"
          placeholder="e.g. 68"
          inputmode="decimal"
        />
      </div>

      <label class="gp-label" for="bmm-height">Height (cm)</label>
      <div class="gp-input-wrap">
        <input
          id="bmm-height"
          v-model.number="height"
          class="gp-input"
          type="number"
          min="1"
          step="0.1"
          placeholder="e.g. 172"
          inputmode="decimal"
        />
      </div>

      <p v-if="bmiPreview" class="bm-preview">
        Your BMI: <strong>{{ bmiPreview }}</strong> ({{ bmiCategoryLabel }})
      </p>

      <p v-if="errorMsg" class="gp-error">{{ errorMsg }}</p>

      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Saving…' : 'Save Body Data' }}
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

// bmiCategory() returns Indonesian labels (shared with the admin detail screen,
// which must keep showing them in Indonesian) — map to English for display here only.
const BMI_LABEL_EN = { Kurus: 'Underweight', Normal: 'Normal', Gemuk: 'Overweight', Obesitas: 'Obese' }
const bmiCategoryLabel = computed(() => BMI_LABEL_EN[bmiCategoryPreview.value] || bmiCategoryPreview.value)

// Tampilan: warna kartu & posisi penanda pada skala BMI 15–35 (di luar rentang → ujung skala)
const bmiTone = computed(() => ({
  'is-kurus': bmiCategoryPreview.value === 'Kurus',
  'is-normal': bmiCategoryPreview.value === 'Normal',
  'is-gemuk': bmiCategoryPreview.value === 'Gemuk',
  'is-obes': bmiCategoryPreview.value === 'Obesitas',
}))
const markerPct = computed(() => {
  const v = Number(bmiPreview.value)
  return Math.min(100, Math.max(0, ((v - 15) / 20) * 100))
})

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
    errorMsg.value = 'Failed to save: ' + (e?.message || e)
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
  background: rgba(15, 23, 42, 0.45);
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
  color: rgba(15, 23, 42, 0.65);
  background: rgba(15, 23, 42, 0.06);
  font-size: 14px;
}
.bm-modal-close:hover { background: rgba(15, 23, 42, 0.1); }

.bm-modal-title {
  margin: 0 0 6px;
  font-family: "Barlow", system-ui, sans-serif;
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
}

.bm-modal-sub {
  margin: 0 0 18px;
  font-size: 12.5px;
  color: rgba(15, 23, 42, 0.6);
}

/* ── Kartu BMI ── */
.bm-bmi-card {
  --tone: #2563eb;
  margin-bottom: 18px; padding: 14px 16px; border-radius: 18px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--tone) 12%, transparent), rgba(15, 23, 42, 0.03));
  border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
}
.bm-bmi-card.is-kurus { --tone: #38bdf8; }
.bm-bmi-card.is-normal { --tone: #34d399; }
.bm-bmi-card.is-gemuk { --tone: #fbbf24; }
.bm-bmi-card.is-obes { --tone: #f87171; }
.bm-bmi-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.bm-bmi-label { margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(15, 23, 42, 0.55); }
.bm-bmi-value { margin: 2px 0 0; font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
.bm-bmi-chip {
  font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px; color: #fff;
  background: var(--tone);
}
.bm-bmi-hint { font-size: 12px; color: rgba(15, 23, 42, 0.5); }
.bm-scale { position: relative; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; margin-top: 14px; }
.bm-seg { height: 8px; border-radius: 999px; opacity: 0.35; }
.bm-seg.is-kurus { background: #38bdf8; }
.bm-seg.is-normal { background: #34d399; }
.bm-seg.is-gemuk { background: #fbbf24; }
.bm-seg.is-obes { background: #f87171; }
.bm-bmi-card.is-kurus .bm-seg.is-kurus,
.bm-bmi-card.is-normal .bm-seg.is-normal,
.bm-bmi-card.is-gemuk .bm-seg.is-gemuk,
.bm-bmi-card.is-obes .bm-seg.is-obes { opacity: 1; box-shadow: 0 0 10px var(--tone); }
.bm-marker {
  position: absolute; top: -4px; width: 4px; height: 16px; margin-left: -2px; border-radius: 3px;
  background: #0f172a; box-shadow: 0 0 6px rgba(15, 23, 42, 0.4);
  transition: left 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.bm-scale-labels {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; margin-top: 6px;
  font-size: 10px; font-weight: 700; color: rgba(15, 23, 42, 0.5);
}
.bm-scale-labels span:nth-child(2) { text-align: center; }
.bm-scale-labels span:nth-child(3) { text-align: center; }
.bm-scale-labels span:nth-child(4) { text-align: right; }

.gp-form { display: flex; flex-direction: column; }

.gp-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #0f172a;
}

.gp-label:not(:first-child) { margin-top: 18px; }

.gp-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.05);
  border: 1.5px solid rgba(37, 99, 235, 0.14);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.gp-input-wrap:focus-within {
  background: rgba(37, 99, 235, 0.08);
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
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
  color: #0f172a;
}

.gp-input::placeholder { color: rgba(15, 23, 42, 0.35); }

.bm-preview {
  margin: 16px 2px 0;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.65);
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
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 16px 32px -16px rgba(37, 99, 235, 0.5);
  transition: all 0.2s ease-in-out;
}

.gp-submit:hover:not(:disabled) { transform: scale(1.01); }
.gp-submit:active:not(:disabled) { transform: scale(0.98); }
.gp-submit:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
