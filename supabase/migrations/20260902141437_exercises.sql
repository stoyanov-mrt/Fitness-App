-- Exercise library: public reference table, seeded from free-exercise-db
-- (see supabase/seed/import-exercises.ts) plus user-created custom exercises.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('strength', 'cardio', 'mobility')),
  primary_muscle text,
  secondary_muscles text[] not null default '{}',
  equipment text,
  instructions text,
  image_urls text[] not null default '{}',
  is_custom boolean not null default false,
  created_by uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index exercises_name_idx on public.exercises using gin (to_tsvector('english', name));
create index exercises_category_idx on public.exercises (category);
create index exercises_primary_muscle_idx on public.exercises (primary_muscle);

alter table public.exercises enable row level security;

-- Reference-table pattern from CLAUDE.md: public read, insert restricted to
-- a user's own custom rows. Update/delete follow the same restriction so
-- users can manage exercises they created but never touch seeded/other
-- users' rows.
create policy "exercises are publicly readable"
  on public.exercises for select
  using (true);

create policy "users can insert their own custom exercises"
  on public.exercises for insert
  with check (is_custom = true and created_by = auth.uid());

create policy "users can update their own custom exercises"
  on public.exercises for update
  using (is_custom = true and created_by = auth.uid())
  with check (is_custom = true and created_by = auth.uid());

create policy "users can delete their own custom exercises"
  on public.exercises for delete
  using (is_custom = true and created_by = auth.uid());
