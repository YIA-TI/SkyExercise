# Realtime Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every admin and participant screen update automatically when the underlying data changes (new Strava activity synced, quest claimed, achievement unlocked, roster edited) — no manual refresh needed.

**Architecture:** Both `useMemberData.js` and `useAdminData.js` currently contain an identical, independently-defined `useAsync(runner, deps)` helper. Extract one shared version into `src/composables/useAsync.js`, extend it to accept an optional `realtimeTables` array, and have it open a Supabase Realtime channel per table that calls the existing `refresh()` (debounced) on any change. Every composable in the app funnels through this one helper, so this is the only place realtime logic needs to live.

**Tech Stack:** Vue 3 Composition API, `@supabase/supabase-js` v2 Realtime (`postgres_changes`).

**Note on verification approach:** This codebase has no test runner installed (no vitest/jest, no `tests/` directory — confirmed via `package.json`). Every existing feature in this repo has shipped via manual/live verification, not automated tests. Introducing a full test framework (including mocking WebSocket-based Realtime channels, which is non-trivial) is out of scope for this feature and would be a separate decision for the user to make. Verification steps below use the dev server + direct SQL triggers instead of automated tests, consistent with existing project convention.

---

### Task 1: Create the shared `useAsync` composable

**Files:**
- Create: `src/composables/useAsync.js`

- [ ] **Step 1: Write the shared composable**

```js
// src/composables/useAsync.js
// Hook data generik: bungkus fetch async jadi reaktif { data, loading, error, refresh }.
// realtimeTables (opsional): daftar nama tabel Postgres — kalau diisi, langganan Supabase
// Realtime dibuka saat mount, dan tiap ada perubahan (insert/update/delete) di salah satu
// tabel itu, `refresh()` dipanggil ulang otomatis (debounce ~600ms, supaya satu batch
// sinkron Strava yang insert banyak baris cuma memicu satu refetch, bukan puluhan).
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../lib/supabase.js'

let channelSeq = 0

export function useAsync(runner, deps = [], realtimeTables = []) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      data.value = await runner()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)
  if (deps.length) watch(deps, refresh)

  if (realtimeTables.length) {
    let debounceTimer = null
    const channel = supabase.channel(`useAsync-${++channelSeq}`)
    realtimeTables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(refresh, 600)
      })
    })
    channel.subscribe()

    onUnmounted(() => {
      clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    })
  }

  return { data, loading, error, refresh }
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

Run: `cd "D:\porto\SkyExcercise" && node --check src/composables/useAsync.js 2>&1 || echo "SKIP: node --check does not support ESM import syntax, this is expected"`
Expected: Either passes, or fails only on the `import`/`export` syntax (which `node --check` doesn't support for `.js` files outside a module context) — not on any other syntax error. If you see any error mentioning something other than `import`/`export`/`Unexpected token`, fix it before continuing.

- [ ] **Step 3: Commit**

```bash
cd "D:\porto\SkyExcercise" && git add src/composables/useAsync.js && git commit -m "feat: add shared useAsync composable with optional realtime support"
```

---

### Task 2: Wire `useMemberData.js` onto the shared `useAsync` + realtime tables

**Files:**
- Modify: `src/composables/useMemberData.js`

- [ ] **Step 1: Replace the file's local `useAsync` with the shared one, and add `realtimeTables` to every call site**

Replace the entire contents of `src/composables/useMemberData.js` with:

```js
// src/composables/useMemberData.js
// Hook data peserta — bungkus service jadi reaktif { data, loading, error, refresh }.
import { unref } from 'vue'
import { authState } from '../store/auth.js'
import { fetchProfile } from '../services/profile.js'
import { fetchHomeStats } from '../services/stats.js'
import { fetchActivities, fetchActivityDetail } from '../services/activities.js'
import { fetchDistanceLeaderboard, fetchEffortLeaderboard, fetchLeagueLeaderboard, fetchRosterAvatars } from '../services/leaderboard.js'
import { tierForRank } from '../lib/leagueTier.js'
import { fetchMyAchievements, checkAchievements } from '../services/achievements.js'
import { useAsync } from './useAsync.js'

export function useProfile(athleteId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchProfile(unref(athleteId) ?? authState.athleteId),
    [],
    ['athletes'],
  )
  return { profile: data, loading, error, refresh }
}

export function useHomeStats() {
  const { data, loading, error, refresh } = useAsync(
    () => fetchHomeStats(authState.athleteId),
    [],
    ['activities'],
  )
  return { stats: data, loading, error, refresh }
}

// filter: ref/getter → 'Semua' | 'Lari' | 'Gym'
export function useActivities(filter) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivities({ athleteId: authState.athleteId, filter: unref(filter) ?? 'Semua' }),
    [() => unref(filter)],
    ['activities'],
  )
  return { activities: data, loading, error, refresh }
}

export function useActivityDetail(activityId) {
  const { data, loading, error, refresh } = useAsync(
    () => fetchActivityDetail(unref(activityId)),
    [() => unref(activityId)],
    ['activities'],
  )
  return { activity: data, loading, error, refresh }
}

// mode: ref/getter → 'running' | 'effort' | 'league'
// leaguePeriod: ref/getter → 'weekly' | 'monthly' (cuma dipakai saat mode === 'league')
export function useLeaderboard(mode, leaguePeriod) {
  const { data, loading, error, refresh } = useAsync(async () => {
    const m = unref(mode)
    if (m === 'league') {
      const rows = await fetchLeagueLeaderboard(unref(leaguePeriod) || 'monthly')
      return rows.map((r, i) => ({ ...r, rank: i + 1, tier: tierForRank(i + 1, rows.length) }))
    }
    const rows = m === 'effort' ? await fetchEffortLeaderboard() : await fetchDistanceLeaderboard()
    const avatarMap = await fetchRosterAvatars()
    return rows.map((r) => ({ ...r, avatar: avatarMap.get(r.athleteId) ?? null }))
  }, [() => unref(mode), () => unref(leaguePeriod)], ['activities', 'athlete_progress'])
  return { rows: data, loading, error, refresh }
}

// Katalog 12 achievement + status unlock milik atlet yang login.
export function useAchievements() {
  const { data, loading, error, refresh } = useAsync(fetchMyAchievements, [], ['athlete_achievements'])
  return { achievements: data, loading, error, refresh }
}

// Evaluasi ulang kriteria (RPC) — dipanggil imperatif (mis. saat Home dimuat),
// balikannya cuma achievement yang BARU unlock, dipakai utk toast perayaan.
export { checkAchievements }
```

- [ ] **Step 2: Start the dev server and verify no regression**

Run: `cd "D:\porto\SkyExcercise" && npm run dev` (background)
Then open `http://localhost:5173` in a browser, log in as a participant, and visit Home, Latihan (activity list), Peringkat (leaderboard). Confirm all three still show data and there are no red errors in the browser console.

- [ ] **Step 3: Commit**

```bash
cd "D:\porto\SkyExcercise" && git add src/composables/useMemberData.js && git commit -m "feat: wire realtime tables into member data composables"
```

---

### Task 3: Wire `useAdminData.js` onto the shared `useAsync` + realtime tables

**Files:**
- Modify: `src/composables/useAdminData.js`

- [ ] **Step 1: Replace the file's local `useAsync` with the shared one, and add `realtimeTables` to every call site**

Replace the entire contents of `src/composables/useAdminData.js` with:

```js
// src/composables/useAdminData.js
// Hook data admin (butuh sesi admin; RLS is_admin()).
import { unref } from 'vue'
import {
  fetchDivisionSummary,
  fetchParticipants,
  fetchParticipantDetail,
} from '../services/admin.js'
import { fetchQuestSummary } from '../services/questSummary.js'
import { useAsync } from './useAsync.js'

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminMonitoring(range = {}) {
  const { start, end } = range
  const summary = useAsync(
    () => fetchDivisionSummary({ start: unref(start), end: unref(end) }),
    [() => unref(start), () => unref(end)],
    ['athletes', 'activities'],
  )
  return {
    summary: summary.data,
    loading: summary.loading,
    error: summary.error,
    refresh: summary.refresh,
  }
}

export function useAdminParticipants() {
  const { data, loading, error, refresh } = useAsync(fetchParticipants, [], ['athletes'])
  return { participants: data, loading, error, refresh }
}

// range: { start, end } — ref/getter opsional 'YYYY-MM-DD'. Kosong = default 7 hari terakhir.
export function useAdminParticipantDetail(athleteId, range = {}) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchParticipantDetail(unref(athleteId), { start: unref(start), end: unref(end) }),
    [() => unref(athleteId), () => unref(start), () => unref(end)],
    ['athletes', 'activities'],
  )
  return { detail: data, loading, error, refresh }
}

// range: { start, end } — ref/getter wajib 'YYYY-MM-DD' (dipakai hitung daftar minggu ISO).
export function useQuestSummary(range) {
  const { start, end } = range
  const { data, loading, error, refresh } = useAsync(
    () => fetchQuestSummary(unref(start), unref(end)),
    [() => unref(start), () => unref(end)],
    ['activities', 'quests', 'quest_claims'],
  )
  return { summary: data, loading, error, refresh }
}
```

- [ ] **Step 2: Verify no regression in the admin screens**

With the dev server still running, log in as admin and visit `/admin` (AdminMonitoringScreen), `/admin/anggota` (AdminAnggotaScreen), `/admin/peringkat` (AdminPeringkatScreen). Confirm all still show data and there are no console errors.

- [ ] **Step 3: Commit**

```bash
cd "D:\porto\SkyExcercise" && git add src/composables/useAdminData.js && git commit -m "feat: wire realtime tables into admin data composables"
```

---

### Task 4: Refactor `useQuests.js` onto the shared `useAsync`

**Files:**
- Modify: `src/composables/useQuests.js`

This removes the last bespoke `ref`/`onMounted` data-fetch pattern in the codebase, unifying everything onto one helper. The external API (`quests`, `totalXp`, `streak`, `loading`, `error`, `claim`, `refresh`) stays identical — confirmed via `grep` that `LatihanScreen.vue` is the only consumer, and it only reads `.value` off each of these, which works identically whether they're `ref` or `computed`.

- [ ] **Step 1: Replace the entire file**

```js
// src/composables/useQuests.js
// Quest peserta: progress dihitung server-side (RPC quest_status), klaim via RPC claim_quest.
// Streak dihitung dari tanggal aktivitas nyata.
import { computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { authState } from '../store/auth.js'
import { useAsync } from './useAsync.js'

// Hitung streak: jumlah hari berturut-turut (mundur dari hari ini / kemarin) yang ada aktivitas.
function computeStreak(dates) {
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)))
  let streak = 0
  const cursor = new Date()
  // Toleransi: kalau hari ini belum ada tapi kemarin ada, streak tetap lanjut dari kemarin.
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

async function loadQuestsData() {
  const [{ data: qs, error: qErr }, { data: prog }, { data: acts }] = await Promise.all([
    supabase.rpc('quest_status'),
    supabase.from('athlete_progress').select('total_xp').eq('athlete_id', authState.athleteId).maybeSingle(),
    supabase.from('activities').select('start_date').eq('athlete_id', authState.athleteId)
      .order('start_date', { ascending: false }).limit(90),
  ])
  if (qErr) throw qErr
  return {
    quests: qs ?? [],
    totalXp: prog?.total_xp ?? 0,
    streak: computeStreak((acts ?? []).map((a) => a.start_date)),
  }
}

export function useQuests() {
  const { data, loading, error, refresh } = useAsync(
    loadQuestsData,
    [],
    ['activities', 'quest_claims', 'athlete_progress', 'quests'],
  )

  const quests = computed(() => data.value?.quests ?? [])
  const totalXp = computed(() => data.value?.totalXp ?? 0)
  const streak = computed(() => data.value?.streak ?? 0)

  async function claim(questId) {
    const { data: xp, error: cErr } = await supabase.rpc('claim_quest', { p_quest_id: questId })
    if (cErr) throw cErr
    await refresh()
    return xp // total_xp baru
  }

  return { quests, totalXp, streak, loading, error, claim, refresh }
}
```

- [ ] **Step 2: Verify Latihan screen and quest claiming still work**

With the dev server running, log in as a participant, visit `/latihan`, confirm the quest list, XP total, and streak all still render. If any quest is claimable, claim one and confirm XP updates.

- [ ] **Step 3: Commit**

```bash
cd "D:\porto\SkyExcercise" && git add src/composables/useQuests.js && git commit -m "refactor: unify useQuests onto shared useAsync composable"
```

---

### Task 5: Enable Realtime replication and verify live updates end-to-end

**Files:**
- Create: `supabase/migrations/20260908000000_enable_realtime.sql` (gitignored per this repo's convention — created locally for the record, not committed; see `.gitignore` line `supabase/migrations/`)

- [ ] **Step 1: Write the migration file**

```sql
-- Enable Supabase Realtime replication on the six tables the Phase 1 realtime
-- data layer subscribes to (see docs/superpowers/specs/2026-09-08-realtime-data-layer-design.md).
-- Without this, postgres_changes events never fire and useAsync's realtime
-- subscriptions silently do nothing (falls back to mount-time fetch only).
alter publication supabase_realtime add table
  activities, athletes, athlete_progress, quest_claims, quests, athlete_achievements;
```

- [ ] **Step 2: Run it yourself in the Supabase Dashboard SQL Editor**

This requires your Supabase login — paste the SQL from Step 1 into the SQL Editor and run it. Confirm it returns success (if any table is already added to the publication, Postgres will error "relation already member of publication" for that one table — re-run with just the remaining tables in that case).

- [ ] **Step 3: Live verification — participant screen auto-updates**

With the dev server running and a participant logged in on `/latihan` (or `/peringkat`), open the Supabase SQL Editor in a second window and run an INSERT against `activities` for that same `athlete_id` (use a harmless test row, e.g. `sport_type: 'Run'`, `distance: 1000`, `start_date: now()`). Within ~1 second, confirm the browser screen updates on its own — no manual refresh.

- [ ] **Step 4: Live verification — admin screen auto-updates**

Same as Step 3, but with an admin logged in on `/admin`. Confirm the division summary / participant list updates within ~1 second of the same test INSERT (or a change to the `athletes` table, e.g. editing a test participant's `city`).

- [ ] **Step 5: Live verification — RLS scoping (the risk flagged in the design spec)**

With two participant sessions open (two different `athlete_id`s, or one participant + one admin), confirm that a change to participant A's row does **not** trigger a visible update on participant B's own personal screens (e.g. B's `/latihan` should not refetch from A's activity insert) — only B's own data and any admin-wide views should react. If B's screen *does* react to A's data, the RLS policy on the affected table needs a per-athlete restriction before this ships to real users — stop and flag this rather than proceeding.

- [ ] **Step 6: Verify unmounting stops the subscription (no channel leak)**

With the browser devtools console open, navigate from `/latihan` to `/home` (unmounting the `useQuests` subscription), then repeat the test INSERT from Step 3 against `activities` for that athlete. Confirm no error appears in the console (e.g. "channel already removed" or similar) and that `/home`'s own `useHomeStats` subscription still reacts normally — the old screen's channel should be gone, not still firing.

- [ ] **Step 7: Clean up the test row**

Delete the test activity row created in Step 3 via the SQL Editor, and confirm the screens update again to remove it (same realtime path, DELETE event this time).

- [ ] **Step 8: Run the project formatter**

Run: `cd "D:\porto\SkyExcercise" && npm run format`
Expected: no errors; this reformats the four files touched in Tasks 1–4 to match project style if anything drifted.

- [ ] **Step 9: Final commit**

```bash
cd "D:\porto\SkyExcercise" && git add -A && git commit -m "chore: format realtime data layer changes" --allow-empty
```
(Use `--allow-empty` in case `npm run format` made no changes — otherwise commit whatever it reformatted.)
