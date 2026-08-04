<template>
<div class="cb">
  <div class="cb-card">
    <div v-if="status === 'loading'" class="cb-spin" aria-hidden="true"></div>
    <div v-else-if="status === 'error'" class="cb-ic cb-ic--err">!</div>
    <p class="cb-title">{{ message }}</p>
    <button v-if="status === 'error'" class="cb-btn" type="button" @click="kembali">
      Kembali ke Masuk
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
const message = ref('Menghubungkan ke Strava…')

function kembali() { router.replace('/signin') }

onMounted(async () => {
  const code = route.query.code
  const errParam = route.query.error

  if (errParam || !code) {
    status.value = 'error'
    message.value = 'Otorisasi Strava dibatalkan.'
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
    message.value = 'Menyinkronkan riwayat aktivitas…'
    try {
      await supabase.functions.invoke('strava-sync', { body: { athlete_id: data.athlete_id } })
    } catch (syncErr) {
      console.error('Auto-sync gagal:', syncErr)
    }

    await refreshStravaStatus()
    router.replace('/home')
  } catch (e) {
    status.value = 'error'
    message.value = 'Gagal menghubungkan: ' + (e?.message || e)
  }
})
</script>

<style scoped>
.cb {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f5f1ec;
  font-family: "Manrope", "Barlow", system-ui, sans-serif;
}
.cb-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
  background: #fff;
  border-radius: 24px;
  padding: 40px 28px;
  box-shadow: 0 30px 60px -24px rgba(28, 25, 23, 0.35);
}
.cb-spin {
  width: 44px; height: 44px; margin: 0 auto 18px;
  border-radius: 50%;
  border: 4px solid #ffe3cf;
  border-top-color: #fc4c02;
  animation: cb-rot 0.8s linear infinite;
}
@keyframes cb-rot { to { transform: rotate(360deg); } }
.cb-ic {
  width: 44px; height: 44px; margin: 0 auto 18px;
  border-radius: 50%; display: grid; place-content: center;
  font-size: 22px; font-weight: 800; color: #fff;
}
.cb-ic--err { background: #ef4444; }
.cb-title { margin: 0; font-size: 15px; font-weight: 700; color: #1c1917; }
.cb-btn {
  margin-top: 18px; border: none; cursor: pointer; font-family: inherit;
  font-size: 14px; font-weight: 700; color: #fff; padding: 12px 20px; border-radius: 14px;
  background: #fc4c02;
}
</style>
