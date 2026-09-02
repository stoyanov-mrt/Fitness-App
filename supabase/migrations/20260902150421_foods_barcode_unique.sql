-- Needed for the barcode-lookup Edge Function's
-- `upsert(..., { onConflict: "barcode" })` — Postgres requires a matching
-- unique index/constraint for ON CONFLICT to target. Partial (not null
-- only) so multiple non-barcode foods (the USDA-seeded majority) don't
-- collide on a shared NULL.
create unique index foods_barcode_unique_idx on public.foods (barcode) where barcode is not null;

-- Superseded by the unique index above (which also serves lookups).
drop index if exists public.foods_barcode_idx;
