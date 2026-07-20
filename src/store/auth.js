// src/store/auth.js
// Mock Authentication State — tanpa backend, hanya untuk prototype UI
import { reactive, readonly } from 'vue'

const state = reactive({
  isLoggedIn: false,
  userRole: null,     // 'admin' | 'anggota' | null
  userName: '',
  userEmail: '',
})

export function loginAsAdmin() {
  state.isLoggedIn = true
  state.userRole = 'admin'
  state.userName = 'Budi Santoso'
  state.userEmail = 'budi@angkasapura.co.id'
}

export function loginAsAnggota() {
  state.isLoggedIn = true
  state.userRole = 'anggota'
  state.userName = 'Rizky Pratama'
  state.userEmail = 'rizky@angkasapura.co.id'
}

export function logout() {
  state.isLoggedIn = false
  state.userRole = null
  state.userName = ''
  state.userEmail = ''
}

// Ekspor state sebagai readonly agar hanya diubah lewat fungsi di atas
export const authState = readonly(state)
