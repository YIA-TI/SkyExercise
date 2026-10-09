<template>
<div class="cb">
  <div class="cb-card">
    <div v-if="status === 'loading'" class="cb-spin" aria-hidden="true"></div>
    <div v-else-if="status === 'error'" class="cb-ic cb-ic--err">!</div>
    <p class="cb-title">{{ message }}</p>
    <button v-if="status === 'error'" class="cb-btn" type="button" @click="kembali">
      Back to Sign In
    </button>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { reloadAuth } from '../store/auth.js'
import { refreshStravaStatus } from '../store/strava.js'

const route = useRoute()
const router = useRouter()
const status = ref('loading')
const message = ref('Connecting to Strava…')

function kembali() { router.replace('/signin') }

onMounted(async () => {
  const code = route.query.code
  const errParam = route.query.error

  if (errParam || !code) {
    status.value = 'error'
    message.value = 'Strava authorization was canceled.'
    return
  }

  try {
    // 1. Tukar code → provisi user + kredensial (Edge Function).
    const { data, error } = await supabase.functions.invoke('strava-oauth', { body: { code } })
    if (error) throw error
    if (data?.error) throw new Error(data.error)

    // 2. Bangun sesi Supabase via magic-link token.
    const { error: vErr } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash,
      type: 'magiclink',
    })
    if (vErr) throw vErr

    // 3. Segarkan state auth + koneksi.
    await reloadAuth()

    // 4. Backfill riwayat aktivitas (sekali, otomatis) — tidak fatal bila gagal,
    //    peserta tetap bisa lanjut & sinkron manual belakangan.
    message.value = 'Syncing activity history…'
    try {
      await supabase.functions.invoke('strava-sync', { body: { athlete_id: data.athlete_id } })
    } catch (syncErr) {
      console.error('Auto-sync failed:', syncErr)
    }

    await refreshStravaStatus()
    router.replace('/welcome-back')
  } catch (e) {
    status.value = 'error'
    message.value = 'Failed to connect: ' + (e?.message || e)
  }
})
</script>

<style scoped>
/* Tampilan: latar & kartu senada dengan aplikasi (perilaku tidak berubah) */
.cb {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: "Barlow", system-ui, sans-serif;
  background-image:
    radial-gradient(520px 320px at 100% -10%, rgba(59, 130, 246, 0.14), transparent 62%),
    radial-gradient(480px 360px at -10% 110%, rgba(96, 165, 250, 0.12), transparent 60%),
    linear-gradient(160deg, #ffffff 0%, #eff6ff 55%, #dbeafe 100%);
  background-color: #eff6ff;
}
.cb-card {
  position: relative;
  width: 100%;
  max-width: 340px;
  text-align: center;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 24px;
  padding: 36px 26px 30px;
  box-shadow: 0 30px 60px -28px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.cb-card::before {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #2563eb 35%, #60a5fa 65%, transparent);
}
.cb-spin {
  width: 52px; height: 52px; margin: 0 auto 20px;
  border-radius: 50%;
  border: 4px solid rgba(37, 99, 235, 0.14);
  border-top-color: #2563eb;
  box-shadow: 0 0 22px -4px rgba(37, 99, 235, 0.3);
  animation: cb-rot 0.8s linear infinite;
}
@keyframes cb-rot { to { transform: rotate(360deg); } }
.cb-ic {
  width: 52px; height: 52px; margin: 0 auto 20px;
  border-radius: 16px; display: grid; place-content: center;
  font-size: 24px; font-weight: 800; color: #fff;
}
.cb-ic--err {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
}
.cb-title { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4; }
.cb-btn {
  margin-top: 22px; border: none; cursor: pointer; font-family: inherit;
  font-size: 14px; font-weight: 700; color: #fff; padding: 12px 22px; border-radius: 14px;
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 14px 24px -12px rgba(37, 99, 235, 0.5);
  transition: transform 0.15s ease;
}
.cb-btn:hover { transform: scale(1.02); }
</style>
