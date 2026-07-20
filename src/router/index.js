// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '../store/auth.js'

import LoginSection      from '../components/LoginSection.vue'
import AdminDashboard    from '../views/AdminDashboard.vue'
import AdminDataAnggota  from '../views/AdminDataAnggota.vue'
import AdminPeringkat    from '../views/AdminPeringkat.vue'
import AnggotaDashboard  from '../views/AnggotaDashboard.vue'
import AnggotaLatihan    from '../views/AnggotaLatihan.vue'
import AnggotaPeringkat  from '../views/AnggotaPeringkat.vue'
import AnggotaRincian    from '../views/AnggotaRincian.vue'
import AnggotaRincianLatihan from '../views/AnggotaRincianLatihan.vue'

const routes = [
  // ── Publik ──────────────────────────────────────────────
  {
    path: '/',
    name: 'Login',
    component: LoginSection,
    meta: { requiresAuth: false },
  },

  // ── Admin ────────────────────────────────────────────────
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/anggota',
    name: 'AdminDataAnggota',
    component: AdminDataAnggota,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/peringkat/running',
    name: 'AdminPeringkatRunning',
    component: AdminPeringkat,
    props: { mode: 'running' },
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/peringkat/weight',
    name: 'AdminPeringkatWeight',
    component: AdminPeringkat,
    props: { mode: 'weight' },
    meta: { requiresAuth: true, role: 'admin' },
  },

  // ── Anggota ──────────────────────────────────────────────
  {
    path: '/anggota',
    name: 'AnggotaDashboard',
    component: AnggotaDashboard,
    meta: { requiresAuth: true, role: 'anggota' },
  },
  {
    path: '/anggota/latihan',
    name: 'AnggotaLatihan',
    component: AnggotaLatihan,
    meta: { requiresAuth: true, role: 'anggota' },
  },
  {
    path: '/anggota/latihan/rincian',
    name: 'AnggotaRincianLatihan',
    component: AnggotaRincianLatihan,
    meta: { requiresAuth: true, role: 'anggota' },
  },
  {
    path: '/anggota/peringkat/running',
    name: 'AnggotaPeringkatRunning',
    component: AnggotaPeringkat,
    props: { mode: 'running' },
    meta: { requiresAuth: true, role: 'anggota' },
  },
  {
    path: '/anggota/peringkat/weight',
    name: 'AnggotaPeringkatWeight',
    component: AnggotaPeringkat,
    props: { mode: 'weight' },
    meta: { requiresAuth: true, role: 'anggota' },
  },
  {
    path: '/anggota/rincian',
    name: 'AnggotaRincian',
    component: AnggotaRincian,
    meta: { requiresAuth: true, role: 'anggota' },
  },

  // ── Fallback ─────────────────────────────────────────────
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
    return { name: 'Login' }
  }

  if (to.meta.role && authState.userRole !== to.meta.role) {
    // Redirect ke dashboard yang sesuai role
    if (authState.userRole === 'admin') return { name: 'AdminDashboard' }
    if (authState.userRole === 'anggota') return { name: 'AnggotaDashboard' }
    return { name: 'Login' }
  }

  return true
})

export default router
