# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

OpenCity is a civic-issue-reporting web app for Uzbekistan (all UI text is in Uzbek): citizens report problems (roads, lighting, waste, etc.) with photos and a map pin, vote on existing reports, and track resolution; government departments and approved private companies handle reports assigned to them; admins oversee everything. It's a Vite + React SPA backed entirely by Supabase (Postgres + Auth + Storage) — there is no custom backend server.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — production build (also generates the PWA service worker/manifest via `vite-plugin-pwa`)
- `npm run preview` — preview the production build
- `node scripts/gen-migration.mjs` — regenerate `supabase/migrations/0002_nationwide_regions.sql`'s government-department seed data from `src/data/regions.js` (run this if the region/district list changes)
- `node scripts/gen-icons.mjs` — regenerate `public/icon-*.png` PWA/favicon assets from `public/icon.svg`

There is no test suite or linter configured.

## Supabase setup

The database schema, RLS policies, and seed data live in `supabase/migrations/*.sql`, applied in order (0001 → 0007+) via the Supabase SQL Editor — see `supabase/README.md` for the full setup walkthrough (migrations, Google OAuth, first-admin bootstrap). There is no migration tool wired up; each file is meant to be pasted into the SQL Editor once, in order, and is not safely re-runnable.

Frontend Supabase credentials go in `.env.local` (see `.env.local.example`): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put the `service_role` key in frontend code.

## Architecture

- **`src/App.jsx`** — root component. Owns the top-level session/data state (`profile`, `reports`, `orgs`, `myOrg`, `notifications`), wires up Supabase realtime subscriptions (`subscribeToReports`, `subscribeToNotifications`), and switches between the three portals based on `profile.role`.
- **`src/hooks/useAuth.js`** — wraps Supabase Auth (Google OAuth via `signInWithOAuth`), exposes `user`/`session`/`signInWithGoogle`/`signOut`.
- **`src/lib/supabaseClient.js`** — the single Supabase client instance, built from the `VITE_SUPABASE_*` env vars.
- **`src/lib/api/*.js`** — all Supabase queries/mutations, grouped by entity (`reports.js`, `organizations.js`, `applications.js`, `profiles.js`, `notifications.js`, `storage.js`). Components never call `supabase.from(...)` directly; they go through these. `reports.js`'s `mapReport()` is the single place that reshapes a DB row into the shape components expect (e.g. `votes`/`reopenVotes` as plain id arrays derived from join tables, `photos` with backward-compat fallback to the legacy single-photo column).
- **`src/components/`** — one file per portal (`CitizenPortal.jsx`, `OrganizationPortal.jsx`, `AdminPortal.jsx`), plus `ReportWizard.jsx` (multi-step report creation), `shared.jsx` (`ReportCard`, `ReportDetail`, `CityMap`, `Modal`, `PartnerFlyer`, Leaflet marker icons), `SignInScreen.jsx`, `TopBar.jsx`.
- **`src/styles.jsx`** — every visual style lives in one exported `S` object of plain style objects (no CSS modules/styled-components), plus a `GlobalStyle` component injecting the one real `<style>` block (fonts, keyframes, responsive breakpoints, the `.oc-aurora` background effect, `.oc-view-fade` transition class). Extend `S` rather than adding new styling approaches.
- **`src/constants.js`** / **`src/data/regions.js`** — `CATEGORIES` (report types), `STATUS`/`PRIORITY` enums, tunable thresholds (`HOT_VOTES`, `RESOLUTION_PHOTOS_REQUIRED`, `REOPEN_VOTES_REQUIRED`), and the full Uzbekistan region/district dataset (14 regions, ~200 districts, used for location pickers and nearest-location GPS lookup via `nearestLocation`).

### Data model & report routing

A `report` belongs to a `region` + `district` + `category`. On creation, `findGovernmentOrg(region, district, category)` looks up a pre-seeded row in `organizations` (kind `'government'`) — every (region, district, category) combination has one, seeded by migration 0002 — and the report is auto-assigned to it. Admins can reassign a report to a private org; private orgs can also self-serve "claim" a still-government-assigned report directly from the map (see the `reports_claim_by_private_org` RLS policy). Status changes are appended to `report_timeline`, and a Postgres trigger (`notify_on_timeline_insert`) auto-notifies the report's creator — application code should never write to `notifications` on another user's behalf directly; let the trigger do it by inserting a timeline row.

`organizations.kind` is `'government'` (pre-seeded, ~2222 rows — never fetched in bulk into app state) or `'private'` (created when an admin approves an `org_applications` row). Getting org-portal access works two ways, both ending in `profiles.role = 'org'` + `profiles.org_id` set: an admin directly searches and assigns a user to any org (`AdminPortal`'s staff-assign form), or a user submits an `org_applications` row (`kind: 'government'` picks an existing dept by region/district/category; `kind: 'private'` supplies company details and creates a new org on approval).

Security is enforced via Postgres RLS (see `supabase/migrations/0001_init.sql` and later), not in application code — e.g. a banned profile (`profiles.banned`) is blocked at the database level from inserting reports/votes/applications, and an org can only update reports assigned to it. When adding a new report/org mutation, check whether an RLS policy needs to accompany it rather than assuming the anon-key client can be trusted to self-restrict.
