<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { authState } from './store/auth.js'
import { bodyMetricsModalState } from './store/bodyMetricsModal.js'
import ToastHost from './components/ToastHost.vue'
import MemberTabBar from './components/MemberTabBar.vue'
import AdminTabBar from './components/AdminTabBar.vue'

// Modal jarang tampil (cuma isi awal / dibuka manual) — muat lazy, jangan ikut bundle awal.
const BodyMetricsModal = defineAsyncComponent(() => import('./components/BodyMetricsModal.vue'))

// Tab bar dirender di sini (bukan per-screen) supaya TIDAK ikut ter-animasi oleh
// transisi pindah halaman di bawah — nav bar harus terasa statis/persisten.
const route = useRoute()
const showTabBar = computed(() => !route.meta.hideTabBar && route.meta.requiresAuth)

// Jangan tampilkan modal isi data tubuh di atas splash (Welcome Back/Good Bye) —
// baru muncul setelah splash selesai & mendarat di layar sungguhan (mis. Home).
const showBodyMetricsModal = computed(() =>
  authState.userRole === 'anggota' &&
  !route.meta.isSplash &&
  ((!authState.loading && authState.needsBodyMetrics) || bodyMetricsModalState.open),
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in" type="transition">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <MemberTabBar v-if="authState.userRole === 'anggota' && showTabBar" />
  <AdminTabBar v-if="authState.userRole === 'admin' && showTabBar" />
  <BodyMetricsModal v-if="showBodyMetricsModal" />
  <ToastHost />
</template>

<style scoped>
/* App root — RouterView mengisi seluruh layar */

/* Transisi pindah halaman — fade + naik tipis (mode="out-in": layar lama
   selesai keluar dulu sebelum layar baru masuk, hindari overlap layout). */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.page-leave-to {
  opacity: 0;
}
</style>
