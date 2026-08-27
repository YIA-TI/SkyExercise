<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import { authState } from './store/auth.js'
import { bodyMetricsModalState } from './store/bodyMetricsModal.js'
import ToastHost from './components/ToastHost.vue'

// Modal jarang tampil (cuma isi awal / dibuka manual) — muat lazy, jangan ikut bundle awal.
const BodyMetricsModal = defineAsyncComponent(() => import('./components/BodyMetricsModal.vue'))

const showBodyMetricsModal = computed(() =>
  authState.userRole === 'anggota' &&
  ((!authState.loading && authState.needsBodyMetrics) || bodyMetricsModalState.open),
)
</script>

<template>
  <RouterView />
  <BodyMetricsModal v-if="showBodyMetricsModal" />
  <ToastHost />
</template>

<style scoped>
/* App root — RouterView mengisi seluruh layar */
</style>