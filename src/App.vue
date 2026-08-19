<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { authState } from './store/auth.js'
import { bodyMetricsModalState } from './store/bodyMetricsModal.js'
import BodyMetricsModal from './components/BodyMetricsModal.vue'

const showBodyMetricsModal = computed(() =>
  authState.userRole === 'anggota' &&
  ((!authState.loading && authState.needsBodyMetrics) || bodyMetricsModalState.open),
)
</script>

<template>
  <RouterView />
  <BodyMetricsModal v-if="showBodyMetricsModal" />
</template>

<style scoped>
/* App root — RouterView mengisi seluruh layar */
</style>