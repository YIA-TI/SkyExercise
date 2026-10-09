<template>
<div class="aeroguard-signin">
  <div class="phone-frame">
    <!-- Header dengan logo Almira -->
    <div class="top-visual">
      <img src="../assets/img/almira-logo.png" alt="Almira" class="brand-logo" />
      <h1 class="title">Masuk sebagai Admin</h1>
      <p class="subtitle">Kelola pemantauan latihan peserta</p>
    </div>

    <form class="form" @submit.prevent="handleSignIn">
      <!-- Email -->
      <label class="field-label" for="admin-email">Alamat Email</label>
      <div class="input-wrap">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <input
          id="admin-email"
          v-model="email"
          class="input"
          type="email"
          name="email"
          placeholder="admin@email.com"
          autocomplete="username"
        />
      </div>

      <!-- Kata Sandi -->
      <label class="field-label" for="admin-password">Kata Sandi</label>
      <div class="input-wrap">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <input
          id="admin-password"
          v-model="password"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="Kata sandi"
          autocomplete="current-password"
        />
        <button
          class="toggle-eye"
          type="button"
          :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
          @click="showPassword = !showPassword"
        >
          <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <p v-if="errorMsg" class="signin-error">{{ errorMsg }}</p>

      <button class="submit" type="submit" :disabled="submitting">
        <svg v-if="submitting" class="signin-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        <span>{{ submitting ? 'Memproses…' : 'Masuk' }}</span>
        <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInAdmin } from '../store/auth.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const submitting = ref(false)

// Login admin (email/password Supabase Auth).
async function handleSignIn() {
  if (submitting.value) return
  errorMsg.value = ''
  submitting.value = true
  try {
    await signInAdmin(email.value, password.value)
    router.push('/welcome-back')
  } catch (_e) {
    errorMsg.value = 'Email atau kata sandi salah.'
  } finally {
    submitting.value = false
  }
}
</script>

<style>
@import '../assets/auth-shell.css';
</style>
