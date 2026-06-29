# Capture Dashboard

A single-page capture-management tool for federal business development: track
opportunities through a gated capture lifecycle, manage past performances and
reusable proof points, run competitive intel and Black Hat sessions, price-to-win,
and generate proposal documents.

Built with **React 18 + Vite**. Persistence today is browser `localStorage`; a
migration to a Supabase backend (Postgres + Auth + RLS + Storage) is planned — see
[`MIGRATION.md`](./MIGRATION.md).

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

The app entry point is `src/main.jsx → src/App.jsx`.

## Project layout

```
index.html               # Vite HTML entry (loads /src/main.jsx)
src/
  main.jsx               # React root
  App.jsx                # application shell + all feature modules (being split — see MIGRATION.md §2)
  index.css              # global styles
  components/
    PWinerator.jsx       # P-Win calculator module
  assets/                # images
public/                  # static assets (favicon, icons)
supabase/
  migrations/            # database schema for the planned Supabase backend (MIGRATION.md §3)
```

## Roadmap

See [`MIGRATION.md`](./MIGRATION.md) for the planned work: de-branding into a config
layer, splitting `App.jsx` into per-module files, and adding the Supabase data layer.
Work is sequenced as a series of PRs (PR 0 = repo cleanup).
