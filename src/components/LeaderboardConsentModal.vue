<template>
<div class="lc-backdrop">
  <div class="lc-modal mui-card" role="dialog" aria-modal="true" aria-labelledby="lc-title">
    <p id="lc-title" class="lc-title">Join the weekly leaderboard?</p>

    <p class="lc-text">
      If you join, other members who have also joined will see your
      <strong>name, profile photo and weekly totals</strong> (distance, effort points and XP)
      taken from your Strava activities.
    </p>
    <ul class="lc-list">
      <li>Joining is <strong>optional</strong>. If you don't join, you still see your own position.</li>
      <li>Only members who joined can see the list, and only joined members appear in it.</li>
      <li>You can leave any time from your Profile. You disappear from the list immediately.</li>
      <li>Your data is never shown to anyone outside the ARFF program. Program administrators can see all members' activity data.</li>
    </ul>

    <p v-if="errorMsg" class="lc-error">{{ errorMsg }}</p>

    <button class="lc-btn lc-btn--primary" type="button" :disabled="saving" @click="choose(true)">
      {{ saving ? 'Saving…' : 'Yes, show me on the leaderboard' }}
    </button>
    <button class="lc-btn lc-btn--ghost" type="button" :disabled="saving" @click="choose(false)">
      No, keep my data private
    </button>
    <button v-if="dismissible" class="lc-cancel" type="button" :disabled="saving" @click="closeLeaderboardConsent">
      Decide later
    </button>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authState, reloadAuth } from '../store/auth.js'
import { closeLeaderboardConsent } from '../store/leaderboardConsent.js'
import { setLeaderboardOptIn } from '../services/profile.js'

// Gerbang wajib pertama kali tidak bisa ditutup tanpa memilih; saat dibuka manual boleh.
const dismissible = computed(() => !authState.needsLeaderboardConsent)

const saving = ref(false)
const errorMsg = ref('')

async function choose(optIn) {
  if (saving.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    await setLeaderboardOptIn(optIn)
    await reloadAuth() // needsLeaderboardConsent jadi false -> modal hilang
    closeLeaderboardConsent()
  } catch (e) {
    errorMsg.value = 'Failed to save: ' + (e?.message || e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.lc-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.55);
}
.lc-modal {
  width: 100%;
  max-width: 420px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 22px 20px;
}
.lc-title { margin: 0 0 10px; font-size: 18px; font-weight: 800; }
.lc-text { margin: 0 0 10px; font-size: 14px; line-height: 1.5; }
.lc-list { margin: 0 0 16px; padding-left: 18px; font-size: 13px; line-height: 1.5; opacity: 0.8; }
.lc-list li + li { margin-top: 6px; }
.lc-error { margin: 0 0 10px; font-size: 13px; color: #dc2626; }
.lc-btn {
  display: block;
  width: 100%;
  padding: 13px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.lc-btn + .lc-btn { margin-top: 10px; }
.lc-btn:disabled { opacity: 0.65; cursor: default; }
.lc-btn--primary { border: none; color: #fff; background: linear-gradient(45deg, rgb(252, 100, 45), rgb(255, 145, 77)); }
.lc-btn--ghost { border: 1px solid rgba(15, 23, 42, 0.18); background: transparent; color: inherit; }
.lc-cancel {
  display: block;
  margin: 12px auto 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  opacity: 0.6;
  cursor: pointer;
}
</style>
