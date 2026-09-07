# Realtime Data Layer (Phase 1 of 3: Realtime → Animasi → Redesign)

## Background

The README already claims "admins get a real-time view of everyone's activity" — but every
data hook in the app (`useMemberData.js`, `useAdminData.js`, `useQuests.js`) fetches once on
mount and only refetches on explicit `deps` changes or a manual `refresh()` call. There is no
Supabase Realtime subscription anywhere in the codebase. Admin has to manually re-navigate or
refresh to see new Strava activity synced in via webhook. This phase closes that gap.

This is Phase 1 of a three-part effort (Realtime → Animation → Visual redesign), scoped and
sequenced this way because it's the most self-contained: pure data-layer work, no template/CSS
changes, so it can ship and be verified independently of the other two phases.

## Architecture

`useMemberData.js` and `useAdminData.js` each contain an identical, independently-defined
`useAsync(runner, deps = [])` helper returning `{ data, loading, error, refresh }`. Every
composable in both files builds on its local copy. This is the single point to hook realtime
into:

1. Extract both copies into one shared `src/composables/useAsync.js`.
2. Extend its signature to `useAsync(runner, deps = [], realtimeTables = [])`.
3. When `realtimeTables.length > 0`, on mount open one Supabase Realtime channel
   (`supabase.channel(...)`) subscribed to `postgres_changes` (`event: '*', schema: 'public'`)
   for each named table.
4. On any event, debounce ~600ms (a single Strava sync can insert dozens of activity rows in
   quick succession — one refetch per burst, not one per row) then call the existing `refresh()`.
   No parallel/duplicate fetch logic — realtime just re-triggers the same code path a manual
   refresh already uses.
5. Unsubscribe the channel in `onUnmounted`.

`useQuests.js` has its own bespoke `load()` / `onMounted(load)` pattern, separate from the
shared helper. Fold it onto the same `useAsync` — this both unifies the pattern app-wide and
removes duplicated mount/refresh wiring. `claim()` still calls `load()` (aliased to `refresh`)
directly afterward, unchanged.

## Components touched (call sites → `realtimeTables`)

| Composable | File | `realtimeTables` |
|---|---|---|
| `useProfile` | `useMemberData.js` | `['athletes']` |
| `useHomeStats` | `useMemberData.js` | `['activities']` |
| `useActivities` | `useMemberData.js` | `['activities']` |
| `useActivityDetail` | `useMemberData.js` | `['activities']` |
| `useLeaderboard` | `useMemberData.js` | `['activities', 'athlete_progress']` |
| `useAchievements` | `useMemberData.js` | `['athlete_achievements']` |
| `useQuests` (refactored) | `useQuests.js` | `['activities', 'quest_claims', 'athlete_progress', 'quests']` |
| `useAdminMonitoring` | `useAdminData.js` | `['athletes', 'activities']` |
| `useAdminParticipants` | `useAdminData.js` | `['athletes']` |
| `useAdminParticipantDetail` | `useAdminData.js` | `['athletes', 'activities']` |
| `useQuestSummary` | `useAdminData.js` | `['activities', 'quests', 'quest_claims']` |

No changes to any `.vue` template or service (`*.js` under `services/`) — this phase only
touches the two composable files plus the new shared `useAsync.js`.

## Data flow

Backend mutation (Strava webhook insert into `activities`, admin editing a `quests` row,
`claim_quest()` RPC inserting into `quest_claims`, `check_achievements()` RPC inserting into
`athlete_achievements`, etc.) → Postgres commit → Supabase Realtime broadcasts the change to
subscribed clients whose RLS policy would allow them to `SELECT` that row → matching open
`useAsync` channels debounce then call `refresh()` → existing fetch runs again → `data` ref
updates → Vue reactivity re-renders, no page reload.

## Database changes

Six tables need Realtime replication enabled: `activities`, `athletes`, `athlete_progress`,
`quest_claims`, `quests`, `athlete_achievements`. SQL for this ships as a migration file (per
this repo's convention, `supabase/migrations/` is gitignored and applied manually via the
Supabase SQL Editor — not through CI or `supabase db push`):

```sql
alter publication supabase_realtime add table
  activities, athletes, athlete_progress, quest_claims, quests, athlete_achievements;
```

## Error handling / edge cases

- If a Realtime channel fails to subscribe (network issue, Realtime disabled on a table), the
  composable silently falls back to its existing mount-time fetch — no regression versus today,
  just no live updates until the channel reconnects. `supabase-js` auto-retries channel
  connections; no custom reconnect logic needed.
- Debounce timer is cleared on unmount alongside the channel, so no stray `refresh()` calls fire
  against an unmounted component.

## Known risk to verify after enabling (cannot verify from here — no DB write access)

Realtime's `postgres_changes` enforces the same RLS `SELECT` policies as normal reads, so
`is_admin()`-based and per-athlete scoping should carry over automatically. This must be
confirmed live once replication is enabled on the six tables above — if a participant's session
receives changes for another athlete's row, or an admin's session receives nothing, RLS on
`supabase_realtime` needs adjustment before this ships.

## Testing

- Manual: with two browser sessions open (one admin, one participant), trigger a change (e.g.
  call `strava-sync` for a test athlete, or manually insert a test row via SQL Editor) and
  confirm both relevant open screens update without a manual refresh, within ~1s of the debounce
  window.
- Confirm a participant's open session never receives another athlete's realtime payload
  (RLS check above).
- Confirm unmounting a screen (navigating away) stops further `refresh()` calls — no console
  errors, no channel leak (check via Supabase dashboard's Realtime inspector or a `console.count`
  during dev).

## Out of scope for this phase

- No visual "syncing"/"live" indicator, no animation on data change — data updates silently in
  place. Loading-state and transition animation work is Phase 2.
- No visual redesign of any screen. Phase 3.
