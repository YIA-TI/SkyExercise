// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '../store/auth.js'

// ── FE baru (gaya Sandow / mobile-first) ──
import WelcomeScreen         from '../components/WelcomeScreen.vue'
import SignInScreen          from '../components/SignInScreen.vue'
import HomeScreen            from '../components/HomeScreen.vue'
import StatsDetailScreen     from '../components/StatsDetailScreen.vue'
import LatihanScreen         from '../components/LatihanScreen.vue'
import RincianLatihanScreen  from '../components/RincianLatihanScreen.vue'
import PeringkatScreen       from '../components/PeringkatScreen.vue'
import ProfilScreen          from '../components/ProfilScreen.vue'
import GantiPasswordScreen   from '../components/GantiPasswordScreen.vue'
import StravaAuthorizeScreen from '../components/StravaAuthorizeScreen.vue'
import StravaCallbackScreen  from '../components/StravaCallbackScreen.vue'
import AdminMonitoringScreen from '../components/AdminMonitoringScreen.vue'
import AdminAnggotaScreen    from '../components/AdminAnggotaScreen.vue'
import AdminAnggotaDetailScreen from '../components/AdminAnggotaDetailScreen.vue'
import AdminPeringkatScreen  from '../components/AdminPeringkatScreen.vue'
import AdminQuestScreen      from '../components/AdminQuestScreen.vue'

const routes = [
  // ── Publik ──────────────────────────────────────────────
  { path: '/',                name: 'Welcome',        component: WelcomeScreen,        meta: { requiresAuth: false } },
  { path: '/signin',          name: 'SignIn',         component: SignInScreen,         meta: { requiresAuth: false } },
  { path: '/strava/callback', name: 'StravaCallback', component: StravaCallbackScreen, meta: { requiresAuth: false } },

  // ── Anggota ─────────────────────────────────────────────
  { path: '/home',             name: 'Home',            component: HomeScreen,           meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/stats/:type',      name: 'StatsDetail',     component: StatsDetailScreen,     meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/latihan',          name: 'Latihan',         component: LatihanScreen,        meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/latihan/rincian/:id', name: 'RincianLatihan', component: RincianLatihanScreen, meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/peringkat',        name: 'Peringkat',       component: PeringkatScreen,      meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/profil',           name: 'Profil',          component: ProfilScreen,         meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/profil/ganti-password', name: 'GantiPassword', component: GantiPasswordScreen, meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/strava/authorize', name: 'StravaAuthorize', component: StravaAuthorizeScreen, meta: { requiresAuth: true, role: 'anggota' } },

  // ── Admin (Monitoring) ──────────────────────────────────
  { path: '/admin',           name: 'AdminMonitoring', component: AdminMonitoringScreen, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/anggota',   name: 'AdminAnggota',    component: AdminAnggotaScreen,    meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/anggota/:id', name: 'AdminAnggotaDetail', component: AdminAnggotaDetailScreen, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/peringkat', name: 'AdminPeringkat',  component: AdminPeringkatScreen,  meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/quests',    name: 'AdminQuest',      component: AdminQuestScreen,      meta: { requiresAuth: true, role: 'admin' } },

  // ── Fallback ────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard — cek role sebelum masuk halaman
router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  if (!authState.isLoggedIn) {
    return { name: 'SignIn' }
  }

  if (to.meta.role && authState.userRole !== to.meta.role) {
    // Redirect ke beranda yang sesuai role
    if (authState.userRole === 'admin') return { name: 'AdminMonitoring' }
    if (authState.userRole === 'anggota') return { name: 'Home' }
    return { name: 'SignIn' }
  }

  return true
})

export default router
