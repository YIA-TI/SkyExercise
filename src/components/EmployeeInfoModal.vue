<template>
<div class="bm-modal-backdrop">
  <div class="bm-modal mui-card" role="dialog" aria-modal="true" aria-labelledby="ei-modal-title">
    <button class="bm-modal-close" type="button" aria-label="Close" @click="closeEmployeeInfoModal">✕</button>
    <p id="ei-modal-title" class="bm-modal-title">Edit Employee</p>
    <p class="bm-modal-sub">Update your employee status, competency & certificate proof.</p>

    <form class="gp-form" @submit.prevent="handleSubmit">
      <label class="gp-label">Employee Status</label>
      <div class="mui-toggle">
        <button type="button" :class="{ 'is-active': employmentStatus === 'organik' }" @click="employmentStatus = 'organik'">Organik</button>
        <button type="button" :class="{ 'is-active': employmentStatus === 'penunjang' }" @click="employmentStatus = 'penunjang'">Penunjang</button>
      </div>

      <label class="gp-label">Competency</label>
      <div class="mui-toggle">
        <button type="button" :class="{ 'is-active': competency === 'basic' }" @click="competency = 'basic'">Basic</button>
        <button type="button" :class="{ 'is-active': competency === 'junior' }" @click="competency = 'junior'">Junior</button>
        <button type="button" :class="{ 'is-active': competency === 'senior' }" @click="competency = 'senior'">Senior</button>
      </div>

      <label class="gp-label" for="ei-cert">
        Certificate Proof <span class="gp-optional">(optional — leave empty to keep current)</span>
      </label>
      <label class="rg-upload" :class="{ 'has-file': certificateFile }" for="ei-cert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>{{ certificateFile ? certificateFile.name : (hasExistingCertificate ? 'Replace file (PDF/JPG/PNG, max 10MB)' : 'Choose file (PDF/JPG/PNG, max 10MB)') }}</span>
      </label>
      <input id="ei-cert" type="file" class="rg-file-input" accept=".pdf,image/*" @change="onFileChange" />
      <p v-if="hasExistingCertificate && !certificateFile" class="bm-preview">Current certificate: uploaded ✓</p>

      <p v-if="errorMsg" class="gp-error">{{ errorMsg }}</p>

      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </form>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { reloadAuth } from '../store/auth.js'
import { closeEmployeeInfoModal } from '../store/employeeInfoModal.js'
import { useProfile } from '../composables/useMemberData.js'
import { updateMyEmployeeInfo } from '../services/profile.js'

const { profile } = useProfile()

const employmentStatus = ref('')
const competency = ref('')
const certificateFile = ref(null)

// Pre-fill dari data yang sudah tersimpan — hanya sekali, tanpa menimpa pilihan user.
const stopPrefill = watch(profile, (p) => {
  if (!p) return
  if (!employmentStatus.value) employmentStatus.value = p.employmentStatus ?? ''
  if (!competency.value) competency.value = p.competency ?? ''
  stopPrefill()
}, { immediate: true })

const hasExistingCertificate = computed(() => !!profile.value?.certificatePath)

function onFileChange(e) {
  certificateFile.value = e.target.files?.[0] ?? null
}

const saving = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() =>
  !!employmentStatus.value && !!competency.value && !saving.value,
)

async function handleSubmit() {
  if (!canSubmit.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    await updateMyEmployeeInfo({
      employmentStatus: employmentStatus.value,
      competency: competency.value,
      certificateFile: certificateFile.value,
    })
    await reloadAuth()
    closeEmployeeInfoModal()
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

.gp-optional {
  font-weight: 400;
  color: rgba(15, 23, 42, 0.45);
}

/* Upload sertifikat — input file asli disembunyikan, label di-stilkan sebagai tombol. */
.rg-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.rg-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.05);
  border: 1.5px dashed rgba(37, 99, 235, 0.3);
  color: rgba(15, 23, 42, 0.55);
  font-size: 13.5px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.rg-upload:hover { background: rgba(37, 99, 235, 0.08); border-color: #2563eb; }

.rg-upload.has-file {
  border-style: solid;
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
  color: #0f172a;
  font-weight: 600;
}

.bm-preview {
  margin: 10px 2px 0;
  font-size: 12.5px;
  color: rgba(15, 23, 42, 0.6);
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
