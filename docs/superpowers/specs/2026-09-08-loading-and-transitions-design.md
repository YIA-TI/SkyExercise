# Loading States & Page Transitions (Phase 2 of 3: Realtime → Animasi → Redesign)

## Background

Phase 1 (realtime data layer, shipped) made screens update automatically without a manual
refresh. This phase adds the animation/feedback layer on top: page transitions when navigating,
and loading feedback for both passive data fetches and active button interactions. Visual style
for all three was decided interactively via the brainstorming visual companion (mockups compared
live in-browser) — see decisions below.

An audit during brainstorming found the current state has real gaps, not just missing polish:
- `App.vue` wraps `<RouterView>` with no transition at all — route changes are an instant cut.
- Five screens (`HomeScreen`, `PeringkatScreen`, `ProfilScreen`, `AdminAnggotaScreen`,
  `AdminPeringkatScreen`) never reference their composable's `loading` state in the template at
  all — no skeleton, no spinner, nothing. Data just pops in silently.
- Four interactive actions have zero loading feedback: the "Klaim" quest button
  (`LatihanScreen.vue`), the quest active/inactive checkbox toggle, the "Hapus" (delete quest)
  button, and the backfill check (all in `AdminQuestScreen.vue`).
- Some buttons already have decent feedback (text change to "Menyimpan…"/"Sinkronkan…", disabled
  state, and two — `HomeScreen`'s "Sinkronkan" and `AdminAnggotaDetailScreen`'s "Ambil dari
  Strava" — already have a spinning icon, each with its own duplicated inline
  `@keyframes`/`.is-spinning` CSS).

## Decisions (from visual brainstorming)

1. **Page transition:** Fade + Rise. Incoming page fades in while rising from
   `translateY(16px) scale(0.98)` to normal over ~0.35s. `mode="out-in"` (old page fully leaves
   before new one enters) — avoids layout-overlap complexity in this single-column mobile layout.
2. **Passive data loading:** Hybrid. First load (no data yet) shows a skeleton matching the
   content shape (reusing the existing `.mui-skel` shimmer classes already in
   `mobile-ui.css`). Once data exists and a realtime-triggered background refresh fires, show a
   small pulsing-dot "Menyegarkan…" badge instead of re-showing the skeleton — less disruptive
   for something the user didn't ask for.
3. **Button/interactive loading:** Spinner icon. Every mutating action gets a spinning icon in
   its button (or nearest UI affordance) while in flight, button disabled meanwhile. Existing
   text-change feedback ("Menyimpan…" etc.) is kept where present, not removed — the spinner is
   additive, applied everywhere a loading indicator of any kind is currently missing.

## Architecture

### 1. Page transitions
`src/App.vue`: wrap `<RouterView>` in `<Transition name="page" mode="out-in">`. CSS lives in
`App.vue`'s `<style>` block:
```css
.page-enter-active, .page-leave-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(.2,.8,.2,1); }
.page-enter-from { opacity: 0; transform: translateY(16px) scale(0.98); }
.page-leave-to { opacity: 0; }
```
No composable or routing logic changes — this is a pure template/CSS addition in one file.

### 2. Shared spinner utility
Add to `src/assets/mobile-ui.css` (already `@import`-ed by every `mui-`-prefixed screen):
```css
.spin-icon.is-spinning { animation: mui-spin 0.9s linear infinite; }
@keyframes mui-spin { to { transform: rotate(360deg); } }
```
`HomeScreen.vue` and `AdminAnggotaDetailScreen.vue` each currently define their own
`@keyframes .../is-spinning` inline — both get migrated to this shared class as part of this
phase (delete the duplicate, apply `.spin-icon` alongside `.is-spinning`).

### 3. Shared "refreshing" badge
New tiny component `src/components/RefreshingBadge.vue` — a pulsing orange dot + "Menyegarkan…"
text, shown via `v-if="loading && !!data"` (data already exists, this is a background refresh,
not the first load). No props needed beyond a `v-if` at the call site; the component itself has
no logic, just markup + scoped CSS (reuses the `pulse` keyframe pattern already used for
`.lb-league-badge` elsewhere, applied to a small dot).

### 4. Skeleton wiring (5 screens, template-only)
For each of `HomeScreen`, `PeringkatScreen`, `ProfilScreen`, `AdminAnggotaScreen`,
`AdminPeringkatScreen`: add `v-if="loading && !data"` skeleton blocks using `.mui-skel`/
`.mui-skel--text`/`.mui-skel--circle` (already-defined classes, just unused in these 5 files
today) shaped to match each screen's actual content (stat numbers, avatar circles, list rows).
No new CSS classes needed — this is applying an existing pattern to files that don't use it yet.
Add `<RefreshingBadge v-if="loading && data" />` near each screen's header once real data exists.

### 5. Button loading spinners (the 4 gaps + consistency pass)
- `LatihanScreen.vue` — `claim(q)`: add a local `claiming` ref (keyed per-quest-id, since
  multiple quest rows can each have their own claim button), disable the clicked button and show
  `.spin-icon` while its RPC is in flight.
- `AdminQuestScreen.vue` — `toggleActive(q)`: add a per-quest `togglingId` ref, disable the
  checkbox and show a tiny spinner next to it during the `update()` call.
- `AdminQuestScreen.vue` — `hapus(q)`: add a per-quest `deletingId` ref, disable the button and
  show `.spin-icon` during `remove()`.
- `AdminQuestScreen.vue` — `runBackfill(questId)`: this runs automatically after creating/editing
  a dated quest, not from a direct user click — add it to the existing `saving`/`savingDate`
  window (extend the already-shown spinner's duration to cover the backfill call too, so the
  submit/save button doesn't appear "done" while backfill is still silently running after it).
- Consistency pass — add `.spin-icon` alongside the existing text-change on: `SignInScreen`
  (Masuk), `BodyMetricsModal` (Simpan), `GantiPasswordScreen` (Simpan), `StravaAuthorizeScreen`
  (Otorisasi), `AdminQuestScreen` (Tambah Quest submit). Text stays, icon is added.

## Data flow

No backend/database changes in this phase — purely frontend template, CSS, and one new tiny
presentational component. `loading`/`data` already come from Phase 1's `useAsync`; this phase
only adds template code that reads those existing values differently (skeleton vs. badge vs.
button spinner) depending on whether it's a first load or a background refresh.

## Error handling / edge cases

- Per-quest-id loading refs (`claiming`, `togglingId`, `deletingId`) prevent one row's in-flight
  action from disabling every other row's button — only the specific row being acted on shows
  its spinner/disabled state.
- If a button's async action throws, the existing `try/catch/finally` pattern already used
  throughout the codebase (`finally { loading.value = false }`) ensures the spinner always clears,
  success or failure — no new error-handling logic needed, just applying the same shape to the
  4 gap cases that don't have it yet.

## Testing

Manual, consistent with this project's convention (no test framework installed):
- Visually confirm the Fade+Rise transition on at least 3 route changes (e.g. Home → Peringkat,
  admin Monitoring → Quest).
- Confirm each of the 5 skeleton-wired screens shows the skeleton on a hard refresh (clear
  network cache or throttle in devtools if load is too fast to see), then the `RefreshingBadge`
  on a Phase-1-triggered realtime update (reuse the same SQL-trigger technique from Phase 1's
  verification).
- Click each of the 4 previously-zero-feedback actions (Klaim, toggle, Hapus, and trigger a
  backfill via a dated quest) and confirm a spinner appears and the button/control is disabled
  for the duration.

## Out of scope for this phase

- No visual redesign of any screen's colors/layout/typography — that's Phase 3.
- No changes to the realtime data layer itself (Phase 1, already shipped).
