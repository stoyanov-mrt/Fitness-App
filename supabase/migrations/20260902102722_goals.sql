-- Calorie/macro targets, versioned by effective_date so history isn't lost
-- when a user's targets change (e.g. after re-onboarding or a manual edit).

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  calories_target int not null check (calories_target > 0),
  protein_g_target int not null check (protein_g_target >= 0),
  carbs_g_target int not null check (carbs_g_target >= 0),
  fat_g_target int not null check (fat_g_target >= 0),
  effective_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index goals_user_id_effective_date_idx
  on public.goals (user_id, effective_date desc);

alter table public.goals enable row level security;

create policy "goals are viewable by their owner"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "goals are insertable by their owner"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "goals are updatable by their owner"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals are deletable by their owner"
  on public.goals for delete
  using (auth.uid() = user_id);
