-- Sinkron periodik semua atlet Strava — sementara sampai webhook push subscription
-- bisa dipakai (app masih menunggu review Strava, lihat strava-subscription).
-- Ekstensi saja di sini; jadwal cron ada di migrasi berikutnya (pakai Vault, bukan
-- secret literal di file migrasi).
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
