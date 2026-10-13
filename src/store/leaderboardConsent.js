// src/store/leaderboardConsent.js
// Buka/tutup LeaderboardConsentModal secara manual (dari halaman Peringkat/Profil), di luar
// gerbang wajib pertama kali (authState.needsLeaderboardConsent).
import { reactive, readonly } from 'vue'

const state = reactive({ open: false })

export function openLeaderboardConsent() {
  state.open = true
}

export function closeLeaderboardConsent() {
  state.open = false
}

export const leaderboardConsentState = readonly(state)
