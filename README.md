# Fitness App

An all-in-one workout and nutrition tracker — Strong/Hevy-style set logging combined with
MyFitnessPal-style calorie and macro tracking, in a single cross-platform mobile app.

This is a **portfolio project**: the goal is clean architecture, sound data modeling, and test
discipline, not feature breadth or a live user base. See [Non-goals](#non-goals) below for what
was deliberately left out.

## Contents

- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Design system](#design-system)
- [Non-goals](#non-goals)

## What it does

- **Auth & onboarding** — email/password sign-up, an onboarding wizard capturing sex, date of
  birth, height, weight, activity level and goal (cut/maintain/bulk), and auto-calculated calorie
  and macro targets (Mifflin-St Jeor).
- **Workout tracking** — a searchable exercise library, reusable routines, an active-workout
  logger (sets/reps/weight, warm-up flag), and workout history.
- **Nutrition tracking** — food search against a seeded USDA-derived database, barcode scanning
  (via an Open Food Facts-backed Edge Function), custom foods, and a daily diary split by meal
  with live calorie/macro totals against the day's target.
- **Body metrics** — weight logging with a trend chart and private progress photos.
- **Dashboard** — today's calorie/macro summary, last workout, and a weight sparkline.
- **Settings** — units (metric/imperial), theme, and target editing.
- **Offline resilience** — a persisted query cache and optimistic mutations keep set/food logging
  usable through brief gym connectivity gaps; a connectivity banner surfaces the online/offline
  state explicitly.
- **Crash monitoring** — wired to Sentry, a safe no-op until a DSN is configured.

## Architecture

| Layer | Choice | Why |
|---|---|---|
| Mobile app | React Native + Expo (TypeScript), Expo Router | File-based routing, fast iteration via Expo Go / EAS dev client, one codebase for iOS + Android + web. |
| Backend | Supabase (Postgres + RLS + Auth + Storage + Edge Functions) | The domain is inherently relational (workouts → exercises → sets; meals → items → foods) and needs SQL aggregation that a document store handles poorly. RLS enforces per-user isolation at the DB layer, not just in client code. |
| Server state | TanStack Query, with a persisted AsyncStorage cache | No `useEffect` + `useState` fetching anywhere; optimistic mutations (`onMutate`/`onError` rollback) for logging actions. |
| Client/UI state | Zustand | Ephemeral state only (theme, design theme) — server data never gets mirrored into a store. |
| Forms/validation | React Hook Form + Zod | Zod schemas are the single source of truth for a form's shape. |
| Styling | NativeWind (Tailwind for RN) | A themeable design system with class-based dark mode, driving two full switchable visual themes (see [Design system](#design-system)). |
| Charts | react-native-gifted-charts | Weight-trend and strength-progress visualization. |
| Testing | Jest + React Native Testing Library + Maestro | Unit tests for pure domain logic, RNTL for key screens, Maestro specs for the critical signup → onboarding → log workout → log food path. |
| Monitoring | Sentry | DSN-optional — crash reporting no-ops cleanly until one is configured. |

Full conventions (naming, directory layout, RLS patterns, git/commit style) live in
[`CLAUDE.md`](CLAUDE.md) — that document is the single source of truth this codebase was built
against.

### Reference data

- **Exercises** seeded from [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (public domain, ~800 exercises with muscles/equipment).
- **Foods** seeded from a curated subset of
  [USDA FoodData Central](https://fdc.nal.usda.gov/) (Foundation Foods + SR Legacy).
- **Barcode fallback** via [Open Food Facts](https://world.openfoodfacts.org/) (free, no API key),
  proxied through the `barcode-lookup` Edge Function and upserted into `foods` on first lookup.

## Data model

Core tables, all created with RLS enabled in the same migration that creates them
(`supabase/migrations/`):

```
profiles (1:1 auth.users) ──< goals (versioned by effective_date)
exercises (public reference, + user-created)
routines ──< routine_exercises
workouts ──< workout_exercises ──< sets
foods (public reference, + barcode-resolved + user-created)
meals (per user/date/meal_type) ──< meal_items
body_metrics (weight, jsonb measurements, progress-photo paths in Storage)
```

Aggregation (daily macro totals, PR detection) is done in SQL views/functions rather than
client-side — e.g. `daily_nutrition_summary`. Direct-owner tables use
`USING (auth.uid() = user_id)`; child tables without their own `user_id` (`sets`, `meal_items`,
`workout_exercises`, `routine_exercises`) join up to the owning parent. `exercises`/`foods` are
public-read with inserts restricted to a user's own custom rows.

## Project structure

```
app/            Expo Router routes only — thin screens, no business logic
src/
  features/     One folder per domain: auth, onboarding, workouts, nutrition, metrics, dashboard, settings
                 Each contains: api.ts (Supabase calls), hooks.ts (TanStack Query hooks), components/, utils/
  components/   Shared, feature-agnostic UI primitives
  lib/          Cross-cutting singletons: supabase.ts, queryClient.ts, network.ts, sentry.ts
  stores/       Zustand stores (UI/ephemeral state only)
  types/        types/database.ts is generated from the Supabase schema, never hand-edited
  theme/        Design theme system (see below)
__tests__/      RNTL screen tests (kept out of app/ so Expo Router doesn't treat them as routes)
e2e/maestro/    Maestro E2E flow specs
supabase/
  migrations/   Numbered, sequential, one logical change per file
  functions/    Edge Functions (Deno)
  seed/         One-off import scripts + seed data, not shipped in the app bundle
.github/workflows/  CI (lint, typecheck, tests) on every PR
```

## Getting started

Requires Node 20+ and a Supabase project (the local Docker-based dev loop is documented in
`CLAUDE.md`, but this app targets a hosted project directly by default).

```bash
npm install
cp .env.example .env.local   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

Press `w` for the web build (the fastest loop for UI work), or run on a simulator/device via the
Expo Go app / an EAS dev client once camera/barcode native modules are needed.

To point the app at your own Supabase project: apply the migrations in `supabase/migrations/` in
order, then optionally run the seed scripts in `supabase/seed/` (`npx tsx supabase/seed/import-exercises.ts`,
`import-foods.ts`) against it, and regenerate types:

```bash
supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
```

## Testing

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Jest + React Native Testing Library
```

- **Unit tests** cover pure domain logic (1RM/PR formulas, macro calculators, Zod schemas) —
  no RN rendering, fast.
- **Component tests** (`__tests__/screens/`) drive key screens (sign-in, onboarding) through
  React Native Testing Library, asserting on user-visible behavior rather than implementation
  details. Placed at the repo root rather than under `app/` because Expo Router treats every file
  under `app/` as a route.
- **E2E** (`e2e/maestro/`) specs cover the critical path — signup → onboarding → log workout →
  log food — plus each stage individually against a pre-seeded test account. These aren't
  runnable in this development environment (no simulator/device or Maestro CLI available here),
  but are ready to run with the [Maestro CLI](https://maestro.mobile.dev/) against a real build:

  ```bash
  maestro test e2e/maestro/critical-path.yaml
  MAESTRO_TEST_EMAIL=... MAESTRO_TEST_PASSWORD=... maestro test e2e/maestro/flows/03-log-workout.yaml
  ```

Every feature in this codebase was built behind a QA gate: a `qa-reviewer` subagent
(`.claude/agents/qa-reviewer.md`) reviews new/changed code against `CLAUDE.md`'s conventions,
runs the static checks above, and drives the Expo web build in a browser to visually inspect
affected screens — before moving on to the next feature.

## CI/CD

- **`.github/workflows/ci.yml`** — lint, typecheck, and the full Jest suite on every PR and push
  to `main`.
- **`eas.json`** — EAS Build profiles (development/preview/production) for installable builds,
  ready to use once an EAS project exists.

## Design system

The app ships two complete, switchable visual themes rather than a single palette — chosen and
persisted per device (Settings → Theme):

- **Dither Mono** — a dark, monospaced, high-contrast look (JetBrains Mono).
- **Japanese Minimal** — a light, generous-whitespace look pairing Shippori Mincho and
  Zen Kaku Gothic New.

Both are implemented as NativeWind `vars()` CSS custom-property sets, switched via a Zustand
store persisted to AsyncStorage (`src/stores/designThemeStore.ts`) — no component branches on the
active theme directly, they all read from `useDesignTheme()`'s token object.

## Non-goals

No social features, AI coaching, wearable sync, payments, or server-pushed notifications in v1 —
deliberately out of scope to keep the build focused on the tracking core and its data layer.
