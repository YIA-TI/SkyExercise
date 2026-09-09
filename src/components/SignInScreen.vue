<template>
<div class="aeroguard-signin">
  <div class="phone-frame">
    <!-- Header dengan badge ikon AeroGuard -->
    <div class="top-visual">
      <div class="badge">
        <svg class="badge-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.4c-.66 0-1.15.72-1.15 1.95v5.03L3.4 13.86a.92.92 0 0 0-.4.77v1.02c0 .3.29.52.58.44l7.27-2.02v4.35l-1.73 1.24a.52.52 0 0 0-.22.42v.98c0 .28.28.48.55.4L12 20.98l2.55.72c.27.08.55-.12.55-.4v-.98a.52.52 0 0 0-.22-.42l-1.73-1.24v-4.35l7.27 2.02c.29.08.58-.14.58-.44v-1.02a.92.92 0 0 0-.4-.77l-7.45-4.48V4.35c0-1.23-.49-1.95-1.15-1.95Z"
            fill="url(#signinGrad)"
            stroke="rgba(255,255,255,0.9)"
            stroke-width="0.5"
            stroke-linejoin="round"
          />
          <defs>
            <linearGradient id="signinGrad" x1="12" y1="2.4" x2="12" y2="21.7" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff" />
              <stop offset="1" stop-color="#ccfbf1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="title">Masuk ke AeroGuard</h1>
      <p class="subtitle">Hubungkan Strava untuk mulai memantau latihan Anda</p>
    </div>

    <!-- Peserta masuk lewat Strava saja — tak ada akun email/password terpisah. -->
    <div class="social-row">
      <button class="social-button strava" type="button" aria-label="Masuk dengan Strava" @click="handleStrava">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      </button>
    </div>

    <p v-if="errorMsg" class="signin-error">{{ errorMsg }}</p>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { connectStrava } from '../store/strava.js'

const errorMsg = ref('')

// Peserta masuk lewat Strava (redirect OAuth) — cek kuota dulu.
async function handleStrava() {
  errorMsg.value = ''
  const res = await connectStrava()
  if (!res.ok) {
    errorMsg.value = `Kuota koneksi Strava sedang penuh (${res.used}/${res.max}). Coba lagi nanti — kuota akan ditambah setelah app disetujui Strava.`
  }
}
</script>

<style>
@import '../assets/auth-shell.css';
</style>
