# Weight/Height Input → BMI Monitoring — Design

## Context

Participants' `weight` is currently synced once from Strava at OAuth connect time and is
read-only in the app. There is no `height` field. Admins want to monitor body mass index
(BMI) per participant, which requires both values kept current — not a one-time Strava
snapshot.

## Goals

- Participants can manually enter/update their weight (kg) and height (cm) from Profil.
- Weight still pre-fills from Strava's synced value when available, as a convenience default
  — but the manually entered value is what's used and stored going forward.
- BMI is calculated from weight + height and shown to the participant (own Profil) and to
  admins (Detail Anggota).
- First-time participants are blocked from the rest of the app until weight + height are set.
- After that, a weekly non-blocking reminder nudges participants to keep weight current
  (height doesn't change, so it's excluded from the reminder).

## Non-goals

- No BMI column/filter in the admin roster list (`AdminAnggotaScreen`) — out of scope for
  this iteration.
- No historical BMI/weight trend chart — only the current value + category.
- No change to how Strava populates `athletes.weight` at OAuth connect time.

## Data model

New migration: `supabase/migrations/<timestamp>_body_metrics.sql`

```sql
alter table athletes
  add column if not exists height real,              -- cm
  add column if not exists weight_updated_at timestamptz;

-- RPC: peserta memperbarui berat/tinggi sendiri (pola sama dengan claim_quest).
-- Tanpa policy UPDATE langsung di athletes — semua tulis lewat RPC ini saja.
create or replace function update_my_body_metrics(p_weight real, p_height real)
returns void
language plpgsql security definer as $$
declare
  v_athlete bigint;
begin
  select athlete_id into v_athlete from athletes where user_id = auth.uid();
  if v_athlete is null then
    raise exception 'Bukan peserta';
  end if;

  if p_weight is null or p_weight <= 0 or p_height is null or p_height <= 0 then
    raise exception 'Berat/tinggi tidak valid';
  end if;

  update athletes
    set weight = p_weight,
        height = p_height,
        weight_updated_at = now(),
        updated_at = now()
    where athlete_id = v_athlete;
end $$;
```

`athletes.weight` (existing column, currently only Strava-populated) is repurposed to hold
the current manually-maintained value. `strava-oauth`'s one-time upsert at connect is
unaffected — it only runs once, so it can't clobber a later manual edit under normal use.

## BMI calculation

Pure functions added to `src/lib/normalize.js`:

```js
export function calcBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return +(weightKg / (heightM * heightM)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Kurus'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Gemuk'
  return 'Obesitas'
}
```

Standard WHO adult BMI ranges. Computed client-side from `profile.weight`/`profile.height` —
not persisted.

## Frontend flow

**New screen** `src/components/BodyMetricsScreen.vue`, route `/profil/data-tubuh`
(`meta: { requiresAuth: true, role: 'anggota' }`):
- Form: weight (kg) input, height (cm) input.
- Weight pre-fills from `profile.weight` if present (Strava default); height starts empty.
- Submit calls new `updateBodyMetrics(weight, height)` in `src/services/profile.js`, which
  invokes the `update_my_body_metrics` RPC, then refreshes `useProfile` and re-resolves
  `authState` so the onboarding gate clears.
- On success: navigate to originally-intended route (or `/home` if none), matching the
  existing `SignIn` redirect pattern.

**`src/store/auth.js`** — extend the `athletes` select in `resolveRole` to include
`weight, height, weight_updated_at`, and derive:
- `state.needsBodyMetrics` — `true` if `height` or `weight` is null.
- `state.needsWeightReminder` — `true` if `weight_updated_at` is null or older than 7 days.

**`src/router/index.js`** — in `router.beforeEach`, after the existing role check: if
`authState.userRole === 'anggota'` and `authState.needsBodyMetrics` and `to.name !==
'BodyMetrics'`, redirect to `{ name: 'BodyMetrics' }`. This blocks every other participant
route (including `Home`) until the form is submitted once.

**`src/components/HomeScreen.vue`** — non-blocking banner shown when
`authState.needsWeightReminder` is true: "Sudah 7 hari — update berat badan kamu," linking to
`/profil/data-tubuh`. Dismissible for the current session only (local `ref`, not persisted);
reappears next visit if still stale.

**`src/components/ProfilScreen.vue`**:
- "Informasi Diri" grid gains a Tinggi Badan (height) row.
- Quick-stats row gains a BMI tile (value + category badge).
- A new "Edit Data Tubuh" entry (in the Akun list, alongside "Ganti Password") links to
  `/profil/data-tubuh` for updates any time, not just onboarding.

**`src/components/AdminAnggotaDetailScreen.vue`** — quick-stats row gains a BMI tile.
`fetchParticipantDetail` already does `select('*')` on `athletes`, so `height`/`weight` are
already returned; only the computed tile is new.

## Error handling

- RPC raises on invalid (`<= 0` or missing) weight/height — surfaced as an inline form error,
  same pattern as `AdminQuestScreen`'s `formError`.
- If `useProfile`'s fetch fails after submit, the router guard re-checks on next navigation
  rather than trusting a stale local flag.

## Testing

- Manual verification (no test framework in this project): connect a fresh Strava account,
  confirm forced redirect to `/profil/data-tubuh`, submit, confirm redirect clears and BMI
  tile renders correctly on Profil and Admin Detail Anggota. Verify the weekly banner logic
  by manually backdating `weight_updated_at` in Supabase.
