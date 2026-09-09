<template>
<SplashScreen greeting-lead="Welcome Back" :greeting-main="authState.userName" :next-path="nextPath" />
</template>

<script setup>
import { computed } from 'vue'
import { authState } from '../store/auth.js'
import SplashScreen from './SplashScreen.vue'

const nextPath = computed(() => (authState.userRole === 'admin' ? '/admin' : '/home'))
</script>
