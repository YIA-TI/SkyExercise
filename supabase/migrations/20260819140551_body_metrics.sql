-- Body metrics (weight/height) manual input -> BMI monitoring.
-- `athletes.weight` (existing column) is repurposed to hold the current
-- manually-maintained value; the one-time Strava sync at OAuth connect only
-- serves as an initial default and does not run again afterwards.

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
