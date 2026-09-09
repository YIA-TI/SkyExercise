<template>
<div class="aeroguard-welcome">
  <div ref="lottieContainer" class="splash-lottie" aria-hidden="true"></div>
  <div class="splash-greeting">
    <span class="splash-greeting-lead">{{ greetingLead }}</span>
    <span class="splash-greeting-main">{{ greetingMain }}</span>
  </div>
</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import lottie from 'lottie-web'
import { authState } from '../store/auth.js'
import splashAnimationRaw from '../assets/lottie/splash-welcome.json'

const APP_NAME = 'AeroGuard Monitor'

const router = useRouter()
const lottieContainer = ref(null)
let animInstance = null
let redirectTimer = null

const greetingLead = authState.isLoggedIn && authState.userName ? 'Welcome Back' : 'Welcome to'
const greetingMain = authState.isLoggedIn && authState.userName ? authState.userName : APP_NAME

// Layer teks asli ("Logo") pakai mode Glyphs — cuma huruf L/o/g yang benar-benar
// di-bake sebagai vector di file ini, jadi tak bisa diisi teks bebas (nama user
// dll akan hilang/kosong). Makanya layer itu dibuang, teks salam dirender di
// atasnya sebagai HTML biasa (lihat .splash-greeting) supaya benar-benar dinamis.
function withoutBakedLogoText(data) {
  const clone = JSON.parse(JSON.stringify(data))
  clone.layers = clone.layers.filter((l) => !(l.ty === 5 && l.nm === 'Logo'))
  return clone
}

function goNext() {
  const dashboardPath = authState.userRole === 'admin' ? '/admin' : '/home'
  router.replace(authState.isLoggedIn ? dashboardPath : '/signin')
}

onMounted(() => {
  animInstance = lottie.loadAnimation({
    container: lottieContainer.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: withoutBakedLogoText(splashAnimationRaw),
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
  })

  // Lanjut otomatis begitu animasi selesai (+ jeda singkat) — dengan fallback
  // timer kalau event 'complete' karena suatu hal tak pernah tertembak.
  animInstance.addEventListener('complete', () => {
    redirectTimer = setTimeout(goNext, 500)
  })
  redirectTimer = setTimeout(goNext, 4000)
})

onBeforeUnmount(() => {
  clearTimeout(redirectTimer)
  animInstance?.destroy()
})
</script>

<style>
/* ========== WELCOME / SPLASH SCREEN ========== */
.aeroguard-welcome {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1c1006; /* fallback gelap senada sebelum Lottie siap render */
}

.aeroguard-welcome .splash-lottie {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.aeroguard-welcome .splash-lottie svg {
  display: block;
}

/* Teks salam dinamis — Lottie "reckon" yg jadi acuan efek ternyata cuma logo
   statis (tanpa keyframe animasi apa pun di versi gratisnya, dicek langsung
   dari JSON-nya), jadi tak ada animasi asli yang bisa ditiru persis. Efek di
   bawah ini reveal buatan sendiri bergaya sama (fade + scale + stagger per
   baris), plus layer "Logo" Lottie tetap dibuang (lihat komentar di script)
   karena mode Glyphs-nya tak bisa diisi teks bebas. */
.aeroguard-welcome .splash-greeting {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 24px;
  max-width: 420px;
  text-align: center;
  font-family: "Chakra Petch", system-ui, sans-serif;
  color: #ffffff;
}

.aeroguard-welcome .splash-greeting-lead {
  font-size: clamp(18px, 4.5vw, 24px);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  opacity: 0;
  transform: translateY(16px) scale(0.9);
  animation: splash-greeting-in 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) 0.55s forwards;
}

.aeroguard-welcome .splash-greeting-main {
  font-size: clamp(34px, 10vw, 56px);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transform: translateY(20px) scale(0.85);
  animation: splash-greeting-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.85s forwards;
}

@keyframes splash-greeting-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
