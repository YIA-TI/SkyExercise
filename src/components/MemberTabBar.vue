<template>
<nav class="m-tabbar">
  <RouterLink to="/home" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    <span>Beranda</span>
  </RouterLink>
  <RouterLink to="/latihan" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
    <span>Latihan</span>
  </RouterLink>
  <RouterLink to="/peringkat" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 20 22 16 18 12"/><line x1="2" y1="16" x2="22" y2="16"/><polyline points="6 4 2 8 6 12"/><line x1="22" y1="8" x2="2" y2="8"/></svg>
    <span>Peringkat</span>
  </RouterLink>
  <RouterLink to="/profil" class="m-tab" active-class="m-tab--active">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    <span>Profil</span>
  </RouterLink>
</nav>
</template>

<script setup></script>

<style>
/* Style .m-tabbar/.m-tab hidup di mobile-ui.css (dipakai bareng AdminTabBar) —
   di-@import di sini supaya ikut ke chunk CSS komponen ini sendiri saat
   di-lazy-load per rute (jangan andalkan chunk lain kebetulan memuatnya). */
@import '../assets/mobile-ui.css';
</style>
