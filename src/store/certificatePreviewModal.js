// src/store/certificatePreviewModal.js
// Buka/tutup CertificatePreviewModal — lihat bukti sertifikat (path storage privat
// 'sertifikat') dari Profil (atau layar lain yang nanti butuh, pola sama dgn
// bodyMetricsModal.js), lewat signed URL (bucket privat, bukan getPublicUrl).
import { reactive, readonly } from 'vue'

const state = reactive({ open: false, path: null })

export function openCertificatePreview(path) {
  state.path = path
  state.open = true
}

export function closeCertificatePreview() {
  state.open = false
  state.path = null
}

export const certificatePreviewModalState = readonly(state)
