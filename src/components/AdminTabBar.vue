<template>
<nav class="m-tabbar">
  <RouterLink to="/admin" class="m-tab" :class="{ 'm-tab--active': isMonitoring }">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    <span>Monitoring</span>
  </RouterLink>
  <RouterLink to="/admin/anggota" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    <span>Anggota</span>
  </RouterLink>
  <RouterLink to="/admin/peringkat" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 22 16 18 12"/><line x1="2" y1="16" x2="22" y2="16"/><polyline points="6 4 2 8 6 12"/><line x1="22" y1="8" x2="2" y2="8"/></svg>
    <span>Peringkat</span>
  </RouterLink>
  <RouterLink to="/admin/quests" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 15 8l6 .9-4.5 4.3L18 20l-6-3-6 3 1.5-6.8L3 8.9 9 8z"/></svg>
    <span>Quest</span>
  </RouterLink>
  <button class="m-tab" type="button" @click="handleLogout">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    <span>Keluar</span>
  </button>
</nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '../store/auth.js'

const route = useRoute()
const router = useRouter()

const isMonitoring = computed(() => route.path === '/admin')

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style>
/* Style .m-tabbar/.m-tab hidup di mobile-ui.css (dipakai bareng MemberTabBar) —
   di-@import di sini supaya ikut ke chunk CSS komponen ini sendiri saat
   di-lazy-load per rute (jangan andalkan chunk lain kebetulan memuatnya). */
@import '../assets/mobile-ui.css';
</style>
