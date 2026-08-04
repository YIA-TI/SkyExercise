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
/* ── Bottom tab bar: mobile default ── */
.m-tabbar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 36px);
  max-width: 460px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
  border-radius: 22px;
  background: rgba(17, 18, 20, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px -14px rgba(0, 0, 0, 0.45);
  z-index: 20;
}

.m-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 15px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: -0.1px;
  transition: color 0.2s ease, background 0.2s ease;
}

.m-tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.m-tab--active {
  color: #ffffff;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

/* ── Desktop ≥ 768px: sidebar kiri ── */
@media (min-width: 768px) {
  .m-tabbar {
    /* Reset bottom pill */
    bottom: auto;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 72px;
    max-width: 72px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 10px 8px;
    border-radius: 22px;
  }

  .m-tab {
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 4px;
    border-radius: 14px;
    gap: 4px;
    font-size: 9.5px;
  }
}

/* ── Desktop lebar ≥ 1024px: sidebar sedikit lebih lebar ── */
@media (min-width: 1024px) {
  .m-tabbar {
    left: 24px;
    width: 80px;
    max-width: 80px;
    padding: 12px 10px;
  }

  .m-tab {
    font-size: 10px;
    padding: 11px 4px;
  }
}
</style>
