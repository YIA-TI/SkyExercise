<template>
<SplashScreen greeting-lead="Welcome to" :greeting-main="APP_NAME" :next-path="nextPath" />
</template>

<script setup>
import { computed } from 'vue'
import { authState } from '../store/auth.js'
import SplashScreen from './SplashScreen.vue'

const APP_NAME = 'AeroGuard Monitor'

const nextPath = computed(() => {
  if (!authState.isLoggedIn) return '/signin'
  return authState.userRole === 'admin' ? '/admin' : '/home'
})
</script>
