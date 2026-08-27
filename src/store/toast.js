// src/store/toast.js
// Notifikasi kecil untuk feedback aksi (sukses/gagal) — dipanggil dari mana saja,
// dirender sekali oleh <ToastHost/> yang dipasang di App.vue.
import { reactive, readonly } from 'vue'

let nextId = 1
const state = reactive({ toasts: [] })

export function showToast(message, type = 'success', duration = 2600) {
  const id = nextId++
  state.toasts.push({ id, message, type })
  setTimeout(() => dismissToast(id), duration)
  return id
}

export function dismissToast(id) {
  const i = state.toasts.findIndex((t) => t.id === id)
  if (i !== -1) state.toasts.splice(i, 1)
}

export const toastState = readonly(state)
