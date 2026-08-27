-- backfill_quest_claims() checks `auth.uid() is not null and not is_admin()` to
-- reject logged-in non-admin athletes, but that check can't distinguish pg_cron
-- (no auth context) from a fully anonymous caller (no auth context either) — both
-- present as auth.uid() = null. Confirmed: the bare anon key could call it and
-- credit XP with zero authentication. Postgres grants EXECUTE to PUBLIC by default
-- on function creation, which Supabase's PostgREST maps to `anon`/`authenticated`.
-- Close it at the grant level: anon can no longer call it at all (blocks the
-- unauthenticated path outright); authenticated keeps access, still gated by the
-- is_admin() check inside; pg_cron is unaffected — it runs as a different DB role
-- entirely, not through PostgREST, so anon/authenticated grants never applied to it.
revoke execute on function backfill_quest_claims(bigint) from public, anon;
grant execute on function backfill_quest_claims(bigint) to authenticated;
