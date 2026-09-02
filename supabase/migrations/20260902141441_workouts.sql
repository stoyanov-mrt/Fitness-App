-- Logged workout sessions: workouts -> workout_exercises -> sets.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  name text not null default 'Workout',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text
);

create index workouts_user_id_started_at_idx on public.workouts (user_id, started_at desc);

alter table public.workouts enable row level security;

create policy "workouts are viewable by their owner"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "workouts are insertable by their owner"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "workouts are updatable by their owner"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workouts are deletable by their owner"
  on public.workouts for delete
  using (auth.uid() = user_id);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index int not null default 0,
  notes text
);

create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id, order_index);
create index workout_exercises_exercise_id_idx on public.workout_exercises (exercise_id);

alter table public.workout_exercises enable row level security;

create policy "workout exercises are viewable by the workout's owner"
  on public.workout_exercises for select
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  ));

create policy "workout exercises are insertable by the workout's owner"
  on public.workout_exercises for insert
  with check (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  ));

create policy "workout exercises are updatable by the workout's owner"
  on public.workout_exercises for update
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  ));

create policy "workout exercises are deletable by the workout's owner"
  on public.workout_exercises for delete
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
  ));

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_index int not null default 0,
  weight numeric not null check (weight >= 0),
  reps int not null check (reps >= 0),
  rpe numeric check (rpe is null or (rpe >= 0 and rpe <= 10)),
  is_warmup boolean not null default false,
  completed_at timestamptz not null default now()
);

create index sets_workout_exercise_id_idx on public.sets (workout_exercise_id, set_index);

alter table public.sets enable row level security;

-- Two-hop join up to the owning workout, same pattern as workout_exercises.
create policy "sets are viewable by the workout's owner"
  on public.sets for select
  using (exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id
      and workouts.user_id = auth.uid()
  ));

create policy "sets are insertable by the workout's owner"
  on public.sets for insert
  with check (exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id
      and workouts.user_id = auth.uid()
  ));

create policy "sets are updatable by the workout's owner"
  on public.sets for update
  using (exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id
      and workouts.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id
      and workouts.user_id = auth.uid()
  ));

create policy "sets are deletable by the workout's owner"
  on public.sets for delete
  using (exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id
      and workouts.user_id = auth.uid()
  ));
