# SkyExcercise

A Strava-connected activity monitoring dashboard for a running & gym program. Participants ("anggota") link their Strava account once; admins get a real-time view of everyone's activity, rankings, and quests. Built mobile-first, admin-viewed, on a free-tier Supabase backend.

## Features

- **Strava OAuth integration** — one-time authorization per participant (`read`, `profile:read_all`, `activity:read_all` scopes), with webhook-based sync so new activities appear automatically instead of via polling.
- **Two roles, two experiences:**
  - **Anggota (member):** home dashboard, stats detail, activity history ("latihan"), rankings ("peringkat"), profile & password management.
  - **Admin:** monitoring dashboard across all participants, per-member detail view, rankings, and quest management.
- **Route-level auth guard** — Vue Router redirects by login state and role (`admin` vs `anggota`).
- **Metric-only activity data** (distance/pace as returned by Strava — no unit conversion), running and gym sport types only.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | [Vue 3](https://vuejs.org/) (Composition API) + [Vue Router 4](https://router.vuejs.org/) |
| Build tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + `tailwindcss-animate` |
| UI components | [shadcn-vue](https://www.shadcn-vue.com/) |
| Backend / DB | [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security) |
| Serverless functions | Supabase Edge Functions (`strava-oauth`, `strava-sync`, `strava-webhook`, `strava-disconnect`) |
| Third-party integration | [Strava API](https://developers.strava.com/) (OAuth + webhooks) |
| Formatting | [oxfmt](https://github.com/oxc-project/oxc) |
| Deployment | [Vercel](https://vercel.com/) (SPA rewrite configured in `vercel.json`) |

## Project structure

```
src/
├── components/     # Screen-level Vue components (member + admin views)
├── composables/     # Reusable composition-API state/logic (auth, quests, Strava connection, etc.)
├── services/         # API calls to Supabase (activities, admin, leaderboard, profile, stats)
├── store/            # App-wide reactive state (auth, athlete/"anggota" data, stats, strava)
├── lib/               # Supabase client setup, data normalization helpers
└── router/           # Route definitions + auth/role navigation guard

supabase/
├── config.toml
└── functions/         # Edge Functions: strava-oauth, strava-sync, strava-webhook, strava-disconnect
```

## Getting started

### Prerequisites

- Node.js `^22.18.0` or `>=24.12.0`
- A [Supabase](https://supabase.com/) project
- A [Strava API application](https://www.strava.com/settings/api)

### Setup

```sh
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project URL/anon key and Strava Client ID + redirect URI (see `.env.example`). For local development, set the Strava app's **Authorization Callback Domain** to `localhost`.

### Development

```sh
npm run dev
```

### Build & preview

```sh
npm run build
npm run preview
```

### Formatting

```sh
npm run format
```

## Deployment

Deployed to Vercel as a single-page app; `vercel.json` rewrites all routes to `index.html` so client-side routing works on refresh/deep links.
