-- Food library: public reference table, seeded from USDA FoodData Central
-- (Foundation Foods — see supabase/seed/import-foods.ts) plus barcode-resolved
-- (Open Food Facts, via an Edge Function) and user-created custom foods.
--
-- All macro/calorie columns are per `serving_size` `serving_unit` (100 g by
-- default, matching USDA's convention) — meal_items multiplies by a
-- quantity, it doesn't re-parametrize the serving.

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  fdc_id text unique,
  barcode text,
  name text not null,
  brand text,
  serving_size numeric not null default 100 check (serving_size > 0),
  serving_unit text not null default 'g',
  calories numeric not null check (calories >= 0),
  protein_g numeric not null check (protein_g >= 0),
  carbs_g numeric not null check (carbs_g >= 0),
  fat_g numeric not null check (fat_g >= 0),
  is_custom boolean not null default false,
  created_by uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index foods_name_idx on public.foods using gin (to_tsvector('english', name));
create index foods_barcode_idx on public.foods (barcode) where barcode is not null;

alter table public.foods enable row level security;

-- Same reference-table pattern as exercises: public read, insert/update/
-- delete restricted to a user's own custom rows.
create policy "foods are publicly readable"
  on public.foods for select
  using (true);

create policy "users can insert their own custom foods"
  on public.foods for insert
  with check (is_custom = true and created_by = auth.uid());

create policy "users can update their own custom foods"
  on public.foods for update
  using (is_custom = true and created_by = auth.uid())
  with check (is_custom = true and created_by = auth.uid());

create policy "users can delete their own custom foods"
  on public.foods for delete
  using (is_custom = true and created_by = auth.uid());
