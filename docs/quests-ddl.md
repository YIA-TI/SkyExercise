# Quest DDL — Gamifikasi Berbasis Strava

Tabel + RPC untuk fitur **Quest** (progress dihitung otomatis dari aktivitas Strava,
definisi quest dikelola admin). **Jalankan sekali** di Supabase → SQL Editor → Run.

Metric yang didukung: `run_distance` (km), `run_sessions` (jumlah), `gym_sessions` (jumlah).
Scope: `harian` (reset tiap hari) atau `mingguan` (reset tiap pekan, mulai Senin).

```sql
-- 1. QUESTS (definisi — dikelola admin)
create table quests (
  id          bigint generated always as identity primary key,
  scope       text not null,            -- 'harian' | 'mingguan'
  title       text not null,
  description text,
  metric      text not null,            -- 'run_distance' | 'run_sessions' | 'gym_sessions'
  target      real not null,
  unit        text default '',          -- 'km' | 'sesi' | 'x'
  reward      integer not null default 0,
  sort_order  integer default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2. PROGRES XP PESERTA
create table athlete_progress (
  athlete_id bigint primary key references athletes(athlete_id) on delete cascade,
  total_xp   integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. KLAIM QUEST (per periode; cegah klaim ganda)
create table quest_claims (
  id         bigint generated always as identity primary key,
  athlete_id bigint not null references athletes(athlete_id) on delete cascade,
  quest_id   bigint not null references quests(id) on delete cascade,
  period_key text not null,             -- 'YYYY-MM-DD' (harian) | 'IYYY-"W"IW' (mingguan)
  claimed_at timestamptz not null default now(),
  unique (athlete_id, quest_id, period_key)
);

-- 4. RLS
alter table quests           enable row level security;
alter table athlete_progress enable row level security;
alter table quest_claims     enable row level security;

-- quests: semua login boleh baca; hanya admin boleh tulis
create policy "read quests" on quests for select using (true);
create policy "admin write quests" on quests for all using (is_admin()) with check (is_admin());

-- progres & klaim: peserta lihat miliknya, admin lihat semua (tulis lewat RPC saja)
create policy "read own progress" on athlete_progress for select using (
  is_admin() or athlete_id in (select athlete_id from athletes where user_id = auth.uid())
);
create policy "read own claims" on quest_claims for select using (
  is_admin() or athlete_id in (select athlete_id from athletes where user_id = auth.uid())
);

-- 5. RPC quest_status() — daftar quest aktif + progress + status klaim (periode berjalan)
create or replace function quest_status()
returns table (
  id bigint, scope text, title text, description text, metric text,
  target real, unit text, reward integer, sort_order integer,
  progress real, claimed boolean
)
language plpgsql security definer stable as $$
declare v_athlete bigint;
begin
  select athlete_id into v_athlete from athletes where user_id = auth.uid();

  return query
  select q.id, q.scope, q.title, q.description, q.metric, q.target, q.unit, q.reward, q.sort_order,
    (case q.metric
      when 'run_distance' then (
        select coalesce(sum(a.distance),0) / 1000.0 from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('Run','TrailRun','VirtualRun')
          and a.start_date >= (case q.scope when 'harian' then date_trunc('day', now()) else date_trunc('week', now()) end))
      when 'run_sessions' then (
        select count(*) from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('Run','TrailRun','VirtualRun')
          and a.start_date >= (case q.scope when 'harian' then date_trunc('day', now()) else date_trunc('week', now()) end))
      when 'gym_sessions' then (
        select count(*) from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('WeightTraining','Workout','Crossfit')
          and a.start_date >= (case q.scope when 'harian' then date_trunc('day', now()) else date_trunc('week', now()) end))
      else 0 end)::real,
    exists (
      select 1 from quest_claims c
      where c.athlete_id = v_athlete and c.quest_id = q.id
        and c.period_key = (case q.scope when 'harian' then to_char(current_date,'YYYY-MM-DD') else to_char(current_date,'IYYY-"W"IW') end)
    )
  from quests q
  where q.active
  order by q.sort_order, q.id;
end $$;

-- 6. RPC claim_quest() — verifikasi progress server-side, catat klaim, tambah XP
create or replace function claim_quest(p_quest_id bigint)
returns integer
language plpgsql security definer as $$
declare
  v_athlete bigint;
  v_quest quests%rowtype;
  v_period text;
  v_start timestamptz;
  v_progress real;
  v_new_xp integer;
begin
  select athlete_id into v_athlete from athletes where user_id = auth.uid();
  if v_athlete is null then raise exception 'Bukan peserta'; end if;

  select * into v_quest from quests where id = p_quest_id and active;
  if not found then raise exception 'Quest tidak ditemukan'; end if;

  if v_quest.scope = 'harian' then
    v_period := to_char(current_date, 'YYYY-MM-DD');
    v_start  := date_trunc('day', now());
  else
    v_period := to_char(current_date, 'IYYY-"W"IW');
    v_start  := date_trunc('week', now());
  end if;

  if exists (select 1 from quest_claims where athlete_id = v_athlete and quest_id = p_quest_id and period_key = v_period) then
    raise exception 'Sudah diklaim periode ini';
  end if;

  v_progress := case v_quest.metric
    when 'run_distance' then (select coalesce(sum(distance),0) / 1000.0 from activities
      where athlete_id = v_athlete and sport_type in ('Run','TrailRun','VirtualRun') and start_date >= v_start)
    when 'run_sessions' then (select count(*) from activities
      where athlete_id = v_athlete and sport_type in ('Run','TrailRun','VirtualRun') and start_date >= v_start)
    when 'gym_sessions' then (select count(*) from activities
      where athlete_id = v_athlete and sport_type in ('WeightTraining','Workout','Crossfit') and start_date >= v_start)
    else 0 end;

  if v_progress < v_quest.target then raise exception 'Target belum tercapai'; end if;

  insert into quest_claims (athlete_id, quest_id, period_key) values (v_athlete, p_quest_id, v_period);
  insert into athlete_progress (athlete_id, total_xp) values (v_athlete, v_quest.reward)
    on conflict (athlete_id) do update set total_xp = athlete_progress.total_xp + v_quest.reward, updated_at = now();

  select total_xp into v_new_xp from athlete_progress where athlete_id = v_athlete;
  return v_new_xp;
end $$;

-- 7. SEED contoh quest (boleh diubah admin nanti)
insert into quests (scope, title, description, metric, target, unit, reward, sort_order) values
  ('harian',   'Lari 5 KM',         'Selesaikan lari 5 km hari ini.',        'run_distance', 5,  'km',   150, 1),
  ('harian',   'Lari 1 Sesi',       'Lakukan minimal 1 sesi lari hari ini.', 'run_sessions', 1,  'sesi', 80,  2),
  ('mingguan', 'Lari Total 20 KM',  'Akumulasi jarak lari minggu ini.',      'run_distance', 20, 'km',   400, 3),
  ('mingguan', '4 Sesi Gym',        'Latihan kekuatan 4x minggu ini.',       'gym_sessions', 4,  'sesi', 350, 4);
```
