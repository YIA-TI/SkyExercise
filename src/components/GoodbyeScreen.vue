<template>
<SplashScreen greeting-lead="Good Bye" :greeting-main="userName" next-path="/signin" />
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
</script>
