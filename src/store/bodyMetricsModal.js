// src/store/bodyMetricsModal.js
// Buka/tutup BodyMetricsModal secara manual (dipanggil dari Profil/Home) di luar
// alur wajib-isi pertama kali (yang dikendalikan authState.needsBodyMetrics).
import { reactive, readonly } from 'vue'

const state = reactive({ open: false })

export function openBodyMetricsModal() {
  state.open = true
}

export function closeBodyMetricsModal() {
  state.open = false
}

export const bodyMetricsModalState = readonly(state)
