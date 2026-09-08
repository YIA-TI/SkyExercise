# Loading States & Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add page-transition animation, first-load skeletons + background-refresh badges, and button-loading spinners across the app, closing the gaps found in the design spec's audit.

**Architecture:** One shared CSS spinner utility (`mobile-ui.css`) and one new tiny `RefreshingBadge.vue` component are the two reusable primitives; every other task applies them (or a per-file-local variant, for the two screens that don't already import the shared stylesheet) to a specific screen or action.

**Tech Stack:** Vue 3 (`<Transition>`, `v-if`), CSS animations. No new dependencies.

**Note on verification:** No test framework is installed in this project (confirmed in Phase 1's plan) — verification steps use the dev server + manual browser checks, consistent with project convention.

---

### Task 1: Shared spinner CSS + page transition wrapper

**Files:**
- Modify: `src/assets/mobile-ui.css`
- Modify: `src/App.vue`

- [ ] **Step 1: Add the shared spinner utility to `mobile-ui.css`**

Append to the end of `src/assets/mobile-ui.css`:

```css

/* ── Spin icon (loading spinner inside buttons) — shared across all screens
   that @import this file, so the animation isn't redefined per-component. ── */
.spin-icon.is-spinning { animation: mui-spin 0.9s linear infinite; }
@keyframes mui-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 2: Wrap `RouterView` in `App.vue` with a Fade+Rise transition**

Replace the entire contents of `src/App.vue` with:

```vue
<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import { authState } from './store/auth.js'
import { bodyMetricsModalState } from './store/bodyMetricsModal.js'
import ToastHost from './components/ToastHost.vue'

// Modal jarang tampil (cuma isi awal / dibuka manual) — muat lazy, jangan ikut bundle awal.
const BodyMetricsModal = defineAsyncComponent(() => import('./components/BodyMetricsModal.vue'))

const showBodyMetricsModal = computed(() =>
  authState.userRole === 'anggota' &&
  ((!authState.loading && authState.needsBodyMetrics) || bodyMetricsModalState.open),
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <BodyMetricsModal v-if="showBodyMetricsModal" />
  <ToastHost />
</template>

<style scoped>
/* App root — RouterView mengisi seluruh layar */

/* Transisi pindah halaman — fade + naik tipis (mode="out-in": layar lama
   selesai keluar dulu sebelum layar baru masuk, hindari overlap layout). */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.page-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 3: Verify in the browser**

Run: `cd "D:\porto\SkyExcercise" && npm run dev` (if not already running)
Open `http://localhost:5173`, sign in, and navigate between at least 2 screens (e.g. Home → Peringkat). Confirm the incoming screen fades in while rising slightly (no instant cut), and there are no console errors.

- [ ] **Step 4: Commit**

The user reviews and commits all changes themselves — do not run `git add`/`git commit`/`git push`. Leave the change unstaged.

---

### Task 2: `RefreshingBadge.vue` — shared background-refresh indicator

**Files:**
- Create: `src/components/RefreshingBadge.vue`

- [ ] **Step 1: Create the component**

```vue
<!-- src/components/RefreshingBadge.vue -->
<!-- Badge kecil "Menyegarkan..." dgn titik berdenyut — dipakai di header layar
     yang datanya di-refresh otomatis via Supabase Realtime (Phase 1), supaya
     update di background tidak perlu re-render skeleton penuh lagi. -->
<template>
  <span class="refreshing-badge">
    <span class="refreshing-dot"></span>
    Menyegarkan…
  </span>
</template>

<style scoped>
.refreshing-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #78716c;
  flex-shrink: 0;
}
.refreshing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fc4c02;
  animation: refreshing-pulse 0.9s ease-in-out infinite;
}
@keyframes refreshing-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
}
</style>
```

- [ ] **Step 2: Verify syntax**

Run: `cd "D:\porto\SkyExcercise" && node --check src/components/RefreshingBadge.vue 2>&1 || true`
Expected: This will report a syntax error since `.vue` isn't plain JS — that's expected and fine (Vite/`vue-tsc` handles `.vue` parsing, not raw Node). Instead, confirm no typos by re-reading the file; real verification happens in Task 3 when it's actually used on a page and the dev server compiles it.

- [ ] **Step 3: Commit**

Leave unstaged, per user's request to review/commit changes themselves.

---

### Task 3: `HomeScreen.vue` — skeleton, refresh badge, spinner migration

**Files:**
- Modify: `src/components/HomeScreen.vue`

This screen currently shows zero loading indication anywhere (confirmed in the design spec's audit) and also has its own inline spinner CSS (`.strava-sync-ic.is-spinning` / `@keyframes strava-spin`) duplicating what Task 1 now provides centrally in `mobile-ui.css`. This task adds skeletons for the two data-driven sections (Statistik, My Activity) and migrates the Strava spinner to the shared class.

- [ ] **Step 1: Import `RefreshingBadge` and read `loading` from the composables**

In `src/components/HomeScreen.vue`, find this line (around line 218):

```js
import { useHomeStats, useActivities, checkAchievements } from '../composables/useMemberData.js'
```

Replace with:

```js
import { useHomeStats, useActivities, checkAchievements } from '../composables/useMemberData.js'
import RefreshingBadge from './RefreshingBadge.vue'
```

Then find (around line 281):

```js
const { stats, refresh: refreshStats } = useHomeStats()
```

Replace with:

```js
const { stats, loading: statsLoading, refresh: refreshStats } = useHomeStats()
```

Then find (around line 407):

```js
const { activities: rawActivities, refresh: refreshActivities } = useActivities(activeFilter)
```

Replace with:

```js
const { activities: rawActivities, loading: activitiesLoading, refresh: refreshActivities } = useActivities(activeFilter)
```

- [ ] **Step 2: Add skeleton + refresh badge to the Statistik section**

Find this block (around line 61-65):

```html
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">Statistik</h2>
        <span class="swipe-hint">Putar ↔</span>
      </div>

      <div class="sphere" @pointerdown="onDown">
```

Replace with:

```html
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">Statistik</h2>
        <RefreshingBadge v-if="statsLoading && stats" />
        <span v-else class="swipe-hint">Putar ↔</span>
      </div>

      <div v-if="statsLoading && !stats" class="stats-skel">
        <div class="mui-skel" style="width: 100%; height: 100%; border-radius: 26px;"></div>
      </div>
      <div v-else class="sphere" @pointerdown="onDown">
```

Since the closing tags for `.sphere` already exist unchanged, this just wraps the existing sphere markup with a `v-else` and adds a sibling skeleton `v-if` block above it — the rest of the coverflow markup (lines 66 onward, up to the matching `</div>` for `.sphere`) stays exactly as-is.

- [ ] **Step 3: Add skeleton + refresh badge to the My Activity section**

Find this block (around line 152-156):

```html
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">My Activity</h2>
        <span class="hchip">{{ filteredActivities.length }} aktivitas</span>
      </div>
```

Replace with:

```html
    <section class="stats-wrap">
      <div class="stats-head">
        <h2 class="section-title">My Activity</h2>
        <RefreshingBadge v-if="activitiesLoading && rawActivities" />
        <span v-else class="hchip">{{ filteredActivities.length }} aktivitas</span>
      </div>
```

Find this block (around line 168-186, the `.act-list` div):

```html
      <div class="act-list">
        <div
          v-for="a in visibleActivities"
          :key="a.id"
          class="act-item"
          role="button"
          tabindex="0"
          @click="goRincian(a.id)"
          @keyup.enter="goRincian(a.id)"
        >
          <span class="act-ic" :class="a.cls" v-html="a.icon"></span>
          <div class="act-body">
            <p class="act-name">{{ a.name }}</p>
            <p class="act-meta">{{ a.meta }}</p>
          </div>
          <span class="act-time mono">{{ a.waktu }}</span>
        </div>
        <p v-if="filteredActivities.length === 0" class="act-empty">Tidak ada aktivitas untuk filter ini.</p>
      </div>
```

Replace with:

```html
      <div v-if="activitiesLoading && !rawActivities" class="act-list">
        <div v-for="i in 4" :key="i" class="act-item">
          <div class="mui-skel mui-skel--circle" style="width: 40px; height: 40px; flex-shrink: 0;"></div>
          <div class="act-body">
            <div class="mui-skel mui-skel--text" style="width: 60%;"></div>
            <div class="mui-skel mui-skel--text" style="width: 40%; margin-top: 6px;"></div>
          </div>
        </div>
      </div>
      <div v-else class="act-list">
        <div
          v-for="a in visibleActivities"
          :key="a.id"
          class="act-item"
          role="button"
          tabindex="0"
          @click="goRincian(a.id)"
          @keyup.enter="goRincian(a.id)"
        >
          <span class="act-ic" :class="a.cls" v-html="a.icon"></span>
          <div class="act-body">
            <p class="act-name">{{ a.name }}</p>
            <p class="act-meta">{{ a.meta }}</p>
          </div>
          <span class="act-time mono">{{ a.waktu }}</span>
        </div>
        <p v-if="filteredActivities.length === 0" class="act-empty">Tidak ada aktivitas untuk filter ini.</p>
      </div>
```

- [ ] **Step 4: Add the `.stats-skel` CSS and import `mobile-ui.css` for the shared spinner/skeleton classes**

`HomeScreen.vue`'s `<style>` block does not currently `@import '../assets/mobile-ui.css'` (it's a fully self-contained `.aeroguard-home`-namespaced stylesheet). The skeleton classes (`.mui-skel`, `.mui-skel--text`, `.mui-skel--circle`) and the new `.spin-icon` used in this task/Task 11 both live there, so it needs to be imported. CSS `@import` only adds class *definitions* — it doesn't apply anything to unrelated elements, so this is safe to add (this pattern is already used by every other screen in the app).

Find (around line 431-432):

```css
<style>
/* ========== HOME DASHBOARD ========== */
```

Replace with:

```css
<style>
@import '../assets/mobile-ui.css';

/* ========== HOME DASHBOARD ========== */
```

Then find (around line 660-661, the existing local spinner definition):

```css
.aeroguard-home .strava-sync-ic.is-spinning { animation: strava-spin 0.9s linear infinite; }
@keyframes strava-spin { to { transform: rotate(360deg); } }
```

Replace with (removing the now-duplicate local keyframes, adding the skeleton container size):

```css
.stats-skel { height: calc(var(--card-h) + 50px); }
```

- [ ] **Step 5: Migrate the Strava sync button to the shared `.spin-icon` class**

Find (around line 41):

```html
        <svg class="strava-sync-ic" :class="{ 'is-spinning': syncing }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
```

Replace with:

```html
        <svg class="spin-icon" :class="{ 'is-spinning': syncing }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
```

- [ ] **Step 6: Verify in the browser**

With the dev server running, log in as a participant and visit `/home`. On first load (hard-refresh with devtools "Disable cache" + network throttled to "Slow 3G" if it loads too fast to see), confirm skeleton blocks appear in the Statistik and My Activity sections before real data appears. Click "Sinkronkan" and confirm the spinner still animates during sync (now via the shared class). Confirm no console errors.

- [ ] **Step 7: Commit**

Leave unstaged for the user.

---

### Task 4: `PeringkatScreen.vue` — skeleton + refresh badge

**Files:**
- Modify: `src/components/PeringkatScreen.vue`

- [ ] **Step 1: Read `loading` from `useLeaderboard` and import `RefreshingBadge`**

Find (around line 91-95):

```js
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import MemberTabBar from './MemberTabBar.vue'
```

Replace with:

```js
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import MemberTabBar from './MemberTabBar.vue'
import RefreshingBadge from './RefreshingBadge.vue'
```

Find (around line 113):

```js
const { rows } = useLeaderboard(activeMode, leaguePeriod)
```

Replace with:

```js
const { rows, loading } = useLeaderboard(activeMode, leaguePeriod)
```

- [ ] **Step 2: Add skeleton + refresh badge to the header/podium area**

Find (around line 4-13):

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Divisi ARFF · {{ currentRankData.length }} anggota</p>
        </div>
      </div>
      <span class="mui-pill">Posisi #{{ myRank }}</span>
    </header>
```

Replace with:

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Divisi ARFF · {{ currentRankData.length }} anggota</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && rows" />
      <span v-else class="mui-pill">Posisi #{{ myRank }}</span>
    </header>
```

Find (around line 50-65, the podium block start):

```html
    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-if="podium.length" class="lb-podium">
```

Replace with:

```html
    <div v-if="loading && !rows" class="lb-podium">
      <div v-for="i in 3" :key="i" class="lb-podium-item">
        <div class="mui-skel mui-skel--circle" style="width: 50px; height: 50px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 70px; margin-top: 8px;"></div>
        <div class="mui-skel" style="width: 100%; height: 44px; margin-top: 4px;"></div>
      </div>
    </div>
    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-else-if="podium.length" class="lb-podium">
```

- [ ] **Step 3: Verify in the browser**

Log in as a participant, visit `/peringkat`. On a throttled/hard-refresh first load, confirm 3 skeleton podium placeholders appear before real ranks. No console errors.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 5: `ProfilScreen.vue` — skeleton + refresh badge

**Files:**
- Modify: `src/components/ProfilScreen.vue`

- [ ] **Step 1: Read `loading` from `useProfile` and import `RefreshingBadge`**

Find (around line 110-118):

```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth.js'
import { distance as mockDistance } from '../store/stats.js'
import { stravaState, disconnectStrava } from '../store/strava.js'
import { useProfile, useHomeStats, useLeaderboard } from '../composables/useMemberData.js'
import { calcBmi, bmiCategory } from '../lib/normalize.js'
import { openBodyMetricsModal } from '../store/bodyMetricsModal.js'
import MemberTabBar from './MemberTabBar.vue'
```

Replace with:

```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth.js'
import { distance as mockDistance } from '../store/stats.js'
import { stravaState, disconnectStrava } from '../store/strava.js'
import { useProfile, useHomeStats, useLeaderboard } from '../composables/useMemberData.js'
import { calcBmi, bmiCategory } from '../lib/normalize.js'
import { openBodyMetricsModal } from '../store/bodyMetricsModal.js'
import MemberTabBar from './MemberTabBar.vue'
import RefreshingBadge from './RefreshingBadge.vue'
```

Find (around line 123):

```js
const { profile } = useProfile()
```

Replace with:

```js
const { profile, loading: profileLoading } = useProfile()
```

- [ ] **Step 2: Add skeleton + refresh badge to the profile card**

Find (around line 4-13, the header):

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Profil Saya</p>
          <p class="mui-h-sub">Anggota ARFF aktif</p>
        </div>
      </div>
      <span class="mui-pill">Aktif</span>
    </header>
```

Replace with:

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Profil Saya</p>
          <p class="mui-h-sub">Anggota ARFF aktif</p>
        </div>
      </div>
      <RefreshingBadge v-if="profileLoading && profile" />
      <span v-else class="mui-pill">Aktif</span>
    </header>
```

Find (around line 22-41, the avatar/name/role block inside `.pf-card`):

```html
      <div class="pf-avatar-wrap">
        <img v-if="profile?.avatar" :src="profile.avatar" class="pf-avatar-img" alt="" />
        <div v-else class="pf-avatar-fallback">{{ initials }}</div>
      </div>

      <p class="pf-name">
        {{ authState.userName || '—' }}
        <svg v-if="stravaState.connected" class="pf-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fc4c02" aria-hidden="true">
          <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
          <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </p>
      <p class="pf-role">Anggota ARFF · {{ profile?.city || '—' }}</p>
```

Replace with:

```html
      <div v-if="profileLoading && !profile" class="pf-avatar-wrap">
        <div class="mui-skel mui-skel--circle" style="width: 100%; height: 100%;"></div>
      </div>
      <div v-else class="pf-avatar-wrap">
        <img v-if="profile?.avatar" :src="profile.avatar" class="pf-avatar-img" alt="" />
        <div v-else class="pf-avatar-fallback">{{ initials }}</div>
      </div>

      <template v-if="profileLoading && !profile">
        <div class="mui-skel mui-skel--text" style="width: 140px; height: 21px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 100px; margin-top: 8px;"></div>
      </template>
      <template v-else>
        <p class="pf-name">
          {{ authState.userName || '—' }}
          <svg v-if="stravaState.connected" class="pf-verified" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fc4c02" aria-hidden="true">
            <path d="M12 2l2.4 2.2 3.2-.6.6 3.2L21 9l-1.8 2.8L21 15l-2.8 1.2-.6 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.6-3.2L3 15l1.8-2.8L3 9l2.8-1.2.6-3.2 3.2.6L12 2z"/>
            <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </p>
        <p class="pf-role">Anggota ARFF · {{ profile?.city || '—' }}</p>
      </template>
```

- [ ] **Step 3: Verify in the browser**

Log in as a participant, visit `/profil`. On a throttled/hard-refresh first load, confirm the avatar circle and name show skeleton blocks before real data. No console errors.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 6: `AdminAnggotaScreen.vue` — skeleton + refresh badge

**Files:**
- Modify: `src/components/AdminAnggotaScreen.vue`

- [ ] **Step 1: Read `loading` from `useAdminParticipants` and import `RefreshingBadge`**

Find (around line 75-79):

```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminParticipants } from '../composables/useAdminData.js'
import AdminTabBar from './AdminTabBar.vue'
```

Replace with:

```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { useAdminParticipants } from '../composables/useAdminData.js'
import AdminTabBar from './AdminTabBar.vue'
import RefreshingBadge from './RefreshingBadge.vue'
```

Find (around line 93):

```js
const { participants } = useAdminParticipants()
```

Replace with:

```js
const { participants, loading } = useAdminParticipants()
```

- [ ] **Step 2: Add skeleton + refresh badge**

Find (around line 4-13, the header):

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Data Anggota</p>
          <p class="mui-h-sub">Direktori anggota ARFF</p>
        </div>
      </div>
      <span class="mui-pill">{{ anggotaList.length }} Anggota</span>
    </header>
```

Replace with:

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Data Anggota</p>
          <p class="mui-h-sub">Direktori anggota ARFF</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && participants" />
      <span v-else class="mui-pill">{{ anggotaList.length }} Anggota</span>
    </header>
```

Find (around line 20-67, the whole `.an-list` block):

```html
    <div class="an-list">
      <article
        v-for="a in filteredAnggota"
```

Replace with:

```html
    <div v-if="loading && !participants" class="an-list">
      <article v-for="i in 6" :key="i" class="an-card">
        <div class="mui-skel mui-skel--circle" style="width: 48px; height: 48px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 60%; margin-top: 10px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 40%; margin-top: 6px;"></div>
      </article>
    </div>
    <div v-else class="an-list">
      <article
        v-for="a in filteredAnggota"
```

(The rest of the `v-for` block and its closing `</div>` at the end of the original `.an-list` stay exactly as they were — only the opening tag and the new skeleton sibling block are added.)

- [ ] **Step 3: Verify in the browser**

Log in as admin, visit `/admin/anggota`. On a throttled/hard-refresh first load, confirm 6 skeleton cards appear before the real roster. No console errors.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 7: `AdminPeringkatScreen.vue` — skeleton + refresh badge

**Files:**
- Modify: `src/components/AdminPeringkatScreen.vue`

- [ ] **Step 1: Read `loading` from `useLeaderboard` and import `RefreshingBadge`**

Find (around line 83-88):

```js
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import AdminTabBar from './AdminTabBar.vue'
```

Replace with:

```js
import { ref, computed, reactive } from 'vue'
import { Crown, Shield, Award, Star, Gem } from '@lucide/vue'
import { authState } from '../store/auth.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import { LEAGUE_TIER_ORDER } from '../lib/leagueTier.js'
import AdminTabBar from './AdminTabBar.vue'
import RefreshingBadge from './RefreshingBadge.vue'
```

Find (around line 106):

```js
const { rows } = useLeaderboard(activeMode, leaguePeriod)
```

Replace with:

```js
const { rows, loading } = useLeaderboard(activeMode, leaguePeriod)
```

- [ ] **Step 2: Add skeleton + refresh badge**

Find (around line 4-13, the header):

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Pantauan performa divisi</p>
        </div>
      </div>
      <span class="mui-pill">Admin View</span>
    </header>
```

Replace with:

```html
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Papan Peringkat</p>
          <p class="mui-h-sub">Pantauan performa divisi</p>
        </div>
      </div>
      <RefreshingBadge v-if="loading && rows" />
      <span v-else class="mui-pill">Admin View</span>
    </header>
```

Find (around line 46-47, the podium block start):

```html
    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-if="podium.length" class="lb-podium">
```

Replace with:

```html
    <div v-if="loading && !rows" class="lb-podium">
      <div v-for="i in 3" :key="i" class="lb-podium-item">
        <div class="mui-skel mui-skel--circle" style="width: 50px; height: 50px;"></div>
        <div class="mui-skel mui-skel--text" style="width: 70px; margin-top: 8px;"></div>
        <div class="mui-skel" style="width: 100%; height: 44px; margin-top: 4px;"></div>
      </div>
    </div>
    <!-- Podium top-3 — juara 1 di tengah & lebih tinggi, ala panggung -->
    <div v-else-if="podium.length" class="lb-podium">
```

- [ ] **Step 3: Verify in the browser**

Log in as admin, visit `/admin/peringkat`. Confirm skeleton podium on first load. No console errors.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 8: `LatihanScreen.vue` — Klaim button spinner (the original reported gap)

**Files:**
- Modify: `src/components/LatihanScreen.vue`

- [ ] **Step 1: Add a per-quest `claimingId` ref and guard/clear it in `claim()`**

Find (around line 183-184):

```js
const tab = ref('harian')
const openId = ref(null)
```

Replace with:

```js
const tab = ref('harian')
const openId = ref(null)
const claimingId = ref(null)
```

Find (around line 215-223):

```js
async function claim(q) {
  if (q.claimed || q.current < q.target) return
  try {
    await claimQuest(q.id)
    await runAchievementCheck()
  } catch (e) {
    alert('Gagal klaim: ' + (e?.message || e))
  }
}
```

Replace with:

```js
async function claim(q) {
  if (q.claimed || q.current < q.target || claimingId.value === q.id) return
  claimingId.value = q.id
  try {
    await claimQuest(q.id)
    await runAchievementCheck()
  } catch (e) {
    alert('Gagal klaim: ' + (e?.message || e))
  } finally {
    claimingId.value = null
  }
}
```

- [ ] **Step 2: Add the spinner + disabled state to both Klaim buttons**

Find (around line 89-93):

```html
              <button
                v-if="statusOf(q) === 'ready'"
                class="q-claim"
                @click.stop="claim(q)"
              >Klaim {{ q.reward }} XP</button>
```

Replace with:

```html
              <button
                v-if="statusOf(q) === 'ready'"
                class="q-claim"
                :disabled="claimingId === q.id"
                @click.stop="claim(q)"
              >
                <svg v-if="claimingId === q.id" class="spin-icon is-spinning" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Klaim {{ q.reward }} XP
              </button>
```

Find (around line 102-107):

```html
        <button
          v-if="statusOf(q) === 'ready' && openId !== q.id"
          class="q-claim-mini"
          @click.stop="claim(q)"
          aria-label="Klaim reward"
        >Klaim</button>
```

Replace with:

```html
        <button
          v-if="statusOf(q) === 'ready' && openId !== q.id"
          class="q-claim-mini"
          :disabled="claimingId === q.id"
          @click.stop="claim(q)"
          aria-label="Klaim reward"
        >
          <svg v-if="claimingId === q.id" class="spin-icon is-spinning" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Klaim
        </button>
```

- [ ] **Step 3: Add flex layout + disabled styling so the icon aligns with the label**

Find (around line 352-360):

```css
.q-claim {
  width: 100%; border: none; cursor: pointer; font-family: inherit;
  font-size: 13.5px; font-weight: 700; color: #fff; padding: 12px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 14px 24px -12px rgba(252, 76, 2, 0.8);
  transition: transform 0.15s ease;
}
.q-claim:hover { transform: scale(1.02); }
.q-claim:active { transform: scale(0.97); }
```

Replace with:

```css
.q-claim {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 13.5px; font-weight: 700; color: #fff; padding: 12px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 14px 24px -12px rgba(252, 76, 2, 0.8);
  transition: transform 0.15s ease;
}
.q-claim:hover:not(:disabled) { transform: scale(1.02); }
.q-claim:active:not(:disabled) { transform: scale(0.97); }
.q-claim:disabled { opacity: 0.7; cursor: default; }
```

Find (around line 365-370):

```css
.q-claim-mini {
  align-self: center; flex-shrink: 0; border: none; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #fff; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 22px -12px rgba(252, 76, 2, 0.8);
}
```

Replace with:

```css
.q-claim-mini {
  align-self: center; flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #fff; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 22px -12px rgba(252, 76, 2, 0.8);
}
.q-claim-mini:disabled { opacity: 0.7; cursor: default; }
```

- [ ] **Step 4: Verify in the browser**

Log in as a participant with a claimable quest (`current >= target`, not yet claimed — check via `/admin` if none exist, or use the Task 5 SQL-insert technique from Phase 1 to push a test athlete's activity past a quest target), visit `/latihan`, click "Klaim". Confirm the spinner appears and the button is disabled for the duration of the RPC call.

- [ ] **Step 5: Commit**

Leave unstaged for the user.

---

### Task 9: `AdminQuestScreen.vue` — toggle/hapus/submit/saveDate spinners

**Files:**
- Modify: `src/components/AdminQuestScreen.vue`

- [ ] **Step 1: Add per-quest `togglingId`/`deletingId` refs**

Find (around line 294-296):

```js
const editingId = ref(null)
const editDate = ref('')
const savingDate = ref(false)
```

Replace with:

```js
const editingId = ref(null)
const editDate = ref('')
const savingDate = ref(false)
const togglingId = ref(null)
const deletingId = ref(null)
```

- [ ] **Step 2: Wire `togglingId` into `toggleActive`**

Find (around line 285-292):

```js
async function toggleActive(q) {
  try {
    await update(q.id, { active: !q.active })
    showToast(q.active ? 'Quest dinonaktifkan' : 'Quest diaktifkan')
  } catch (e) {
    showToast(e?.message || 'Gagal mengubah status quest', 'error')
  }
}
```

Replace with:

```js
async function toggleActive(q) {
  togglingId.value = q.id
  try {
    await update(q.id, { active: !q.active })
    showToast(q.active ? 'Quest dinonaktifkan' : 'Quest diaktifkan')
  } catch (e) {
    showToast(e?.message || 'Gagal mengubah status quest', 'error')
  } finally {
    togglingId.value = null
  }
}
```

- [ ] **Step 3: Wire `deletingId` into `hapus`**

Find (around line 321-329):

```js
async function hapus(q) {
  if (!window.confirm(`Hapus quest "${q.title}"?`)) return
  try {
    await remove(q.id)
    showToast('Quest berhasil dihapus')
  } catch (e) {
    showToast(e?.message || 'Gagal menghapus quest', 'error')
  }
}
```

Replace with:

```js
async function hapus(q) {
  if (!window.confirm(`Hapus quest "${q.title}"?`)) return
  deletingId.value = q.id
  try {
    await remove(q.id)
    showToast('Quest berhasil dihapus')
  } catch (e) {
    showToast(e?.message || 'Gagal menghapus quest', 'error')
    deletingId.value = null
  }
}
```

(Note: no `finally` here — on success, the quest row is removed from the list entirely by `remove()`'s refetch, so there's nothing left to show as "not deleting" on; on failure, `deletingId` is cleared explicitly so the row's spinner stops and the button becomes clickable again.)

- [ ] **Step 4: Fix `saveDate` so the button stays visible (and spinning) through the backfill call**

Find (around line 306-319):

```js
async function saveDate(q) {
  savingDate.value = true
  const newDate = editDate.value
  try {
    await update(q.id, { quest_date: newDate || null })
    cancelEditDate()
    showToast('Tanggal quest berhasil diperbarui')
    if (newDate) await runBackfill(q.id)
  } catch (e) {
    showToast(e?.message || 'Gagal memperbarui tanggal', 'error')
  } finally {
    savingDate.value = false
  }
}
```

Replace with:

```js
async function saveDate(q) {
  savingDate.value = true
  const newDate = editDate.value
  try {
    await update(q.id, { quest_date: newDate || null })
    if (newDate) await runBackfill(q.id)
    cancelEditDate()
    showToast('Tanggal quest berhasil diperbarui')
  } catch (e) {
    showToast(e?.message || 'Gagal memperbarui tanggal', 'error')
  } finally {
    savingDate.value = false
  }
}
```

(`cancelEditDate()` previously ran *before* the backfill call, hiding the "Menyimpan…" button — and its spinner, once added below — while backfill was still silently running. Moving it after `runBackfill` keeps the button visible for the whole operation.)

- [ ] **Step 5: Add spinner icons to the submit, saveDate, toggle, and delete controls**

Find (around line 99-102):

```html
        <button class="qf-submit" type="submit" :disabled="saving">
          <Rocket :size="16" />
          {{ saving ? 'Menyimpan…' : 'Tambah Quest' }}
        </button>
```

Replace with:

```html
        <button class="qf-submit" type="submit" :disabled="saving">
          <svg v-if="saving" class="spin-icon is-spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <Rocket v-else :size="16" />
          {{ saving ? 'Menyimpan…' : 'Tambah Quest' }}
        </button>
```

Find (around line 138-141):

```html
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="saveDate(q)">
                  {{ savingDate ? 'Menyimpan…' : 'Simpan' }}
                </button>
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="cancelEditDate">Batal</button>
```

Replace with:

```html
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="saveDate(q)">
                  <svg v-if="savingDate" class="spin-icon is-spinning" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  {{ savingDate ? 'Menyimpan…' : 'Simpan' }}
                </button>
                <button class="ql-btn ql-btn--sm" type="button" :disabled="savingDate" @click="cancelEditDate">Batal</button>
```

Find (around line 151-157):

```html
              <label class="ql-switch" :title="q.active ? 'Nonaktifkan' : 'Aktifkan'">
                <input type="checkbox" :checked="q.active" @change="toggleActive(q)" />
                <span class="ql-switch-track"><span class="ql-switch-thumb"></span></span>
              </label>
              <button class="ql-icon-btn ql-icon-btn--del" type="button" title="Hapus" aria-label="Hapus" @click="hapus(q)">
                <Trash2 :size="15" />
              </button>
```

Replace with:

```html
              <label class="ql-switch" :title="q.active ? 'Nonaktifkan' : 'Aktifkan'">
                <input type="checkbox" :checked="q.active" :disabled="togglingId === q.id" @change="toggleActive(q)" />
                <span class="ql-switch-track"><span class="ql-switch-thumb"></span></span>
              </label>
              <svg v-if="togglingId === q.id" class="spin-icon is-spinning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <button class="ql-icon-btn ql-icon-btn--del" type="button" title="Hapus" aria-label="Hapus" :disabled="deletingId === q.id" @click="hapus(q)">
                <svg v-if="deletingId === q.id" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                <Trash2 v-else :size="15" />
              </button>
```

- [ ] **Step 6: Add a small gap to `.ql-btn` so the spinner aligns with its label**

Find (around line 458-462):

```css
.ql-btn {
  border: 1px solid #ece7e2; background: #f5f1ec; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #57534e; padding: 8px 12px; border-radius: 10px;
}
```

Replace with:

```css
.ql-btn {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid #ece7e2; background: #f5f1ec; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #57534e; padding: 8px 12px; border-radius: 10px;
}
```

- [ ] **Step 7: Verify in the browser**

Log in as admin, visit `/admin/quests`. Click the active/inactive toggle on a quest and confirm a spinner briefly appears beside it. Click "Hapus" (on a disposable test quest) and confirm a spinner appears in the button before it disappears from the list. Create a new quest and confirm the submit button spinner shows. Edit a dated quest's date and confirm "Simpan" shows its spinner and the edit-date row doesn't disappear until the whole operation (including backfill) finishes.

- [ ] **Step 8: Commit**

Leave unstaged for the user.

---

### Task 10: Consistency pass — add spinners to existing text-only loading buttons

**Files:**
- Modify: `src/components/SignInScreen.vue`
- Modify: `src/components/BodyMetricsModal.vue`
- Modify: `src/components/GantiPasswordScreen.vue`
- Modify: `src/components/StravaAuthorizeScreen.vue`

These four buttons already show text-change feedback ("Memproses…"/"Menyimpan…"/"Menghubungkan…") — this task adds a spinner icon alongside the existing text, without removing it. `BodyMetricsModal.vue` and `GantiPasswordScreen.vue` already `@import '../assets/mobile-ui.css'`, so they use the shared `.spin-icon` class directly. `SignInScreen.vue` and `StravaAuthorizeScreen.vue` are fully self-contained stylesheets with their own namespacing and no such import (by original design, to stay isolated from the `.mui` design system) — for these two, a small local spinner class is added instead of pulling in the shared stylesheet.

- [ ] **Step 1: `SignInScreen.vue` — add a local spinner**

Find (around line 83-89):

```html
      <button class="submit" type="submit" :disabled="submitting">
        <span>{{ submitting ? 'Memproses…' : 'Masuk' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
```

Replace with:

```html
      <button class="submit" type="submit" :disabled="submitting">
        <svg v-if="submitting" class="signin-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        <span>{{ submitting ? 'Memproses…' : 'Masuk' }}</span>
        <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
```

Find (around line 291-310, the `.aeroguard-signin .submit` rule) and add a new rule immediately after the existing `.aeroguard-signin .submit:disabled` rule:

```css
.aeroguard-signin .submit:disabled {
  opacity: 0.7;
  cursor: default;
  transform: none;
}
```

Replace with:

```css
.aeroguard-signin .submit:disabled {
  opacity: 0.7;
  cursor: default;
  transform: none;
}

.aeroguard-signin .signin-spin { animation: signin-spin 0.9s linear infinite; }
@keyframes signin-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 2: `BodyMetricsModal.vue` — add the shared spinner (already imports `mobile-ui.css`)**

Find (around line 45-47):

```html
      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        {{ saving ? 'Menyimpan…' : 'Simpan Data Tubuh' }}
      </button>
```

Replace with:

```html
      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Menyimpan…' : 'Simpan Data Tubuh' }}
      </button>
```

Find (around line 214-229, the `.gp-submit` rule) and change `display` so the icon aligns:

```css
.gp-submit {
  margin-top: 24px;
  width: 100%;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 16px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #1c1917;
  box-shadow: 0 16px 32px -16px rgba(17, 18, 20, 0.7);
  transition: all 0.2s ease-in-out;
}
```

Replace with:

```css
.gp-submit {
  margin-top: 24px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 16px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #1c1917;
  box-shadow: 0 16px 32px -16px rgba(17, 18, 20, 0.7);
  transition: all 0.2s ease-in-out;
}
```

- [ ] **Step 3: `GantiPasswordScreen.vue` — add the shared spinner (already imports `mobile-ui.css`)**

Find (around line 63):

```html
      <button class="gp-submit" type="submit" :disabled="!canSubmit">{{ saving ? 'Menyimpan…' : 'Simpan Kata Sandi Baru' }}</button>
```

Replace with:

```html
      <button class="gp-submit" type="submit" :disabled="!canSubmit">
        <svg v-if="saving" class="spin-icon is-spinning" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        {{ saving ? 'Menyimpan…' : 'Simpan Kata Sandi Baru' }}
      </button>
```

Find (around line 238-253, the `.gp-submit` rule in this file) and apply the same flex change as Step 2:

```css
.gp-submit {
  margin-top: 24px;
  width: 100%;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 16px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #1c1917;
  box-shadow: 0 16px 32px -16px rgba(17, 18, 20, 0.7);
  transition: all 0.2s ease-in-out;
}
```

Replace with:

```css
.gp-submit {
  margin-top: 24px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  padding: 15px;
  border-radius: 16px;
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #1c1917;
  box-shadow: 0 16px 32px -16px rgba(17, 18, 20, 0.7);
  transition: all 0.2s ease-in-out;
}
```

- [ ] **Step 4: `StravaAuthorizeScreen.vue` — add a local spinner**

Find (around line 48-50):

```html
        <button class="so-authorize" type="button" :disabled="authorizing || capFull" @click="handleAuthorize">
          {{ authorizing ? 'Menghubungkan…' : 'Otorisasi' }}
        </button>
```

Replace with:

```html
        <button class="so-authorize" type="button" :disabled="authorizing || capFull" @click="handleAuthorize">
          <svg v-if="authorizing" class="so-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          {{ authorizing ? 'Menghubungkan…' : 'Otorisasi' }}
        </button>
```

Find (around line 225-253, the `.so-cancel`/`.so-authorize` rules) and add `display: inline-flex; align-items: center; justify-content: center; gap: 6px;` plus the spin keyframes. Find:

```css
.so-cancel,
.so-authorize {
  flex: 1;
  border: none;
  cursor: pointer;
  padding: 13px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
```

Replace with:

```css
.so-cancel,
.so-authorize {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  padding: 13px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.so-spin { animation: so-spin 0.9s linear infinite; }
@keyframes so-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 5: Verify in the browser**

For each of the 4 screens, trigger its submit action (sign in, save body metrics, change password, authorize Strava) and confirm a spinner now appears alongside the existing "…" text during the async call.

- [ ] **Step 6: Commit**

Leave unstaged for the user.

---

### Task 11: `AdminAnggotaDetailScreen.vue` — migrate to shared spinner class

**Files:**
- Modify: `src/components/AdminAnggotaDetailScreen.vue`

This file already has a working spinner (`.ins-sync-ic.is-spinning` / `@keyframes ins-sync-spin`) and already imports `mobile-ui.css` — this task just switches it to the shared class from Task 1, removing the now-duplicate local keyframes.

- [ ] **Step 1: Switch the icon's class**

Find (around line 75):

```html
          <svg class="ins-sync-ic" :class="{ 'is-spinning': syncingStrava }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
```

Replace with:

```html
          <svg class="ins-sync-ic spin-icon" :class="{ 'is-spinning': syncingStrava }" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
```

(`.ins-sync-ic` is kept for its `flex-shrink: 0` layout rule — only the animation moves to the shared `.spin-icon` class.)

- [ ] **Step 2: Remove the now-duplicate local keyframes**

Find (around line 470-472):

```css
.ins-sync-ic { flex-shrink: 0; }
.ins-sync-ic.is-spinning { animation: ins-sync-spin 0.9s linear infinite; }
@keyframes ins-sync-spin { to { transform: rotate(360deg); } }
```

Replace with:

```css
.ins-sync-ic { flex-shrink: 0; }
```

- [ ] **Step 3: Verify in the browser**

Log in as admin, visit an athlete's detail page (`/admin/anggota/:id`), click "Ambil dari Strava", confirm the icon still spins during the sync (now via the shared class — visually identical to before).

- [ ] **Step 4: Commit**

Leave unstaged for the user.
