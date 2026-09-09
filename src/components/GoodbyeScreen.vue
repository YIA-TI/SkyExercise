<template>
<SplashScreen greeting-lead="Good Bye" :greeting-main="userName" :next-path="nextPath" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './SplashScreen.vue'

const route = useRoute()
const userName = computed(() => {
  const name = route.query.name
  return (typeof name === 'string' && name.trim()) || 'Anggota'
})
// Admin balik ke /admin/login, anggota balik ke /signin (Strava).
const nextPath = computed(() => {
  const next = route.query.next
  return (typeof next === 'string' && next.trim()) || '/signin'
})
</script>
