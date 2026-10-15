<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <div>
          <p class="mui-h-title">Complete Your Registration</p>
          <p class="mui-h-sub">Fill in your data before continuing to use the app.</p>
        </div>
      </div>
    </header>

    <form class="mui-card gp-form" @submit.prevent="handleSubmit">
      <label class="gp-label" for="rg-name">Name</label>
      <div class="gp-input-wrap">
        <input
          id="rg-name"
          v-model="name"
          class="gp-input"
          type="text"
          placeholder="Full name"
          autocomplete="name"
        />
      </div>

      <label class="gp-label" for="rg-birth">Date of Birth</label>
      <div class="gp-input-wrap">
        <input
          id="rg-birth"
          v-model="birthDate"
          class="gp-input"
          type="date"
          :max="todayStr"
        />
      </div>

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

      <label class="gp-label" for="rg-cert">Certificate Proof <span class="gp-optional">(optional)</span></label>
      <label class="rg-upload" :class="{ 'has-file': certificateFile }" for="rg-cert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>{{ certificateFile ? certificateFile.name : 'Choose file (PDF/JPG/PNG, max 10MB)' }}</span>
      </label>
      <input id="rg-cert" type="file" class="rg-file-input" accept=".pdf,image/*" @change="onFileChange" />

      <p v-if="errorMsg" class="gp-error">{{ errorMsg }}</p>

      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Saving…' : 'Complete Registration' }}
      </button>
    </form>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { reloadAuth } from '../store/auth.js'
import { useProfile } from '../composables/useMemberData.js'
import { submitRegistration } from '../services/profile.js'
import { toDateStr } from '../lib/normalize.js'

const router = useRouter()
const { profile } = useProfile()

const name = ref('')
const birthDate = ref('')
const employmentStatus = ref('')
const competency = ref('')
const certificateFile = ref(null)

const todayStr = toDateStr(new Date())

// Pre-fill nama dari profil Strava — hanya sekali, tanpa menimpa ketikan user.
const stopPrefill = watch(profile, (p) => {
  if (!p) return
  if (!name.value) name.value = p.name ?? ''
  stopPrefill()
}, { immediate: true })

function onFileChange(e) {
  certificateFile.value = e.target.files?.[0] ?? null
}

const saving = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() =>
  name.value.trim().length > 0 &&
  !!birthDate.value &&
  !!employmentStatus.value &&
  !!competency.value &&
  !saving.value,
)

async function handleSubmit() {
  if (!canSubmit.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    const parts = name.value.trim().split(/\s+/)
    const firstname = parts[0]
    const lastname = parts.slice(1).join(' ')
    await submitRegistration({
      firstname,
      lastname,
      birthDate: birthDate.value,
      employmentStatus: employmentStatus.value,
      competency: competency.value,
      certificateFile: certificateFile.value,
    })
    await reloadAuth() // authState.needsRegistration jadi false
    router.replace('/home')
  } catch (e) {
    errorMsg.value = 'Failed to save: ' + (e?.message || e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

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
