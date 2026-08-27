<template>
<div class="toast-host" role="status" aria-live="polite">
  <TransitionGroup name="toast">
    <div
      v-for="t in toastState.toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`"
      @click="dismissToast(t.id)"
    >
      <svg v-if="t.type === 'success'" class="toast-ic" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <svg v-else class="toast-ic" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ t.message }}</span>
    </div>
  </TransitionGroup>
</div>
</template>

<script setup>
import { toastState, dismissToast } from '../store/toast.js'
</script>

<style>
.toast-host {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 420px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 18px 36px -16px rgba(17, 18, 20, 0.5);
  cursor: pointer;
  pointer-events: auto;
}

.toast--success { background: #059669; }
.toast--error   { background: #dc2626; }
.toast-ic { flex: 0 0 auto; }

.toast-enter-active, .toast-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-10px) scale(0.96); }
.toast-leave-to   { opacity: 0; transform: translateY(-6px) scale(0.98); }
.toast-move       { transition: transform 0.22s ease; }
</style>
