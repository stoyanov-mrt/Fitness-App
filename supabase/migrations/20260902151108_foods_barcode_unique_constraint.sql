-- The previous migration's partial unique index (`where barcode is not
-- null`) can't be used as an implicit ON CONFLICT target by PostgREST's
-- upsert (Postgres requires the conflict target to match a full unique
-- constraint/index, or the WHERE clause to be spelled out explicitly,
-- which a plain `on_conflict=barcode` query param can't express) — the
-- barcode-lookup Edge Function's upsert failed against it in practice.
--
-- A plain (non-partial) UNIQUE constraint on a nullable column already
-- allows unlimited NULLs (NULLs are never considered equal to each other
-- in a unique constraint) while still enforcing uniqueness for actual
-- barcode values, so the partial index wasn't buying anything.
drop index if exists public.foods_barcode_unique_idx;
alter table public.foods add constraint foods_barcode_key unique (barcode);
