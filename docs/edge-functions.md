# Edge Functions — Deploy & Webhook Strava

Empat Edge Function di `supabase/functions/`:

| Fungsi | Peran |
|---|---|
| `strava-oauth` | Tukar OAuth code → token, upsert profil+kredensial, provisi user peserta, balikkan magic-link. |
| `strava-disconnect` | Deauthorize di Strava + hapus kredensial. |
| `strava-webhook` | Verifikasi subscription (GET) + terima event (POST) → upsert aktivitas. |
| `strava-sync` | Backfill/sinkron manual aktivitas terbaru seorang atlet. |

## 1. Deploy

```bash
npx supabase functions deploy strava-oauth
npx supabase functions deploy strava-disconnect
npx supabase functions deploy strava-webhook --no-verify-jwt   # webhook dipanggil Strava (tanpa JWT)
npx supabase functions deploy strava-sync
```

> `strava-webhook` **wajib** `--no-verify-jwt` karena dipanggil server Strava (bukan user login).
> Fungsi lain aman dengan verifikasi default (dipanggil FE dgn anon key).

URL fungsi: `https://<ref>.functions.supabase.co/<nama-fungsi>`.

## 2. Secrets (sekali)

```bash
npx supabase secrets set STRAVA_CLIENT_ID=xxxxx
npx supabase secrets set STRAVA_CLIENT_SECRET=xxxxxxxx
npx supabase secrets set STRAVA_WEBHOOK_VERIFY_TOKEN=<string-bebas>
```

`SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` otomatis tersedia di runtime — tidak perlu di-set.

## 3. Daftarkan Webhook Subscription (SEKALI untuk seluruh app)

Ganti nilai lalu jalankan:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://<ref>.functions.supabase.co/strava-webhook \
  -F verify_token=<string-bebas-yang-sama-dengan-secret>
```

Strava akan meng-GET `callback_url` untuk verifikasi; fungsi membalas `hub.challenge`.
Jika sukses, respons berisi `id` subscription.

Cek / hapus subscription:
```bash
curl -G https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=YOUR_CLIENT_ID -d client_secret=YOUR_CLIENT_SECRET

curl -X DELETE "https://www.strava.com/api/v3/push_subscriptions/<id>?client_id=...&client_secret=..."
```

## Catatan

- Hanya **satu** subscription per aplikasi Strava; event semua peserta masuk lewat sini,
  dirutekan via `owner_id`.
- Webhook membalas cepat & selalu `200` agar Strava tak retry berlebihan; error tercatat di log fungsi.
- `calories` hanya terisi lewat jalur webhook (detailed activity). Sinkron manual (`strava-sync`)
  memakai data summary sehingga `calories` bisa `null` sampai webhook memutakhirkan.
