// src/store/employeeInfoModal.js
// Buka/tutup EmployeeInfoModal secara manual dari Profil — edit status pegawai/
// kompetensi/sertifikat sesudah registrasi awal (pola sama dgn bodyMetricsModal.js).
import { reactive, readonly } from 'vue'

const state = reactive({ open: false })

export function openEmployeeInfoModal() {
  state.open = true
}

export function closeEmployeeInfoModal() {
  state.open = false
}

export const employeeInfoModalState = readonly(state)
