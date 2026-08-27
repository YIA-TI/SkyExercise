-- Perbaikan: migrasi sebelumnya sempat menjadwalkan strava-sync-all-periodic dengan
-- secret literal di headers net.http_post (tersimpan plaintext di cron.job). Ganti
-- ke Vault — nilainya dibangkitkan Postgres sendiri (gen_random_bytes), tak pernah
-- keluar sebagai teks biasa di migrasi/log manapun. Edge Function memverifikasi
-- lewat RPC verify_strava_cron_secret(), bukan Deno.env — jadi tak perlu secret
-- statis di sisi Edge Function sama sekali.
select cron.unschedule('strava-sync-all-periodic');

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'strava_cron_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'strava_cron_secret',
      'Shared secret dipakai pg_cron utk memicu Edge Function strava-sync-all'
    );
  end if;
end $$;

create or replace function verify_strava_cron_secret(p_secret text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'strava_cron_secret' and decrypted_secret = p_secret
  );
$$;

-- RPC ini cuma dipanggil pakai service-role key (dari Edge Function strava-sync-all),
-- jadi cukup revoke akses publik — tak perlu terekspos ke anon/authenticated.
revoke all on function verify_strava_cron_secret(text) from public, anon, authenticated;

select
  cron.schedule(
    'strava-sync-all-periodic',
    '0 */3 * * *', -- tiap 3 jam
    $$
    select net.http_post(
      url := 'https://pcdhgpeglcdxbzjtagfn.supabase.co/functions/v1/strava-sync-all',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'strava_cron_secret')
      ),
      body := '{}'::jsonb
    );
    $$
  );
