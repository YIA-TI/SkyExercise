<template>
<div class="aeroguard-welcome">
  <div class="splash-stage" aria-hidden="true">
    <span class="splash-ring"></span>
    <span class="splash-ring splash-ring--2"></span>
    <span class="splash-ring splash-ring--3"></span>
    <span class="splash-pad"></span>
    <span class="splash-trail"></span>
    <svg class="splash-badge-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V18l-2.5 2v1.5l3.5-1 3.5 1V20l-2.5-2v-4.5z" />
    </svg>
  </div>
  <div class="splash-greeting">
    <span class="splash-greeting-lead">{{ greetingLead }}</span>
    <span class="splash-greeting-main">{{ greetingMain }}</span>
  </div>
</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  greetingLead: { type: String, required: true },
  greetingMain: { type: String, required: true },
  nextPath: { type: String, required: true },
})

const router = useRouter()
let redirectTimer = null

function goNext() {
  router.replace(props.nextPath)
}

onMounted(() => {
  redirectTimer = setTimeout(goNext, 3200)
})

onBeforeUnmount(() => {
  clearTimeout(redirectTimer)
})
</script>

<style>
/* ========== WELCOME / SPLASH SCREEN — animasi "pesawat mendarat" ==========
   Buatan sendiri (CSS, bukan Lottie): badge pesawat terbang masuk & "mendarat"
   di tengah, disusul cincin kedatangan yang memudar, baru teks salam reveal.
   Senada dengan tema "Clean Sky" putih-biru di seluruh app. */
.aeroguard-welcome {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  background-image:
    radial-gradient(820px 420px at 100% -8%, rgba(59, 130, 246, 0.16), transparent 62%),
    radial-gradient(760px 460px at -10% 108%, rgba(96, 165, 250, 0.14), transparent 58%),
    linear-gradient(160deg, #ffffff 0%, #eff6ff 55%, #dbeafe 100%);
  background-color: #eff6ff;
}

.splash-stage {
  position: relative;
  width: 76px;
  height: 76px;
  display: grid;
  place-content: center;
}

.splash-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.32), transparent 70%);
  opacity: 0;
  animation: splash-ring-pulse 1.1s ease-out 0.75s;
}

.splash-ring--2 {
  animation: splash-ring-pulse 1.1s ease-out 1s;
}

.splash-ring--3 {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.26), transparent 70%);
  animation: splash-ring-pulse 0.9s ease-out 2.15s;
}

/* "Landing pad": kotak gradasi tempat pesawat mendarat — pesawatnya sendiri
   akan lepas & terbang pergi secara independen, pad ini cuma redup di tempat. */
.splash-pad {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(45deg, #2563eb 0%, #60a5fa 100%);
  box-shadow: 0 16px 32px -12px rgba(37, 99, 235, 0.5);
  opacity: 0;
  animation:
    splash-pad-arrive 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards,
    splash-pad-leave 0.5s ease-in 1.95s forwards;
}

.splash-trail {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.65), rgba(96, 165, 250, 0));
  opacity: 0;
  transform: translate(-50%, -50%) scaleY(0.4);
  animation: splash-trail-streak 1s cubic-bezier(0.3, 0, 0.4, 1) 2.15s forwards;
}

.splash-badge-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  color: #2563eb;
  filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.3));
  opacity: 0;
  animation:
    splash-plane-arrive 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards,
    splash-plane-depart 1.3s cubic-bezier(0.3, 0, 0.2, 1) 2.15s forwards;
}

@keyframes splash-pad-arrive {
  0% {
    opacity: 0;
    transform: translate(140px, -120px) rotate(35deg) scale(0.5);
  }
  65% {
    opacity: 1;
    transform: translate(-6px, 4px) rotate(-6deg) scale(1.06);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
}

@keyframes splash-pad-leave {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes splash-trail-streak {
  0% {
    opacity: 0;
    height: 10px;
    transform: translate(-50%, -50%) scaleY(0.4);
  }
  25% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    height: 160px;
    transform: translate(-30%, -170%) scaleY(1.8);
  }
}

@keyframes splash-plane-arrive {
  0% {
    opacity: 0;
    transform: translate(140px, -120px) rotate(35deg) scale(0.5);
  }
  65% {
    opacity: 1;
    transform: translate(-6px, 4px) rotate(-6deg) scale(1.06);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
}

/* Lepas landas lurus ke atas — tanpa rotasi/kemiringan, biar pesawatnya tetap
   tegak selama terbang (dulu ada rotate() yang bikin kesannya miring & patah). */
@keyframes splash-plane-depart {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  18% {
    opacity: 1;
    transform: translate(0, -28px) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translate(0, -420px) scale(0.32);
  }
}

@keyframes splash-ring-pulse {
  0% {
    opacity: 0.7;
    transform: scale(0.6);
  }
  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}

.splash-greeting {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 24px;
  max-width: 420px;
  text-align: center;
  font-family: "Barlow Condensed", system-ui, sans-serif;
  color: #0f172a;
}

.splash-greeting-lead {
  font-size: clamp(16px, 4vw, 20px);
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #2563eb;
  opacity: 0;
  transform: translateY(16px) scale(0.9);
  animation: splash-greeting-in 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) 0.9s forwards;
}

.splash-greeting-main {
  font-size: clamp(32px, 9vw, 48px);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: #0f172a;
  opacity: 0;
  transform: translateY(20px) scale(0.85);
  animation: splash-greeting-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1.15s forwards;
}

@keyframes splash-greeting-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-ring,
  .splash-trail {
    display: none;
  }
  .splash-pad,
  .splash-badge-icon,
  .splash-greeting-lead,
  .splash-greeting-main {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
