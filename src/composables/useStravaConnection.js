// src/composables/useStravaConnection.js
// Hook koneksi Strava: status + aksi connect/disconnect/sync.
import { onMounted } from 'vue'
import {
  stravaState,
  connectStrava,
  disconnectStrava,
  syncStrava,
  refreshStravaStatus,
} from '../store/strava.js'

export function useStravaConnection({ autoRefresh = true } = {}) {
  if (autoRefresh) onMounted(() => { refreshStravaStatus() })
  return {
    strava: stravaState, // reactive readonly: connected, lastSynced, loading
    connect: connectStrava,
    disconnect: disconnectStrava,
    sync: syncStrava,
    refresh: refreshStravaStatus,
  }
}
