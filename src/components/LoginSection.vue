<template>
<div class="login-aeroguard">
  <div class="main-content">
    <div class="container">

      <!-- Branding -->
      <div class="branding-container">
        <div class="background">
          <div class="overlay-shadow"></div>
          <div class="icon-wrapper">
            <!-- Ikon pesawat SVG inline -->
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
        </div>
        <div class="heading">
          <div class="text-wrapper">AeroGuard Monitor</div>
        </div>
        <div class="div-wrapper">
          <div class="text">ARFF COMMAND &amp; TRAINING</div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <div class="login-card-shadow"></div>
        <div class="div">

          <!-- Header teks -->
          <div class="container-2">
            <div class="div-wrapper">
              <div class="text-2">Masuk Komandan</div>
            </div>
            <div class="div-wrapper">
              <p class="p">Akses pemantauan latihan ARFF yang aman</p>
            </div>
          </div>

          <!-- Form -->
          <form class="form">

            <!-- Field Email -->
            <div class="container-3">
              <div class="label">
                <label class="text-3" for="input-1">Email Resmi</label>
              </div>
              <div class="container-4">
                <div class="input-field-wrapper">
                  <span class="field-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="input-1"
                    class="field-input"
                    placeholder="commander@angkasapura.co.id"
                    type="email"
                  />
                </div>
              </div>
            </div>

            <!-- Field Password -->
            <div class="container-3">
              <div class="label">
                <label class="text-3" for="input-2">Kata Sandi</label>
              </div>
              <div class="container-4">
                <div class="input-field-wrapper">
                  <span class="field-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="input-2"
                    class="field-input"
                    placeholder="••••••••"
                    type="password"
                  />
                  <button class="toggle-password" type="button" aria-label="Tampilkan kata sandi">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Remember & Lupa -->
            <div class="container-7">
              <label class="div-2">
                <input class="input-2" type="checkbox" />
                <div class="div-3">
                  <div class="text-4">Ingat perangkat</div>
                </div>
              </label>
              <div class="div-3">
                <button class="text-5" type="button">Lupa akses?</button>
              </div>
            </div>

            <!-- Submit Button — Mock Login Admin -->
            <button class="button-2" type="button" @click="handleLoginAdmin">
              <div class="button-shadow"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <div class="text-6">Masuk sebagai Admin</div>
            </button>

          </form>

          <!-- Divider Integrasi -->
          <div class="container-8">
            <div class="horizontal-divider"></div>
            <div class="margin">
              <div class="text-7">INTEGRASI PELATIHAN</div>
            </div>
            <div class="horizontal-divider-2"></div>
          </div>

          <!-- Tombol Strava — Mock Login Anggota -->
          <button class="button-3" type="button" @click="handleLoginAnggota">
            <span class="strava-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
            </span>
            <div class="text-8">Login sebagai Anggota (Strava)</div>
          </button>

        </div>

        <!-- Link bawah -->
        <div class="div-wrapper" style="margin-top: 16px;">
          <p class="butuh-akses-khusus">
            <span class="span">Butuh akses khusus?</span>
            <span class="text-wrapper-2">&nbsp;</span>
            <button class="text-wrapper-3" type="button">Hubungi Komando Pangkalan</button>
          </p>
        </div>

      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container-9">
      <div class="container-10">
        <div class="div-2">
          <div class="background-2">
            <!-- Ikon logo kecil -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#414750">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
          <div class="div-3">
            <p class="text-3-footer">Divisi ARFF PT Angkasa Pura</p>
          </div>
        </div>
        <div class="vertical-divider"></div>
        <div class="div-3">
          <div class="text-9">Versi Sistem 4.2.0-STABLE</div>
        </div>
      </div>
      <nav class="nav">
        <button class="link" type="button">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#414750" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <div class="text-10">Bantuan</div>
        </button>
        <button class="link" type="button">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#414750" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <div class="text-10">Protokol Privasi</div>
        </button>
        <button class="link" type="button">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#414750" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </span>
          <div class="text-10">Dokumentasi</div>
        </button>
      </nav>
    </div>
  </footer>

</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { loginAsAdmin, loginAsAnggota } from '../store/auth.js'

const router = useRouter()

function handleLoginAdmin() {
  loginAsAdmin()
  router.push('/admin')
}

function handleLoginAnggota() {
  loginAsAnggota()
  router.push('/anggota')
}
</script>

<style>
/* ========== ROOT LAYOUT ========== */
.login-aeroguard {
  align-items: flex-start;
  background: linear-gradient(
    0deg,
    rgba(248, 249, 250, 1) 0%,
    rgba(248, 249, 250, 1) 100%
  );
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  font-family: "Inter", Helvetica, sans-serif;
}

.login-aeroguard .main-content {
  align-self: stretch;
  background: linear-gradient(
    122deg,
    rgba(255, 128, 43, 1) 0%,
    rgba(219, 208, 200, 1) 100%
  );
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
  width: 100%;
}

/* ========== CENTER COLUMN ========== */
.login-aeroguard .container {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 440px;
}

/* ========== BRANDING ========== */
.login-aeroguard .branding-container {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
  position: relative;
  width: 100%;
}

.login-aeroguard .background {
  align-items: center;
  background-color: #003e6f;
  border-radius: 8px;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  padding: 14px 18px;
  position: relative;
  width: 64px;
  height: 64px;
  box-sizing: border-box;
}

.login-aeroguard .overlay-shadow {
  background-color: #ffffff01;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -4px #0000001a,
    0 10px 15px -3px #0000001a;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  pointer-events: none;
}

.login-aeroguard .icon-wrapper {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
}

.login-aeroguard .icon {
  height: 28px;
  width: 28px;
}

.login-aeroguard .heading {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 12px 0 0;
  position: relative;
  width: 100%;
}

.login-aeroguard .text-wrapper {
  -webkit-text-stroke: 1px #00000026;
  color: #ffffff;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.8px;
  line-height: 40px;
  text-align: center;
}

.login-aeroguard .div-wrapper {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.login-aeroguard .text {
  color: #414750;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1.4px;
  line-height: 20px;
  text-align: center;
}

/* ========== LOGIN CARD ========== */
.login-aeroguard .login-card {
  -webkit-backdrop-filter: blur(4px) brightness(100%);
  align-items: flex-start;
  align-self: stretch;
  backdrop-filter: blur(4px) brightness(100%);
  background-color: #fffffff2;
  border: 1px solid #c1c7d2;
  border-radius: 8px;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 40px 32px 32px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.login-aeroguard .login-card-shadow {
  background-color: #ffffff01;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px #00000040;
  height: calc(100% - 8px);
  left: 0;
  position: absolute;
  top: 8px;
  width: 100%;
  pointer-events: none;
}

.login-aeroguard .div {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 24px;
  position: relative;
  width: 100%;
}

/* ========== HEADER TEXT ========== */
.login-aeroguard .container-2 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
  position: relative;
  width: 100%;
}

.login-aeroguard .text-2 {
  color: #191c1d;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 32px;
}

.login-aeroguard .p {
  color: #414750;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  margin: 0;
}

/* ========== FORM ========== */
.login-aeroguard .form {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 16px;
  position: relative;
  width: 100%;
}

.login-aeroguard .container-3 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 6px;
  position: relative;
  width: 100%;
}

.login-aeroguard .label {
  align-items: flex-start;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.login-aeroguard .text-3 {
  color: #414750;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.7px;
  line-height: 20px;
}

.login-aeroguard .container-4 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

/* ========== INPUT FIELD (dengan ikon kiri) ========== */
.login-aeroguard .input-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  align-self: stretch;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #c1c7d2;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.login-aeroguard .input-field-wrapper:focus-within {
  border-color: #003e6f;
  box-shadow: 0 0 0 3px rgba(0, 62, 111, 0.1);
}

.login-aeroguard .field-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 14px;
  flex-shrink: 0;
}

.login-aeroguard .field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #191c1d;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
  padding: 14px 12px;
  width: 100%;
  box-sizing: border-box;
}

.login-aeroguard .field-input::placeholder {
  color: #a0aec0;
}

/* Tombol show/hide password -->*/
.login-aeroguard .toggle-password {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 14px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.login-aeroguard .toggle-password:hover {
  opacity: 1;
}

/* ========== REMEMBER & FORGOT ========== */
.login-aeroguard .container-7 {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  padding: 4px 0;
  position: relative;
  width: 100%;
}

.login-aeroguard .div-2 {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.login-aeroguard .input-2 {
  appearance: none;
  -webkit-appearance: none;
  background-color: #ffffff;
  border: 1px solid #c1c7d2;
  border-radius: 2px;
  cursor: pointer;
  height: 16px;
  margin: 0;
  position: relative;
  width: 16px;
  flex-shrink: 0;
  transition: background-color 0.15s, border-color 0.15s;
}

.login-aeroguard .input-2:checked {
  background-color: #003e6f;
  border-color: #003e6f;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z' fill='white'/%3E%3C/svg%3E");
  background-size: 12px;
  background-repeat: no-repeat;
  background-position: center;
}

.login-aeroguard .div-3 {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
}

.login-aeroguard .text-4 {
  color: #414750;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
}

.login-aeroguard .text-5 {
  align-items: center;
  background: none;
  border: none;
  color: #003e6f;
  cursor: pointer;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.7px;
  line-height: 20px;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.login-aeroguard .text-5:hover {
  color: #002d50;
}

/* ========== SUBMIT BUTTON ========== */
.login-aeroguard .button-2 {
  all: unset;
  align-items: center;
  align-self: stretch;
  background-color: #003e6f;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  justify-content: center;
  padding: 14px 0;
  position: relative;
  width: 100%;
  transition: background-color 0.2s, transform 0.1s;
}

.login-aeroguard .button-2:hover {
  background-color: #002d50;
}

.login-aeroguard .button-2:active {
  transform: scale(0.99);
}

.login-aeroguard .button-shadow {
  background-color: #ffffff01;
  border-radius: 4px;
  box-shadow:
    0 2px 4px -2px #0000001a,
    0 4px 6px -1px #0000001a;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  pointer-events: none;
}

.login-aeroguard .text-6 {
  color: #ffffff;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 27px;
  text-align: center;
}

/* ========== DIVIDER ========== */
.login-aeroguard .container-8 {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  padding: 8px 0;
  position: relative;
  width: 100%;
  gap: 0;
}

.login-aeroguard .horizontal-divider,
.login-aeroguard .horizontal-divider-2 {
  flex: 1;
  border: none;
  border-top: 1px solid #c1c7d2;
  height: 1px;
}

.login-aeroguard .margin {
  align-items: flex-start;
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 0 16px;
  position: relative;
}

.login-aeroguard .text-7 {
  color: #727781;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1.2px;
  line-height: 16px;
  white-space: nowrap;
}

/* ========== STRAVA BUTTON ========== */
.login-aeroguard .button-3 {
  all: unset;
  align-items: center;
  align-self: stretch;
  background-color: #fc642d;
  border-radius: 4px;
  box-shadow: 0 1px 2px #0000000d;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  justify-content: center;
  padding: 12px 0;
  position: relative;
  width: 100%;
  transition: background-color 0.2s;
}

.login-aeroguard .button-3:hover {
  background-color: #e5571f;
}

.login-aeroguard .strava-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.login-aeroguard .text-8 {
  color: #ffffff;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  text-align: center;
}

/* ========== AKSES KHUSUS ========== */
.login-aeroguard .butuh-akses-khusus {
  color: transparent;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  text-align: center;
  white-space: nowrap;
  margin: 0;
}

.login-aeroguard .span {
  color: #1a1b1d;
}

.login-aeroguard .text-wrapper-2 {
  color: #414750;
}

.login-aeroguard .text-wrapper-3 {
  background: none;
  border: none;
  color: #a72d22;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.login-aeroguard .text-wrapper-3:hover {
  color: #8a2117;
}

/* ========== FOOTER ========== */
.login-aeroguard .footer {
  -webkit-backdrop-filter: blur(2px) brightness(100%);
  align-items: flex-start;
  align-self: stretch;
  backdrop-filter: blur(2px) brightness(100%);
  background-color: #ffffff80;
  border-top: 1px solid #c1c7d2;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 24px 16px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.login-aeroguard .container-9 {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  max-width: 1440px;
  position: relative;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
}

.login-aeroguard .container-10 {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 16px;
  position: relative;
}

.login-aeroguard .background-2 {
  align-items: center;
  background-color: #e1e3e4;
  border-radius: 2px;
  display: flex;
  height: 32px;
  justify-content: center;
  position: relative;
  width: 32px;
}

.login-aeroguard .text-3-footer {
  color: #414750;
  font-family: "Inter", Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  line-height: 20px;
}

.login-aeroguard .vertical-divider {
  background-color: #c1c7d2;
  height: 16px;
  position: relative;
  width: 1px;
}

.login-aeroguard .text-9 {
  color: #727781;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  line-height: 16px;
  white-space: nowrap;
}

.login-aeroguard .nav {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 24px;
  position: relative;
}

.login-aeroguard .link {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 4px;
  padding: 0;
  position: relative;
  transition: opacity 0.2s;
}

.login-aeroguard .link:hover {
  opacity: 0.7;
}

.login-aeroguard .nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-aeroguard .text-10 {
  color: #414750;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  line-height: 16px;
  white-space: nowrap;
}
</style>