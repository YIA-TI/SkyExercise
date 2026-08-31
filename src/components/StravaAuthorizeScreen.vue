<template>
<div class="strava-oauth">
  <div class="so-card">
    <div class="so-bar">
      <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span class="so-wordmark">STRAVA</span>
    </div>

    <div class="so-body">
      <div class="so-apps">
        <span class="so-app-ic so-app-ic--aero" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="26" height="26">
            <path
              d="M12 2.4c-.66 0-1.15.72-1.15 1.95v5.03L3.4 13.86a.92.92 0 0 0-.4.77v1.02c0 .3.29.52.58.44l7.27-2.02v4.35l-1.73 1.24a.52.52 0 0 0-.22.42v.98c0 .28.28.48.55.4L12 20.98l2.55.72c.27.08.55-.12.55-.4v-.98a.52.52 0 0 0-.22-.42l-1.73-1.24v-4.35l7.27 2.02c.29.08.58-.14.58-.44v-1.02a.92.92 0 0 0-.4-.77l-7.45-4.48V4.35c0-1.23-.49-1.95-1.15-1.95Z"
              fill="#ffffff"
            />
          </svg>
        </span>
        <svg class="so-link-ic" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span class="so-app-ic so-app-ic--strava" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </span>
      </div>

      <h1 class="so-title">AeroGuard ingin terhubung dengan Strava</h1>
      <p class="so-sub">Masuk sebagai <b>{{ authState.userName || 'Citra Dewi' }}</b></p>

      <ul class="so-perms">
        <li v-for="p in permissions" :key="p">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          {{ p }}
        </li>
      </ul>

      <p v-if="capFull" class="so-full">
        Kuota koneksi Strava sedang penuh ({{ capInfo.used }}/{{ capInfo.max }}). Coba lagi nanti — kuota akan ditambah setelah app disetujui Strava.
      </p>

      <div class="so-actions">
        <button class="so-cancel" type="button" :disabled="authorizing" @click="handleCancel">Batalkan</button>
        <button class="so-authorize" type="button" :disabled="authorizing || capFull" @click="handleAuthorize">
          {{ authorizing ? 'Menghubungkan…' : 'Otorisasi' }}
        </button>
      </div>

      <p class="so-note">Kamu bisa memutuskan koneksi ini kapan saja dari halaman Profil.</p>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { connectStrava, checkStravaCapacity } from '../store/strava.js'

const router = useRouter()
const authorizing = ref(false)
const capFull = ref(false)
const capInfo = ref({ used: 0, max: 10 })

const permissions = [
  'Lihat profil publik kamu (nama, foto, kota)',
  'Lihat data aktivitas lari & gym',
  'Lihat statistik dan pencapaian',
]

// Cek kuota begitu halaman dibuka, agar user langsung tahu sebelum klik.
onMounted(async () => {
  const cap = await checkStravaCapacity()
  capFull.value = !cap.available
  capInfo.value = { used: cap.used, max: cap.max }
})

function handleCancel() {
  router.back()
}

async function handleAuthorize() {
  if (authorizing.value || capFull.value) return
  authorizing.value = true
  // Redirect asli ke halaman otorisasi Strava (kembali ke /strava/callback).
  const res = await connectStrava()
  if (!res.ok) {
    authorizing.value = false
    capFull.value = true
    capInfo.value = { used: res.used, max: res.max }
  }
}
</script>

<style scoped>
.strava-oauth {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f1ec;
  font-family: "Chakra Petch", system-ui, sans-serif;
}

.so-card {
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 30px 60px -24px rgba(28, 25, 23, 0.35);
}

.so-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #fc4c02;
}

.so-wordmark {
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
}

.so-body {
  padding: 28px 26px 26px;
  text-align: center;
}

.so-apps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 20px;
}

.so-app-ic {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-content: center;
}

.so-app-ic--aero {
  background: linear-gradient(150deg, #0a5a97 0%, #003e6f 55%, #00294a 100%);
}

.so-app-ic--strava {
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
}

.so-link-ic { color: #a8a29e; }

.so-title {
  margin: 0;
  font-family: "Chakra Petch", system-ui, sans-serif;
  font-size: 19px;
  font-weight: 600;
  color: #1c1917;
  line-height: 26px;
}

.so-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: #57534e;
}

.so-perms {
  list-style: none;
  margin: 20px 0 0;
  padding: 16px;
  border-radius: 14px;
  background: #f5f1ec;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.so-full {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 17px;
  text-align: left;
}

.so-perms li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #292524;
  line-height: 18px;
}

.so-perms li svg { flex: 0 0 auto; margin-top: 2px; color: #059669; }

.so-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.so-cancel,
.so-authorize {
  flex: 1;
  border: none;
  cursor: pointer;
  padding: 13px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.so-cancel {
  background: #f5f1ec;
  color: #57534e;
}

.so-cancel:hover:not(:disabled) { background: #ece7e2; }

.so-authorize {
  color: #ffffff;
  background: #fc4c02;
  box-shadow: 0 14px 24px -12px rgba(252, 76, 2, 0.8);
}

.so-authorize:hover:not(:disabled) { transform: scale(1.02); }
.so-cancel:disabled,
.so-authorize:disabled { opacity: 0.6; cursor: default; }

.so-note {
  margin: 16px 0 0;
  font-size: 11.5px;
  color: #a8a29e;
  line-height: 16px;
}
</style>
