-- Reusable workout templates: a routine is an ordered list of exercises
-- with target sets/reps, started from when logging an actual workout.

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index routines_user_id_idx on public.routines (user_id);

alter table public.routines enable row level security;

create policy "routines are viewable by their owner"
  on public.routines for select
  using (auth.uid() = user_id);

create policy "routines are insertable by their owner"
  on public.routines for insert
  with check (auth.uid() = user_id);

create policy "routines are updatable by their owner"
  on public.routines for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "routines are deletable by their owner"
  on public.routines for delete
  using (auth.uid() = user_id);

create trigger routines_set_updated_at
  before update on public.routines
  for each row
  execute function public.set_updated_at();

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index int not null default 0,
  target_sets int check (target_sets is null or target_sets > 0),
  target_reps text, -- free-form, e.g. "8-12"
  target_weight numeric check (target_weight is null or target_weight >= 0)
);

create index routine_exercises_routine_id_idx on public.routine_exercises (routine_id, order_index);

alter table public.routine_exercises enable row level security;

-- Child table without its own user_id: policy joins up to the owning
-- routine, per CLAUDE.md's pattern for tables like this.
create policy "routine exercises are viewable by the routine's owner"
  on public.routine_exercises for select
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
      and routines.user_id = auth.uid()
  ));

create policy "routine exercises are insertable by the routine's owner"
  on public.routine_exercises for insert
  with check (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
      and routines.user_id = auth.uid()
  ));

create policy "routine exercises are updatable by the routine's owner"
  on public.routine_exercises for update
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
      and routines.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
      and routines.user_id = auth.uid()
  ));

create policy "routine exercises are deletable by the routine's owner"
  on public.routine_exercises for delete
  using (exists (
    select 1 from public.routines
    where routines.id = routine_exercises.routine_id
      and routines.user_id = auth.uid()
  ));
