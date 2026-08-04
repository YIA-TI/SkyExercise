# Database Schema — Strava Monitoring Dashboard

Supabase (Postgres) schema for a **Strava monitoring dashboard** tracking ~70 participants'
**running and gym** activity, consumed by admins.

## Architecture at a glance

- **One Strava API application** (single Client ID / Secret). Each participant authorizes it
  **once** via OAuth — that consent is what grants access to their data.
- **One webhook subscription** for the whole app. Every event carries `owner_id`, which routes
  it to the right participant's stored tokens.
- **Two identity types:**
  - **Participants** — Strava athletes, keyed by `athlete_id`.
  - **Admins** — staff, authenticated via Supabase Auth (email/password), read access across
    *all* participants via RLS.
- **All values are metric.** Strava's API always returns meters and m/s regardless of a user's
  display preference, so no conversion is stored.

```
auth.users ──┬── admins            (staff, email login → read ALL via is_admin())
             └── athletes.user_id  (optional participant self-login)

athletes ─── strava_credentials    (secrets — service-role only, never exposed)
         └── activities            (admin: all · participant: own)

webhook_events                     (idempotency + audit for incoming Strava events)
admin_audit                        (optional: log of admin actions)
```

---

## OAuth scopes

Request the following so full profiles and all activities are visible regardless of each
participant's privacy settings:

```
scope=read,profile:read_all,activity:read_all
```

| Scope | Grants |
|---|---|
| `read` | Public profile + public data |
| `profile:read_all` | Full profile even if visibility is Followers / Only You |
| `activity:read` | Activities visible to Everyone/Followers (no privacy-zone GPS) |
| `activity:read_all` | **All** activities incl. `Only You` visibility + privacy-zone data |

> ⚠️ If you only request `activity:read`, any workout a participant marks "Only You" will
> silently be missing from the dashboard. Use `activity:read_all`.

## Tracked sport types

Filter incoming activities to running + gym only:

```
Running:  'Run', 'TrailRun', 'VirtualRun'
Gym:      'WeightTraining', 'Workout', 'Crossfit'
```

Gym sessions typically have **no** `distance`, `average_speed`, or `total_elevation` — those
columns are nullable on purpose. Gym rows still carry `moving_time`, `average_heartrate`
(if a strap was worn), and `suffer_score`.

---

## Tables

### `athletes` — participant profile

Populated straight from the `athlete` object in the OAuth token-exchange response
(a `SummaryAthlete`), so no extra API call is needed at onboarding.

```sql
create table athletes (
  athlete_id     bigint primary key,          -- Strava id
  username       text,
  firstname      text,
  lastname       text,
  sex            text,                         -- 'M' | 'F'
  city           text,
  country        text,
  weight         real,                         -- kg (context for pace/effort)
  profile_photo  text,                         -- avatar URL (124x124)
  user_id        uuid references auth.users(id), -- optional: participant self-login
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```

### `strava_credentials` — OAuth tokens (secret)

Separated from the profile so RLS can lock it to the backend only. **No select policy is
ever added** — only the service-role key touches this table.

```sql
create table strava_credentials (
  athlete_id     bigint primary key references athletes(athlete_id) on delete cascade,
  access_token   text not null,
  refresh_token  text not null,
  expires_at     timestamptz not null,         -- when access_token dies (~6h)
  scope          text,
  connected_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```

### `activities` — running + gym sessions (metric)

```sql
create table activities (
  activity_id        bigint primary key,       -- Strava activity id
  athlete_id         bigint not null references athletes(athlete_id) on delete cascade,
  name               text,
  sport_type         text not null,            -- see "Tracked sport types"
  start_date         timestamptz not null,     -- UTC
  distance           real,                     -- meters   (null/0 for gym)
  moving_time        integer,                  -- seconds
  elapsed_time       integer,                  -- seconds
  average_speed      real,                     -- m/s      (null for gym) → pace derived
  total_elevation    real,                     -- meters   (null for gym)
  average_heartrate  real,
  max_heartrate      real,
  suffer_score       integer,                  -- relative effort
  fetched_at         timestamptz not null default now()
);

create index activities_athlete_date_idx on activities (athlete_id, start_date desc);
create index activities_sport_idx        on activities (sport_type);
```

> Pace is derived in the app, not stored: `pace_min_per_km = 1000 / average_speed / 60`.

### `webhook_events` — idempotency + audit

Strava can deliver the same event twice; log every event and mark it processed.

```sql
create table webhook_events (
  id            bigint generated always as identity primary key,
  object_type   text,                          -- 'activity' | 'athlete'
  object_id     bigint,                        -- activity or athlete id
  aspect_type   text,                          -- 'create' | 'update' | 'delete'
  owner_id      bigint,                        -- the athlete this is for
  event_time    timestamptz,                   -- Strava's event_time
  received_at   timestamptz not null default now(),
  processed     boolean not null default false
);

create index webhook_events_unprocessed_idx on webhook_events (processed) where processed = false;
```

### `admins` — staff who monitor all participants

Tied to Supabase Auth. Seeded manually — the presence of a row *is* the access gate.

```sql
create table admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'admin',   -- 'admin' | 'superadmin'
  created_at  timestamptz not null default now()
);
```

### `admin_audit` — optional log of admin actions

```sql
create table admin_audit (
  id          bigint generated always as identity primary key,
  admin_id    uuid references admins(id),
  action      text,                            -- 'viewed_participant', 'exported', etc.
  target_id   bigint,                          -- athlete_id acted on
  created_at  timestamptz not null default now()
);
```

---

## Access control (RLS)

### `is_admin()` helper

```sql
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;
```

### Enable RLS

```sql
alter table athletes            enable row level security;
alter table activities          enable row level security;
alter table strava_credentials  enable row level security;  -- no policies = backend-only
alter table admins              enable row level security;
```

### Policies

```sql
-- Admins can check their own admin row
create policy "admin reads own row" on admins
  for select using (id = auth.uid());

-- Admins read every participant profile
create policy "admins read all athletes" on athletes
  for select using (is_admin());

-- Activities: admins see everyone; participants (optional) see only their own
create policy "read activities" on activities
  for select using (
    is_admin()
    or athlete_id in (select athlete_id from athletes where user_id = auth.uid())
  );
```

> If the dashboard is **admin-only** (participants just authorize Strava once and never log in),
> drop `athletes.user_id` and simplify the activities policy to `using (is_admin())`.

---

## Data flows

### Onboarding (once per participant)

```
Participant clicks "Connect with Strava"
  → authorizes app (scope=read,profile:read_all,activity:read_all)
  → Strava redirects back with ?code=...
  → backend POST /oauth/token (exchange code)
  → upsert athletes  (from response.athlete)
  → upsert strava_credentials (access + refresh token, expires_at)
```

```js
// tokenRes = JSON from POST /oauth/token
const a = tokenRes.athlete;

await supabase.from('athletes').upsert({
  athlete_id:    a.id,
  username:      a.username,
  firstname:     a.firstname,
  lastname:      a.lastname,
  sex:           a.sex,
  city:          a.city,
  country:       a.country,
  weight:        a.weight,
  profile_photo: a.profile,
  updated_at:    new Date().toISOString(),
});

await supabase.from('strava_credentials').upsert({
  athlete_id:    a.id,
  access_token:  tokenRes.access_token,
  refresh_token: tokenRes.refresh_token,
  expires_at:    new Date(tokenRes.expires_at * 1000).toISOString(),
  scope:         tokenRes.scope,
  updated_at:    new Date().toISOString(),
});
```

### Webhook ingestion (per new/updated activity)

```
POST /webhook  { object_id: 987, aspect_type: "create", owner_id: 12345 }
  1. insert into webhook_events                          -- log it
  2. look up strava_credentials where athlete_id = 12345
  3. refresh access_token if expires_at < now() + 10min  -- update the row
  4. GET /activities/987 with that token
  5. filter: sport_type in running/gym set, else skip
  6. upsert into activities (onConflict activity_id)     -- dup deliveries harmless
  7. mark webhook_events.processed = true
```

```js
const RUN = ['Run', 'TrailRun', 'VirtualRun'];
const GYM = ['WeightTraining', 'Workout', 'Crossfit'];

if (![...RUN, ...GYM].includes(act.sport_type)) return; // ignore other sports

await supabase.from('activities').upsert({
  activity_id:       act.id,
  athlete_id:        act.athlete.id,
  name:              act.name,
  sport_type:        act.sport_type,
  start_date:        act.start_date,            // ISO UTC
  distance:          act.distance,              // meters
  moving_time:       act.moving_time,
  elapsed_time:      act.elapsed_time,
  average_speed:     act.average_speed,         // m/s
  total_elevation:   act.total_elevation_gain,
  average_heartrate: act.average_heartrate,
  max_heartrate:     act.max_heartrate,
  suffer_score:      act.suffer_score,
}, { onConflict: 'activity_id' });
```

### Token refresh (lazy, per participant)

Access tokens expire every ~6h. Refresh only when needed, and **always save the rotated
refresh token** from the response.

```
Before any Strava call for an athlete:
  if credentials.expires_at < now() + 10min:
    POST /oauth/token (grant_type=refresh_token, refresh_token=stored)
    update strava_credentials with new access_token, refresh_token, expires_at
```

---

## Storage notes

- OAuth tokens are ~400 bytes/user → **~28 KB for all 70**. Negligible.
- Activity **summaries** are ~1–2 KB each → tens of MB/year for 70 people. Comfortably within
  the Supabase free tier (500 MB).
- **Do not** store raw per-second streams (HR/GPS) for every activity — that is the only thing
  that could blow past the free tier. Fetch streams on demand, or store aggregates only.
- Supabase free projects pause after ~1 week of inactivity; regular webhook/refresh traffic
  keeps the project awake.
