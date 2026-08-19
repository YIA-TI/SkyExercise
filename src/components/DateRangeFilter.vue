<template>
<div class="drf">
  <label class="drf-field">
    <span>Dari</span>
    <input v-model="start" type="date" :max="end || undefined" />
  </label>
  <label class="drf-field">
    <span>Sampai</span>
    <input v-model="end" type="date" :min="start || undefined" />
  </label>
</div>
</template>

<script setup>
const start = defineModel('start')
const end = defineModel('end')
</script>

<style scoped>
.drf { display: flex; gap: 12px; flex-wrap: wrap; }
.drf-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; }
.drf-field span { font-size: 12px; font-weight: 600; color: #57534e; }
.drf-field input {
  border: 1.5px solid #ece7e2; border-radius: 12px; padding: 11px 12px;
  font-family: inherit; font-size: 14px; color: #1c1917; background: #fff; outline: none;
}
.drf-field input:focus { border-color: #fc4c02; }
</style>
