-- Metrik quest baru: durasi gym (menit), dihitung dari sum(activities.moving_time)/60
-- untuk sport_type gym dalam periode quest. Pola sama dengan metrik lain — cukup
-- create-or-replace ulang kedua RPC dengan tambahan cabang 'gym_duration'.

create or replace function quest_status()
returns table (
  id bigint, scope text, title text, description text, metric text,
  target real, unit text, reward integer, sort_order integer,
  progress real, claimed boolean
)
language plpgsql security definer stable as $$
declare
  v_athlete bigint;
  -- jam dinding WIB (naive), dipakai untuk batas hari/minggu
  v_now_wib timestamp := now() AT TIME ZONE 'Asia/Jakarta';
begin
  select athlete_id into v_athlete from athletes where user_id = auth.uid();

  return query
  select q.id, q.scope, q.title, q.description, q.metric, q.target, q.unit, q.reward, q.sort_order,
    (case q.metric
      when 'run_distance' then (
        select coalesce(sum(a.distance),0) / 1000.0 from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('Run','TrailRun','VirtualRun')
          and a.start_date >= (case q.scope
            when 'harian' then date_trunc('day', v_now_wib) AT TIME ZONE 'Asia/Jakarta'
            else date_trunc('week', v_now_wib) AT TIME ZONE 'Asia/Jakarta' end))
      when 'run_sessions' then (
        select count(*) from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('Run','TrailRun','VirtualRun')
          and a.start_date >= (case q.scope
            when 'harian' then date_trunc('day', v_now_wib) AT TIME ZONE 'Asia/Jakarta'
            else date_trunc('week', v_now_wib) AT TIME ZONE 'Asia/Jakarta' end))
      when 'gym_sessions' then (
        select count(*) from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('WeightTraining','Workout','Crossfit')
          and a.start_date >= (case q.scope
            when 'harian' then date_trunc('day', v_now_wib) AT TIME ZONE 'Asia/Jakarta'
            else date_trunc('week', v_now_wib) AT TIME ZONE 'Asia/Jakarta' end))
      when 'gym_duration' then (
        select coalesce(sum(a.moving_time),0) / 60.0 from activities a
        where a.athlete_id = v_athlete
          and a.sport_type in ('WeightTraining','Workout','Crossfit')
          and a.start_date >= (case q.scope
            when 'harian' then date_trunc('day', v_now_wib) AT TIME ZONE 'Asia/Jakarta'
            else date_trunc('week', v_now_wib) AT TIME ZONE 'Asia/Jakarta' end))
      else 0 end)::real,
    exists (
      select 1 from quest_claims c
      where c.athlete_id = v_athlete and c.quest_id = q.id
        and c.period_key = (case q.scope
          when 'harian' then to_char(v_now_wib::date, 'YYYY-MM-DD')
          else to_char(v_now_wib::date, 'IYYY-"W"IW') end)
    )
  from quests q
  where q.active
  order by q.sort_order, q.id;
end $$;

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
  -- jam dinding WIB (naive), dipakai untuk batas hari/minggu
  v_now_wib timestamp := now() AT TIME ZONE 'Asia/Jakarta';
begin
  select athlete_id into v_athlete from athletes where user_id = auth.uid();
  if v_athlete is null then raise exception 'Bukan peserta'; end if;

  select * into v_quest from quests where id = p_quest_id and active;
  if not found then raise exception 'Quest tidak ditemukan'; end if;

  if v_quest.scope = 'harian' then
    v_period := to_char(v_now_wib::date, 'YYYY-MM-DD');
    v_start  := date_trunc('day', v_now_wib) AT TIME ZONE 'Asia/Jakarta';
  else
    v_period := to_char(v_now_wib::date, 'IYYY-"W"IW');
    v_start  := date_trunc('week', v_now_wib) AT TIME ZONE 'Asia/Jakarta';
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
    when 'gym_duration' then (select coalesce(sum(moving_time),0) / 60.0 from activities
      where athlete_id = v_athlete and sport_type in ('WeightTraining','Workout','Crossfit') and start_date >= v_start)
    else 0 end;

  if v_progress < v_quest.target then raise exception 'Target belum tercapai'; end if;

  insert into quest_claims (athlete_id, quest_id, period_key) values (v_athlete, p_quest_id, v_period);
  insert into athlete_progress (athlete_id, total_xp) values (v_athlete, v_quest.reward)
    on conflict (athlete_id) do update set total_xp = athlete_progress.total_xp + v_quest.reward, updated_at = now();

  select total_xp into v_new_xp from athlete_progress where athlete_id = v_athlete;
  return v_new_xp;
end $$;
