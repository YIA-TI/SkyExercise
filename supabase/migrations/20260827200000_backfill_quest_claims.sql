-- Quest bertanggal (quest_date terisi) hanya muncul di quest_status()/claim_quest()
-- pada hari/minggu targetnya sendiri (lihat migrasi quest_specific_period) — artinya
-- kalau quest dibuat utk tanggal LAMPAU, atlet tidak pernah sempat melihat/klaim-nya
-- walau aktivitas larinya sudah memenuhi target. backfill_quest_claims() menutup
-- celah itu: cek data activities riil pada periode target quest, langsung insert
-- quest_claims (+kredit XP) kalau target sudah tercapai, tanpa perlu klaim manual.
-- Dipanggil admin sesaat setelah membuat/mengubah tanggal quest, dan otomatis via
-- pg_cron tiap beberapa jam supaya sinkron Strava baru pun ikut menutup quest lama.
create or replace function backfill_quest_claims(p_quest_id bigint default null)
returns integer
language plpgsql
security definer
as $$
declare
  v_quest record;
  v_athlete record;
  v_period text;
  v_start timestamptz;
  v_end timestamptz;
  v_progress real;
  v_count integer := 0;
begin
  -- Boleh dipanggil admin (RPC via app) atau sistem/cron (tanpa auth.uid() sama
  -- sekali) — tolak hanya kalau pemanggilnya atlet biasa yang login.
  if auth.uid() is not null and not is_admin() then
    raise exception 'Hanya admin yang boleh memicu backfill';
  end if;

  for v_quest in
    select * from quests
    where active and quest_date is not null
      and (p_quest_id is null or id = p_quest_id)
  loop
    if v_quest.scope = 'harian' then
      v_period := to_char(v_quest.quest_date, 'YYYY-MM-DD');
      v_start  := v_quest.quest_date::timestamp AT TIME ZONE 'Asia/Jakarta';
      v_end    := v_start + interval '1 day';
    else
      v_period := to_char(v_quest.quest_date, 'IYYY-"W"IW');
      v_start  := date_trunc('week', v_quest.quest_date::timestamp) AT TIME ZONE 'Asia/Jakarta';
      v_end    := v_start + interval '7 days';
    end if;

    for v_athlete in select athlete_id from athletes loop
      if exists (
        select 1 from quest_claims
        where athlete_id = v_athlete.athlete_id and quest_id = v_quest.id and period_key = v_period
      ) then
        continue;
      end if;

      -- Beda dgn claim_quest() (yg cuma pakai `>= v_start`, aman krn "now" selalu
      -- di dalam periode saat klaim live) — backfill perlu batas atas eksplisit
      -- (`< v_end`) supaya tidak ikut menghitung aktivitas SETELAH periode lampau itu.
      v_progress := case v_quest.metric
        when 'run_distance' then (select coalesce(sum(distance),0) / 1000.0 from activities
          where athlete_id = v_athlete.athlete_id and sport_type in ('Run','TrailRun','VirtualRun')
            and start_date >= v_start and start_date < v_end)
        when 'run_sessions' then (select count(*) from activities
          where athlete_id = v_athlete.athlete_id and sport_type in ('Run','TrailRun','VirtualRun')
            and start_date >= v_start and start_date < v_end)
        when 'gym_sessions' then (select count(*) from activities
          where athlete_id = v_athlete.athlete_id and sport_type in ('WeightTraining','Workout','Crossfit')
            and start_date >= v_start and start_date < v_end)
        when 'gym_duration' then (select coalesce(sum(moving_time),0) / 60.0 from activities
          where athlete_id = v_athlete.athlete_id and sport_type in ('WeightTraining','Workout','Crossfit')
            and start_date >= v_start and start_date < v_end)
        else 0
      end;

      if v_progress >= v_quest.target then
        insert into quest_claims (athlete_id, quest_id, period_key) values (v_athlete.athlete_id, v_quest.id, v_period);
        insert into athlete_progress (athlete_id, total_xp) values (v_athlete.athlete_id, v_quest.reward)
          on conflict (athlete_id) do update set total_xp = athlete_progress.total_xp + v_quest.reward, updated_at = now();
        v_count := v_count + 1;
      end if;
    end loop;
  end loop;

  return v_count;
end $$;

-- Jalan otomatis 15 menit setelah tiap sinkron Strava terjadwal (strava-sync-all-periodic,
-- tiap 3 jam di menit ke-0) — supaya aktivitas yang baru masuk langsung dicek juga
-- terhadap quest lampau yang belum ke-backfill.
select cron.schedule(
  'backfill-quest-claims-periodic',
  '15 */3 * * *',
  $$select backfill_quest_claims();$$
);
