-- Saved meals: a reusable bundle of foods + quantities (e.g. "my usual
-- breakfast") a user can log to their diary in one action instead of
-- re-adding each item every time. Same shape as meals/meal_items, just not
-- tied to a specific date/meal_type — logging a saved meal creates real
-- meal_items rows via the app, it doesn't reference this table.

create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index saved_meals_user_id_idx on public.saved_meals (user_id);

alter table public.saved_meals enable row level security;

create policy "saved meals are viewable by their owner"
  on public.saved_meals for select
  using (auth.uid() = user_id);

create policy "saved meals are insertable by their owner"
  on public.saved_meals for insert
  with check (auth.uid() = user_id);

create policy "saved meals are updatable by their owner"
  on public.saved_meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved meals are deletable by their owner"
  on public.saved_meals for delete
  using (auth.uid() = user_id);

create table public.saved_meal_items (
  id uuid primary key default gen_random_uuid(),
  saved_meal_id uuid not null references public.saved_meals (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  quantity numeric not null default 1 check (quantity > 0)
);

create index saved_meal_items_saved_meal_id_idx on public.saved_meal_items (saved_meal_id);

alter table public.saved_meal_items enable row level security;

-- Child table without its own user_id: joins up to the owning saved meal,
-- same pattern as meal_items / routine_exercises.
create policy "saved meal items are viewable by the saved meal's owner"
  on public.saved_meal_items for select
  using (exists (
    select 1 from public.saved_meals
    where saved_meals.id = saved_meal_items.saved_meal_id
      and saved_meals.user_id = auth.uid()
  ));

create policy "saved meal items are insertable by the saved meal's owner"
  on public.saved_meal_items for insert
  with check (exists (
    select 1 from public.saved_meals
    where saved_meals.id = saved_meal_items.saved_meal_id
      and saved_meals.user_id = auth.uid()
  ));

create policy "saved meal items are updatable by the saved meal's owner"
  on public.saved_meal_items for update
  using (exists (
    select 1 from public.saved_meals
    where saved_meals.id = saved_meal_items.saved_meal_id
      and saved_meals.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.saved_meals
    where saved_meals.id = saved_meal_items.saved_meal_id
      and saved_meals.user_id = auth.uid()
  ));

create policy "saved meal items are deletable by the saved meal's owner"
  on public.saved_meal_items for delete
  using (exists (
    select 1 from public.saved_meals
    where saved_meals.id = saved_meal_items.saved_meal_id
      and saved_meals.user_id = auth.uid()
  ));
