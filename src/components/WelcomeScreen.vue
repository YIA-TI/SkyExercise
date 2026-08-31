<template>
<div class="aeroguard-welcome">
  <div class="hero-overlay"></div>

  <div class="hero-content">
        <!-- Badge dengan ikon pesawat AeroGuard -->
        <div class="badge">
          <svg class="badge-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.4c-.66 0-1.15.72-1.15 1.95v5.03L3.4 13.86a.92.92 0 0 0-.4.77v1.02c0 .3.29.52.58.44l7.27-2.02v4.35l-1.73 1.24a.52.52 0 0 0-.22.42v.98c0 .28.28.48.55.4L12 20.98l2.55.72c.27.08.55-.12.55-.4v-.98a.52.52 0 0 0-.22-.42l-1.73-1.24v-4.35l7.27 2.02c.29.08.58-.14.58-.44v-1.02a.92.92 0 0 0-.4-.77l-7.45-4.48V4.35c0-1.23-.49-1.95-1.15-1.95Z"
              fill="url(#welcomeGrad)"
              stroke="rgba(255,255,255,0.9)"
              stroke-width="0.5"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient id="welcomeGrad" x1="12" y1="2.4" x2="12" y2="21.7" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ffffff" />
                <stop offset="1" stop-color="#ccfbf1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 v-if="isLoggedIn" class="title">Selamat Datang,<br />{{ userName }}</h1>
        <h1 v-else class="title">Selamat Datang di<br />AeroGuard Monitor</h1>

        <p class="subtitle">
          {{ isLoggedIn ? 'Lanjutkan pemantauan latihan fisik Anda' : 'Asisten pemantauan latihan fisik ARFF Anda' }}
        </p>

        <button class="cta" type="button" @click="handleCta">
          <span>{{ isLoggedIn ? 'Lanjutkan' : 'Mulai' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

    <p v-if="!isLoggedIn" class="signin-hint">
      Sudah punya akun?
      <button type="button" @click="goSignIn">Masuk</button>
    </p>
  </div>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'

const router = useRouter()

const isLoggedIn = computed(() => authState.isLoggedIn)
const userName = computed(() => authState.userName)

// Tujuan dashboard sesuai role setelah terhubung (mis. via Strava)
const dashboardPath = computed(() =>
  authState.userRole === 'admin' ? '/admin' : '/home',
)

function handleCta() {
  router.push(isLoggedIn.value ? dashboardPath.value : '/signin')
}

function goSignIn() {
  router.push('/signin')
}
</script>

<style>
/* ========== WELCOME SCREEN ========== */
.aeroguard-welcome {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  font-family: "Chakra Petch", system-ui, sans-serif;
  /* Foto aktivitas fisik — latihan di gym, seperti pada desain Figma */
  background:
    #00294a
    url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80")
    center / cover no-repeat;
}

.aeroguard-welcome .hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 80% at 50% 40%, rgba(0, 20, 40, 0.15) 0%, rgba(0, 20, 40, 0.55) 70%),
    linear-gradient(180deg, rgba(0, 20, 40, 0.45) 0%, rgba(0, 20, 40, 0.65) 100%);
  pointer-events: none;
}

.aeroguard-welcome .hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 28px;
  box-sizing: border-box;
}

.aeroguard-welcome .badge {
  display: grid;
  place-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  margin-bottom: 20px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 24px -10px rgba(252, 100, 45, 0.7);
}

.aeroguard-welcome .badge-icon {
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 2px 3px rgba(0, 20, 40, 0.35));
}

.aeroguard-welcome .title {
  margin: 0;
  color: #ffffff;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1px;
  text-shadow: 0 2px 12px rgba(0, 20, 40, 0.4);
}

.aeroguard-welcome .subtitle {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.2px;
  text-shadow: 0 1px 8px rgba(0, 20, 40, 0.4);
}

.aeroguard-welcome .cta {
  margin-top: 28px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 20px 28px -16px rgba(252, 100, 45, 0.9);
  transition: all 0.2s ease-in-out;
}

.aeroguard-welcome .cta:hover {
  transform: scale(1.03);
}

.aeroguard-welcome .cta:active {
  transform: scale(0.97);
}

.aeroguard-welcome .signin-hint {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  letter-spacing: -0.2px;
  text-shadow: 0 1px 8px rgba(0, 20, 40, 0.4);
}

.aeroguard-welcome .signin-hint button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #ff914d;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
