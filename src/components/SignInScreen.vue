<template>
<div class="aeroguard-signin">
  <div class="phone-frame">
    <!-- Header with Almira logo -->
    <div class="top-visual">
      <img src="../assets/img/almira-logo.png" alt="Almira" class="brand-logo" />
      <h1 class="title">Log in to Almira</h1>
      <p class="subtitle">Connect Strava to start tracking your training</p>
    </div>

    <!-- Members sign in via Strava only — no separate email/password account. -->
    <button class="strava-cta" type="button" @click="handleStrava">
      <svg xmlns="http://www.w3.org/2000/svg" height="19" width="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      Connect with Strava
    </button>
    <p class="strava-powered-by">Powered by Strava</p>

    <p v-if="errorMsg" class="signin-error">{{ errorMsg }}</p>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { connectStrava } from '../store/strava.js'

const errorMsg = ref('')

// Members sign in via Strava (OAuth redirect) — quota check first.
async function handleStrava() {
  errorMsg.value = ''
  const res = await connectStrava()
  if (!res.ok) {
    errorMsg.value = `Strava connection quota is full (${res.used}/${res.max}). Please try again later — the quota will be increased once the app is approved by Strava.`
  }
}
</script>

<style>
@import '../assets/auth-shell.css';
</style>
