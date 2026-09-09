<template>
<div class="aeroguard-signin">
  <div class="phone-frame">
    <!-- Header dengan badge ikon AeroGuard -->
    <div class="top-visual">
      <div class="badge">
        <svg class="badge-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.4c-.66 0-1.15.72-1.15 1.95v5.03L3.4 13.86a.92.92 0 0 0-.4.77v1.02c0 .3.29.52.58.44l7.27-2.02v4.35l-1.73 1.24a.52.52 0 0 0-.22.42v.98c0 .28.28.48.55.4L12 20.98l2.55.72c.27.08.55-.12.55-.4v-.98a.52.52 0 0 0-.22-.42l-1.73-1.24v-4.35l7.27 2.02c.29.08.58-.14.58-.44v-1.02a.92.92 0 0 0-.4-.77l-7.45-4.48V4.35c0-1.23-.49-1.95-1.15-1.95Z"
            fill="url(#signinGrad)"
            stroke="rgba(255,255,255,0.9)"
            stroke-width="0.5"
            stroke-linejoin="round"
          />
          <defs>
            <linearGradient id="signinGrad" x1="12" y1="2.4" x2="12" y2="21.7" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff" />
              <stop offset="1" stop-color="#ccfbf1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="title">Masuk ke AeroGuard</h1>
      <p class="subtitle">Personalisasi pemantauan latihan Anda</p>
    </div>

    <form class="form" @submit.prevent="handleSignIn">
      <!-- Email -->
      <label class="field-label" for="signin-email">Alamat Email</label>
      <div class="input-wrap">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <input
          id="signin-email"
          v-model="email"
          class="input"
          type="email"
          name="email"
          placeholder="nama@email.com"
          autocomplete="username"
        />
      </div>

      <!-- Kata Sandi -->
      <label class="field-label" for="signin-password">Kata Sandi</label>
      <div class="input-wrap">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <input
          id="signin-password"
          v-model="password"
          class="input"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="Kata sandi"
          autocomplete="current-password"
        />
        <button
          class="toggle-eye"
          type="button"
          :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
          @click="showPassword = !showPassword"
        >
          <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <p v-if="errorMsg" class="signin-error">{{ errorMsg }}</p>

      <button class="submit" type="submit" :disabled="submitting">
        <svg v-if="submitting" class="signin-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        <span>{{ submitting ? 'Memproses…' : 'Masuk' }}</span>
        <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>

    <!-- Login sosial — Strava sebagai integrasi utama -->
    <div class="social-row">
      <button class="social-button strava" type="button" aria-label="Masuk dengan Strava" @click="handleStrava">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      </button>
    </div>

    <div class="links">
      <p>
        Belum punya akun?
        <button type="button">Daftar</button>
      </p>
      <button class="forgot" type="button">Lupa Kata Sandi?</button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInAdmin } from '../store/auth.js'
import { connectStrava } from '../store/strava.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const submitting = ref(false)

// Login admin (email/password Supabase Auth).
async function handleSignIn() {
  if (submitting.value) return
  errorMsg.value = ''
  submitting.value = true
  try {
    await signInAdmin(email.value, password.value)
    router.push('/welcome-back')
  } catch (_e) {
    errorMsg.value = 'Email atau kata sandi salah.'
  } finally {
    submitting.value = false
  }
}

// Peserta masuk lewat Strava (redirect OAuth) — cek kuota dulu.
async function handleStrava() {
  errorMsg.value = ''
  const res = await connectStrava()
  if (!res.ok) {
    errorMsg.value = `Kuota koneksi Strava sedang penuh (${res.used}/${res.max}). Coba lagi nanti — kuota akan ditambah setelah app disetujui Strava.`
  }
}

</script>

<style>
/* ========== SIGN IN SCREEN (Phase 3a: dark orange+violet glassmorphism,
   diselaraskan dgn .mui di mobile-ui.css) ========== */
.aeroguard-signin {
  position: relative;
  z-index: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  /* Aksen latar sama dgn .mui (mobile-ui.css) — grain + glow oranye/violet +
     drift lambat, supaya login page senada dgn layar member/admin. */
  background-image:
    var(--grain),
    radial-gradient(820px 420px at 100% -8%, rgba(252, 76, 2, 0.28), transparent 62%),
    radial-gradient(760px 460px at -10% 108%, rgba(124, 58, 237, 0.30), transparent 58%),
    linear-gradient(160deg, #3b1a0a 0%, #4c1d95 45%, #1e1b4b 75%, #0f0a2e 100%);
  background-color: #0f0a2e;
  background-repeat: repeat, no-repeat, no-repeat, no-repeat;
  background-size: 180px 180px, auto, auto, cover;
  background-attachment: fixed;
  animation: bg-drift 18s ease-in-out infinite;
  font-family: "Barlow", system-ui, sans-serif;
}

/* Garis diagonal ganda + motif rute GPS — aksen sama dgn .mui::before/::after,
   lapisan terpisah supaya masing-masing berdenyut (pulse) sendiri. */
.aeroguard-signin::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(135deg, rgba(252, 76, 2, 0.12) 0, rgba(252, 76, 2, 0.12) 3px, transparent 3px, transparent 46px),
    repeating-linear-gradient(45deg, rgba(196, 181, 253, 0.08) 0, rgba(196, 181, 253, 0.08) 2px, transparent 2px, transparent 70px);
  animation: stripe-pulse 3s ease-in-out infinite;
}

.aeroguard-signin::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--route-line);
  background-repeat: no-repeat;
  background-size: 640px 640px;
  background-position: 110% 110%;
  animation: route-pulse 2.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .aeroguard-signin { animation: none; }
  .aeroguard-signin::before, .aeroguard-signin::after { animation: none; }
}

.aeroguard-signin .phone-frame {
  width: 100%;
  max-width: 390px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  padding: 40px 28px 32px;
  box-sizing: border-box;
}

.aeroguard-signin .top-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.aeroguard-signin .badge {
  display: grid;
  place-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 24px -10px rgba(252, 100, 45, 0.7);
}

.aeroguard-signin .badge-icon {
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 2px 3px rgba(0, 20, 40, 0.35));
}

.aeroguard-signin .title {
  margin: 18px 0 0;
  color: #F8FAFC;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.8px;
  line-height: 32px;
}

.aeroguard-signin .subtitle {
  margin: 8px 0 0;
  color: rgba(248, 250, 252, 0.65);
  font-size: 13.5px;
  line-height: 20px;
  letter-spacing: -0.2px;
}

.aeroguard-signin .form {
  margin-top: 28px;
}

.aeroguard-signin .field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: rgba(248, 250, 252, 0.85);
}

.aeroguard-signin .field-label:not(:first-child) {
  margin-top: 18px;
}

.aeroguard-signin .input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.aeroguard-signin .input-wrap:focus-within {
  background: rgba(255, 255, 255, 0.14);
  border-color: #fc4c02;
  box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.25);
}

.aeroguard-signin .input-icon {
  flex: 0 0 auto;
  color: rgba(248, 250, 252, 0.55);
}

.aeroguard-signin .input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-family: inherit;
  font-size: 15px;
  color: #F8FAFC;
}

.aeroguard-signin .input::placeholder {
  color: rgba(248, 250, 252, 0.4);
}

.aeroguard-signin .toggle-eye {
  flex: 0 0 auto;
  display: grid;
  place-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba(248, 250, 252, 0.55);
}

.aeroguard-signin .toggle-eye:hover {
  color: #F8FAFC;
}

.aeroguard-signin .submit {
  margin-top: 24px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 16px 32px -16px rgba(252, 76, 2, 0.6);
  transition: all 0.2s ease-in-out;
}

.aeroguard-signin .submit:hover {
  transform: scale(1.02);
}

.aeroguard-signin .submit:active {
  transform: scale(0.97);
}

.aeroguard-signin .submit:disabled {
  opacity: 0.7;
  cursor: default;
  transform: none;
}

.aeroguard-signin .signin-spin { animation: signin-spin 0.9s linear infinite; }
@keyframes signin-spin { to { transform: rotate(360deg); } }

.aeroguard-signin .signin-error {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(220, 38, 38, 0.18);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: #FCA5A5;
  font-size: 12.5px;
  font-weight: 600;
  text-align: center;
}

.aeroguard-signin .social-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 26px;
}

.aeroguard-signin .social-button {
  display: grid;
  place-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  color: #F8FAFC;
  transition: all 0.2s ease-in-out;
}

.aeroguard-signin .social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -12px rgba(0, 41, 74, 0.4);
}

.aeroguard-signin .social-button.strava {
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  border-color: transparent;
  color: #ffffff;
}

.aeroguard-signin .links {
  margin-top: 24px;
  text-align: center;
}

.aeroguard-signin .links p {
  margin: 0;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.65);
  letter-spacing: -0.2px;
}

.aeroguard-signin .links button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #FDBA74;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.aeroguard-signin .links .forgot {
  margin-top: 12px;
}
</style>
