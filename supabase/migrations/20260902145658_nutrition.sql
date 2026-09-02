-- Daily food diary: meals (one per user/date/meal_type) -> meal_items
-- (a food + a quantity multiplier on its serving).

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz not null default now(),
  unique (user_id, date, meal_type)
);

create index meals_user_id_date_idx on public.meals (user_id, date);

alter table public.meals enable row level security;

create policy "meals are viewable by their owner"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "meals are insertable by their owner"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "meals are deletable by their owner"
  on public.meals for delete
  using (auth.uid() = user_id);

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  quantity numeric not null default 1 check (quantity > 0),
  logged_at timestamptz not null default now()
);

create index meal_items_meal_id_idx on public.meal_items (meal_id);

alter table public.meal_items enable row level security;

-- Child table without its own user_id: joins up to the owning meal, same
-- pattern as routine_exercises / workout_exercises.
create policy "meal items are viewable by the meal's owner"
  on public.meal_items for select
  using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  ));

create policy "meal items are insertable by the meal's owner"
  on public.meal_items for insert
  with check (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  ));

create policy "meal items are updatable by the meal's owner"
  on public.meal_items for update
  using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  ));

create policy "meal items are deletable by the meal's owner"
  on public.meal_items for delete
  using (exists (
    select 1 from public.meals
    where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
  ));

-- Daily totals, computed in SQL rather than pulled client-side (CLAUDE.md
-- prefers views/functions for aggregation). RLS on the underlying tables
-- still applies when this is queried (no SECURITY DEFINER), so a user only
-- ever sees their own rows through it.
-- quantity is a multiplier on one serving (serving_size serving_unit) of
-- the food, not a raw gram amount — so totals are quantity * per-serving
-- macro, no re-scaling by serving_size needed.
create view public.daily_nutrition_summary as
select
  m.user_id,
  m.date,
  coalesce(sum(mi.quantity * f.calories), 0) as total_calories,
  coalesce(sum(mi.quantity * f.protein_g), 0) as total_protein_g,
  coalesce(sum(mi.quantity * f.carbs_g), 0) as total_carbs_g,
  coalesce(sum(mi.quantity * f.fat_g), 0) as total_fat_g
from public.meals m
join public.meal_items mi on mi.meal_id = m.id
join public.foods f on f.id = mi.food_id
group by m.user_id, m.date;

grant select on public.daily_nutrition_summary to authenticated;
