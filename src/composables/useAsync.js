// src/composables/useAsync.js
// Hook data generik: bungkus fetch async jadi reaktif { data, loading, error, refresh }.
// realtimeTables (opsional): daftar nama tabel Postgres — kalau diisi, langganan Supabase
// Realtime dibuka saat mount, dan tiap ada perubahan (insert/update/delete) di salah satu
// tabel itu, `refresh()` dipanggil ulang otomatis (debounce ~600ms, supaya satu batch
// sinkron Strava yang insert banyak baris cuma memicu satu refetch, bukan puluhan).
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../lib/supabase.js'

let channelSeq = 0

export function useAsync(runner, deps = [], realtimeTables = []) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)
  let seq = 0

  async function refresh() {
    const id = ++seq
    loading.value = true
    error.value = null
    try {
      const result = await runner()
      if (id === seq) data.value = result
    } catch (e) {
      if (id === seq) error.value = e
    } finally {
      if (id === seq) loading.value = false
    }
  }

  onMounted(refresh)
  if (deps.length) watch(deps, refresh)

  if (realtimeTables.length) {
    let debounceTimer = null
    const channel = supabase.channel(`useAsync-${++channelSeq}`)
    realtimeTables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(refresh, 600)
      })
    })
    channel.subscribe()

    onUnmounted(() => {
      clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    })
  }

  return { data, loading, error, refresh }
}
