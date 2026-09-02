# CLAUDE.md

Guidance for Claude Code (and other contributors) working in this repository. This is a **greenfield** project — see the project plan for the full architecture and phased roadmap. This document defines the conventions to follow while building it.

## Project summary

A cross-platform mobile fitness app combining workout tracking (Strong/Hevy-style set logging) with nutrition tracking (MyFitnessPal-style calorie/macro logging). Portfolio-quality: clean architecture and test discipline matter more than feature breadth.

**Stack**: React Native + Expo (TypeScript) · Expo Router · NativeWind · TanStack Query + Zustand · React Hook Form + Zod · Supabase (Postgres + RLS + Auth + Storage + Edge Functions) · Victory Native · Jest/RNTL · Maestro · Sentry.

## Directory structure

```
app/            Expo Router routes only — thin screens, no business logic
src/
  features/     One folder per domain: auth, onboarding, workouts, nutrition, metrics, dashboard, settings
                 Each contains: api.ts (Supabase calls), hooks.ts (TanStack Query hooks), components/, utils/
  components/   Shared, feature-agnostic UI primitives only
  lib/          Cross-cutting singletons: supabase.ts, queryClient.ts
  stores/       Zustand stores (UI/ephemeral state only — never server data)
  types/        types/database.ts is generated, never hand-edited
  constants/, theme/
e2e/maestro/    E2E flow specs
supabase/
  migrations/   Numbered, sequential, one logical change per file
  functions/    Edge Functions (Deno)
  seed/         One-off import scripts + seed data, not shipped in the app bundle
```

Rule of thumb: if code touches Supabase or cross-screen state for one domain, it lives in that domain's `features/<name>/`. If two+ domains need it, it goes in `components/`, `lib/`, or `stores/`. Screens under `app/` should mostly compose hooks and components from `src/features/*` — avoid putting fetch calls or business logic directly in route files.

## Naming & style

- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils/api modules. Route files follow Expo Router's own conventions (`[id].tsx`, `(group)/`).
- **Components**: named exports, not default exports (except Expo Router route files, which require default exports).
- **Hooks**: prefixed `use`, one hook per concern (`useWorkouts`, `useLogSet`, `usePersonalRecords`) rather than one large hook per feature.
- **Types**: domain types live near their feature (`features/workouts/types.ts`) unless generated from the DB schema (`types/database.ts`). Prefer `type` over `interface` unless declaration merging is actually needed.
- **Formatting/linting**: Prettier + ESLint, enforced in CI — don't hand-format against the configured rules.

## Data & state conventions

- **Server state always goes through TanStack Query** — no `useEffect` + `useState` fetching. Every feature's `hooks.ts` wraps its `api.ts` calls in `useQuery`/`useMutation`.
- **Zustand is for UI/ephemeral state only** (active-workout-in-progress, theme, onboarding step) — never mirror server data into a Zustand store.
- **Mutations are optimistic** where the UX benefits (logging a set, logging a food item), using TanStack Query's `onMutate`/`onError` rollback pattern, per the plan's offline strategy.
- **Validation**: Zod schemas are the source of truth for a form's shape; reuse the same schema on both the client (React Hook Form) and, where relevant, an Edge Function's input validation — don't redefine the shape twice.
- **Supabase types**: run `supabase gen types typescript` after every migration and commit the regenerated `src/types/database.ts` in the same change as the migration. Never hand-edit that file.

## Database conventions

- One logical schema change per migration file, sequentially numbered, forward-only (no editing a migration once it's merged — write a new one).
- **Every user-owned table gets RLS enabled**, no exceptions, in the same migration that creates the table — never ship a table without its policy.
- Direct-owner tables: `USING (auth.uid() = user_id)`. Child tables without their own `user_id` (`sets`, `meal_items`, `workout_exercises`, `routine_exercises`): policy joins up to the owning parent — see the plan's data model section for the pattern.
- Reference tables (`exercises`, `foods`) are public-read; `INSERT` restricted to a user's own custom rows (`is_custom = true AND created_by = auth.uid()`).
- Prefer SQL views/functions for aggregation (daily macro totals, PR detection) over pulling raw rows and aggregating in the app.

## Feature workflow — QA gate (mandatory)

**No feature is "done" until it passes review by the `qa-reviewer` subagent (`.claude/agents/qa-reviewer.md`).** Process for every feature/phase:

1. Implement the feature.
2. Invoke the `qa-reviewer` agent (via the Agent tool) to check it — see that agent's file for exactly what it checks.
3. If it reports **FAIL** with issues: fix every issue, then re-invoke the agent. Repeat until **PASS**.
4. Only after a **PASS** move on to the next feature/phase in the roadmap.

Do not batch multiple features before review, and do not skip the gate for "small" changes — the point is to catch convention drift and broken screens while they're still cheap to fix.

## Testing conventions

- Pure domain logic (1RM/PR formulas, macro calculators, Zod schemas) gets Jest unit tests — no RN rendering needed, keep these fast.
- Key screens (workout logger, food diary entry, onboarding form) get React Native Testing Library tests driven by user-visible behavior, not implementation details or snapshots.
- Critical end-to-end flows (signup → onboarding → log workout → log food) are covered by Maestro specs in `e2e/maestro/`, run in CI.
- During active development, visual/functional QA of new screens happens via the Expo **web** build (`expo start --web`, driven through the browser preview tool — the Playwright-equivalent available in this environment) as part of the `qa-reviewer` gate above. This is faster than a simulator loop and catches broken layouts, console errors, and dead links immediately after a screen is built.
- A new feature module isn't done until its domain logic has unit tests — don't defer test-writing to a later "testing phase" for logic being written now.

## Git & commits

- Small, logically scoped commits; one migration or one feature slice per commit where practical.
- Conventional, imperative commit subjects (`add workout logger`, not `added` or `adds`).
- Don't commit generated build artifacts, `.env` files, or local Supabase Docker state.

## Running things locally

- App: `npx expo start` (plain Expo Go until native modules — camera/barcode — are added in the nutrition phase, then an EAS dev client). `npx expo start --web` for the browser-based QA loop.
- Backend: `supabase start` for local Postgres/Auth/Storage/Studio; `supabase db reset` to reapply all migrations + seed data from scratch — do this before assuming a schema/RLS change is correct.
- Regenerate types after any migration: `supabase gen types typescript --local > src/types/database.ts`.

## Non-goals (v1)

No social features, AI coaching, wearable sync, payments, or server-pushed notifications. Don't scope-creep new work into these — flag them as future enhancements instead.
