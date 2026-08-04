import './style.css'
import './assets/main.css'
import { createApp } from 'vue'
import router from './router/index.js'
import App from './App.vue'
import { initAuth } from './store/auth.js'

// Pulihkan sesi Supabase dulu agar navigation guard punya state yang benar.
initAuth().finally(() => {
  createApp(App).use(router).mount('#app')
})
