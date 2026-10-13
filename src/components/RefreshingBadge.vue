<!-- src/components/RefreshingBadge.vue -->
<!-- Badge kecil "Refreshing..." dgn titik berdenyut — dipakai di header layar
     yang datanya di-refresh otomatis via Supabase Realtime (Phase 1), supaya
     update di background tidak perlu re-render skeleton penuh lagi.
     Teksnya bisa di-override via prop `label` kalau ada layar yang butuh
     teks lain. -->
<template>
  <span class="refreshing-badge">
    <span class="refreshing-dot"></span>
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Refreshing…' },
})
</script>

<style scoped>
.refreshing-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.6);
  flex-shrink: 0;
}
.refreshing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fc4c02;
  animation: refreshing-pulse 0.9s ease-in-out infinite;
}
@keyframes refreshing-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
}
@media (prefers-reduced-motion: reduce) {
  .refreshing-dot { animation: none; }
}
</style>
