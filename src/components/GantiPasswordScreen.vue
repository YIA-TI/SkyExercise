<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <button class="gp-back" type="button" aria-label="Kembali" @click="kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p class="mui-h-title">Ganti Password</p>
          <p class="mui-h-sub">Perbarui kata sandi akunmu</p>
        </div>
      </div>
    </header>

    <form class="mui-card gp-form" @submit.prevent="handleSubmit">
      <!-- Kata sandi baru -->
      <label class="gp-label" for="gp-new">Kata Sandi Baru</label>
      <div class="gp-input-wrap">
        <svg class="gp-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <input
          id="gp-new"
          v-model="newPassword"
          class="gp-input"
          :type="showNew ? 'text' : 'password'"
          placeholder="Minimal 8 karakter"
          autocomplete="new-password"
        />
        <button class="gp-eye" type="button" :aria-label="showNew ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showNew = !showNew">
          <svg v-if="showNew" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <!-- Indikator kekuatan -->
      <div v-if="newPassword" class="gp-strength">
        <div class="gp-strength-track">
          <span v-for="i in 4" :key="i" class="gp-strength-bar" :class="{ 'is-filled': strength >= i }" :style="strength >= i ? { background: strengthColor } : null"></span>
        </div>
        <span class="gp-strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
      </div>

      <!-- Konfirmasi -->
      <label class="gp-label" for="gp-confirm">Konfirmasi Kata Sandi Baru</label>
      <div class="gp-input-wrap" :class="{ 'has-error': confirmError }">
        <svg class="gp-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <input
          id="gp-confirm"
          v-model="confirmPassword"
          class="gp-input"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Ulangi kata sandi baru"
          autocomplete="new-password"
        />
        <button class="gp-eye" type="button" :aria-label="showConfirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showConfirm = !showConfirm">
          <svg v-if="showConfirm" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <p v-if="confirmError" class="gp-error">Konfirmasi kata sandi tidak cocok.</p>
      <p v-if="errorMsg" class="gp-error">{{ errorMsg }}</p>

      <button class="gp-submit" type="submit" :disabled="!canSubmit">{{ saving ? 'Menyimpan…' : 'Simpan Kata Sandi Baru' }}</button>

      <p v-if="success" class="gp-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Kata sandi berhasil diperbarui.
      </p>
    </form>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import MemberTabBar from './MemberTabBar.vue'

const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const showNew = ref(false)
const showConfirm = ref(false)
const success = ref(false)
const errorMsg = ref('')
const saving = ref(false)

function kembali() {
  router.push('/profil')
}

const confirmError = computed(() =>
  confirmPassword.value.length > 0 && confirmPassword.value !== newPassword.value,
)

const strength = computed(() => {
  const v = newPassword.value
  if (!v) return 0
  let s = 0
  if (v.length >= 8) s++
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
})

const strengthMeta = [
  { label: 'Sangat Lemah', color: '#dc2626' },
  { label: 'Lemah', color: '#dc2626' },
  { label: 'Sedang', color: '#ea580c' },
  { label: 'Kuat', color: '#059669' },
  { label: 'Sangat Kuat', color: '#059669' },
]

const strengthLabel = computed(() => strengthMeta[strength.value].label)
const strengthColor = computed(() => strengthMeta[strength.value].color)

const canSubmit = computed(() =>
  newPassword.value.length >= 8 &&
  confirmPassword.value === newPassword.value &&
  !saving.value,
)

async function handleSubmit() {
  if (!canSubmit.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) throw error
    success.value = true
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => router.push('/profil'), 1200)
  } catch (e) {
    errorMsg.value = 'Gagal memperbarui kata sandi: ' + (e?.message || e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.gp-back {
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

.gp-form { display: flex; flex-direction: column; }

.gp-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #292524;
}

.gp-label:not(:first-child) { margin-top: 18px; }

.gp-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 14px;
  background: #f5f1ec;
  border: 1.5px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.gp-input-wrap:focus-within {
  background: #ffffff;
  border-color: #fc4c02;
  box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.15);
}

.gp-input-wrap.has-error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
}

.gp-input-icon { flex: 0 0 auto; color: #57534e; }

.gp-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-family: inherit;
  font-size: 15px;
  color: #1c1917;
}

.gp-input::placeholder { color: #a8a29e; }

.gp-eye {
  flex: 0 0 auto;
  display: grid;
  place-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #57534e;
}

.gp-eye:hover { color: #1c1917; }

/* Indikator kekuatan */
.gp-strength { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.gp-strength-track { flex: 1; display: flex; gap: 5px; }
.gp-strength-bar { flex: 1; height: 6px; border-radius: 999px; background: #ece7e2; }
.gp-strength-label { font-size: 11.5px; font-weight: 700; white-space: nowrap; }

.gp-error {
  margin: 8px 2px 0;
  font-size: 12px;
  color: #dc2626;
}

.gp-submit {
  margin-top: 24px;
  width: 100%;
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

.gp-success {
  margin: 14px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #059669;
}
</style>
