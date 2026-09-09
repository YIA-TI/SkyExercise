// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '../store/auth.js'

// ── FE baru (gaya Sandow / mobile-first) ── lazy: tiap screen jadi chunk
// terpisah, cuma diunduh saat rute-nya dibuka (bukan di bundle awal).
const WelcomeBackScreen     = () => import('../components/WelcomeBackScreen.vue')
const GoodbyeScreen         = () => import('../components/GoodbyeScreen.vue')
const SignInScreen          = () => import('../components/SignInScreen.vue')
const HomeScreen            = () => import('../components/HomeScreen.vue')
const StatsDetailScreen     = () => import('../components/StatsDetailScreen.vue')
const LatihanScreen         = () => import('../components/LatihanScreen.vue')
const RincianLatihanScreen  = () => import('../components/RincianLatihanScreen.vue')
const PeringkatScreen       = () => import('../components/PeringkatScreen.vue')
const ProfilScreen          = () => import('../components/ProfilScreen.vue')
const GantiPasswordScreen   = () => import('../components/GantiPasswordScreen.vue')
const StravaAuthorizeScreen = () => import('../components/StravaAuthorizeScreen.vue')
const StravaCallbackScreen  = () => import('../components/StravaCallbackScreen.vue')
const AdminMonitoringScreen = () => import('../components/AdminMonitoringScreen.vue')
const AdminAnggotaScreen    = () => import('../components/AdminAnggotaScreen.vue')
const AdminAnggotaDetailScreen = () => import('../components/AdminAnggotaDetailScreen.vue')
const AdminPeringkatScreen  = () => import('../components/AdminPeringkatScreen.vue')
const AdminQuestScreen      = () => import('../components/AdminQuestScreen.vue')

const routes = [
  // ── Publik ──────────────────────────────────────────────
  // '/' tidak lagi menampilkan splash — langsung reroute sesuai status login
  // (auth sudah pasti selesai resolve di titik ini, lihat main.js: initAuth()
  // di-await dulu sebelum router/app di-mount).
  {
    path: '/',
    name: 'Root',
    redirect: () => {
      if (!authState.isLoggedIn) return '/signin'
      return authState.userRole === 'admin' ? '/admin' : '/home'
    },
  },
  { path: '/signin',          name: 'SignIn',         component: SignInScreen,         meta: { requiresAuth: false } },
  { path: '/strava/callback', name: 'StravaCallback', component: StravaCallbackScreen, meta: { requiresAuth: false } },
  { path: '/welcome-back',    name: 'WelcomeBack',    component: WelcomeBackScreen,    meta: { requiresAuth: true, hideTabBar: true, isSplash: true } },
  { path: '/goodbye',         name: 'Goodbye',        component: GoodbyeScreen,        meta: { requiresAuth: false, hideTabBar: true, isSplash: true } },

  // ── Anggota ─────────────────────────────────────────────
  { path: '/home',             name: 'Home',            component: HomeScreen,           meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/stats/:type',      name: 'StatsDetail',     component: StatsDetailScreen,     meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/latihan',          name: 'Latihan',         component: LatihanScreen,        meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/latihan/rincian/:id', name: 'RincianLatihan', component: RincianLatihanScreen, meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/peringkat',        name: 'Peringkat',       component: PeringkatScreen,      meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/profil',           name: 'Profil',          component: ProfilScreen,         meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/profil/ganti-password', name: 'GantiPassword', component: GantiPasswordScreen, meta: { requiresAuth: true, role: 'anggota' } },
  { path: '/strava/authorize', name: 'StravaAuthorize', component: StravaAuthorizeScreen, meta: { requiresAuth: true, role: 'anggota', hideTabBar: true } },

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
