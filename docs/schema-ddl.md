# Schema DDL — SkyExcercise (Strava Monitoring)

DDL lengkap untuk Supabase (Postgres). **Cara pakai:** buka Supabase → **SQL Editor** →
**New query** → copy seluruh blok SQL di bawah → **Run**. Jalankan **sekali** saja.

Referensi rinci tiap tabel/kolom ada di [`database-schema.md`](./database-schema.md).
Field yang tersedia dari Strava ada di [`strava-data-fields.md`](./strava-data-fields.md).

> Setelah dijalankan, verifikasi di **Table Editor**: harus muncul 6 tabel
> (`athletes`, `strava_credentials`, `activities`, `webhook_events`, `admins`, `admin_audit`)
> dan RLS aktif (ikon 🔒) di masing-masing.

```sql
-- ============================================================
-- SkyExcercise — Strava Monitoring (jalankan SEKALI)
-- ============================================================

-- 1. ATHLETES (profil peserta)
create table athletes (
  athlete_id     bigint primary key,
  username       text,
  firstname      text,
  lastname       text,
  sex            text,
  city           text,
  country        text,
  weight         real,
  profile_photo  text,
  user_id        uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 2. STRAVA CREDENTIALS (RAHASIA — backend only, tanpa policy)
create table strava_credentials (
  athlete_id     bigint primary key references athletes(athlete_id) on delete cascade,
  access_token   text not null,
  refresh_token  text not null,
  expires_at     timestamptz not null,
  scope          text,
  connected_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3. ACTIVITIES (lari + gym; semua metrik)
create table activities (
  activity_id        bigint primary key,
  athlete_id         bigint not null references athletes(athlete_id) on delete cascade,
  name               text,
  sport_type         text not null,
  start_date         timestamptz not null,
  distance           real,
  moving_time        integer,
  elapsed_time       integer,
  average_speed      real,
  total_elevation    real,
  average_heartrate  real,
  max_heartrate      real,
  suffer_score       integer,
  calories           real,
  fetched_at         timestamptz not null default now()
);
create index activities_athlete_date_idx on activities (athlete_id, start_date desc);
create index activities_sport_idx        on activities (sport_type);

-- 4. WEBHOOK EVENTS (idempotensi + audit)
create table webhook_events (
  id            bigint generated always as identity primary key,
  object_type   text,
  object_id     bigint,
  aspect_type   text,
  owner_id      bigint,
  event_time    timestamptz,
  received_at   timestamptz not null default now(),
  processed     boolean not null default false
);
create index webhook_events_unprocessed_idx on webhook_events (processed) where processed = false;

-- 5. ADMINS (staf pemantau — Supabase Auth)
create table admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);

-- 6. ADMIN AUDIT (opsional)
create table admin_audit (
  id          bigint generated always as identity primary key,
  admin_id    uuid references admins(id),
  action      text,
  target_id   bigint,
  created_at  timestamptz not null default now()
);

-- 7. HELPER is_admin()
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

-- 8. AKTIFKAN RLS
alter table athletes           enable row level security;
alter table activities         enable row level security;
alter table strava_credentials enable row level security;  -- tanpa policy = backend only
alter table admins             enable row level security;
alter table admin_audit        enable row level security;

-- 9. POLICIES
create policy "admin reads own row" on admins
  for select using (id = auth.uid());

create policy "read athletes" on athletes
  for select using ( is_admin() or user_id = auth.uid() );

create policy "read activities" on activities
  for select using (
    is_admin()
    or athlete_id in (select athlete_id from athletes where user_id = auth.uid())
  );

create policy "admin reads audit" on admin_audit
  for select using (is_admin());

-- 10. RPC LEADERBOARD (security definer → agregat lintas peserta tanpa membuka RLS)
create or replace function leaderboard_distance(period_start timestamptz)
returns table (athlete_id bigint, name text, total real)
language sql security definer stable as $$
  select a.athlete_id,
         trim(coalesce(a.firstname,'') || ' ' || coalesce(a.lastname,'')) as name,
         coalesce(sum(act.distance), 0)::real as total
  from athletes a
  left join activities act
    on act.athlete_id = a.athlete_id
   and act.sport_type in ('Run','TrailRun','VirtualRun')
   and act.start_date >= period_start
  group by a.athlete_id, a.firstname, a.lastname
  order by total desc;
$$;

create or replace function leaderboard_effort(period_start timestamptz)
returns table (athlete_id bigint, name text, total bigint)
language sql security definer stable as $$
  select a.athlete_id,
         trim(coalesce(a.firstname,'') || ' ' || coalesce(a.lastname,'')) as name,
         coalesce(sum(act.suffer_score), 0)::bigint as total
  from athletes a
  left join activities act
    on act.athlete_id = a.athlete_id
   and act.start_date >= period_start
  group by a.athlete_id, a.firstname, a.lastname
  order by total desc;
$$;
```

## Seed 1 admin (setelah DDL)

Login admin memakai Supabase Auth, jadi butuh 1 user + baris di `admins`:

1. **Authentication → Users → Add user** (email + password).
2. Copy **UUID** user tersebut.
3. Jalankan di SQL Editor (ganti nilainya):

```sql
insert into admins (id, email, full_name)
values ('<uuid-user-tadi>', 'admin@injourneyairports.id', 'Rahmat Hidayat');
```
