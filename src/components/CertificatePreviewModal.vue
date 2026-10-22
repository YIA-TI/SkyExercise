<template>
<div class="cp-modal-backdrop" @click.self="closeCertificatePreview">
  <div class="cp-modal mui-card" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
    <button class="cp-modal-close" type="button" aria-label="Close" @click="closeCertificatePreview">✕</button>
    <p id="cp-modal-title" class="cp-modal-title">Certificate Proof</p>

    <div v-if="loading" class="cp-modal-state">Loading…</div>
    <p v-else-if="errorMsg" class="gp-error">{{ errorMsg }}</p>
    <template v-else-if="signedUrl">
      <img v-if="!isPdf" :src="signedUrl" class="cp-modal-img" alt="Certificate proof" />
      <iframe v-else :src="signedUrl" class="cp-modal-pdf" title="Certificate proof"></iframe>
      <a :href="signedUrl" target="_blank" rel="noopener noreferrer" class="cp-modal-open-link">Open in new tab ↗</a>
    </template>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { certificatePreviewModalState, closeCertificatePreview } from '../store/certificatePreviewModal.js'
import { getCertificateSignedUrl } from '../services/profile.js'

const signedUrl = ref(null)
const loading = ref(false)
const errorMsg = ref('')

const isPdf = computed(() => (certificatePreviewModalState.path || '').toLowerCase().endsWith('.pdf'))

watch(
  () => certificatePreviewModalState.path,
  async (path) => {
    signedUrl.value = null
    errorMsg.value = ''
    if (!path) return
    loading.value = true
    try {
      signedUrl.value = await getCertificateSignedUrl(path)
    } catch (e) {
      errorMsg.value = 'Failed to load certificate: ' + (e?.message || e)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.cp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

.cp-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}

.cp-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: grid;
  place-content: center;
  color: rgba(15, 23, 42, 0.65);
  background: rgba(15, 23, 42, 0.06);
  font-size: 14px;
}
.cp-modal-close:hover { background: rgba(15, 23, 42, 0.1); }

.cp-modal-title {
  margin: 0 0 16px;
  font-family: "Barlow", system-ui, sans-serif;
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
}

.cp-modal-state {
  padding: 40px 0;
  text-align: center;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.55);
}

.cp-modal-img {
  display: block;
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.04);
}

.cp-modal-pdf {
  width: 100%;
  height: 60vh;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
}

.cp-modal-open-link {
  display: block;
  margin-top: 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #2563eb;
  text-align: center;
}

.gp-error {
  margin: 8px 2px 0;
  font-size: 12px;
  color: #dc2626;
}
</style>
