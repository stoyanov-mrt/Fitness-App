-- Profiles: one row per authenticated user, 1:1 with auth.users.
-- Populated automatically on signup via the handle_new_user trigger below;
-- onboarding (Phase 1) fills in the rest.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  sex text check (sex in ('male', 'female', 'other') or sex is null),
  date_of_birth date,
  height_cm numeric check (height_cm is null or height_cm > 0),
  -- Snapshot used for the onboarding target calculation, kept in sync by
  -- Settings edits. The full weight *history* lives in body_metrics
  -- (added in a later migration) — this column is just "the last known
  -- weight", not a log.
  current_weight_kg numeric check (current_weight_kg is null or current_weight_kg > 0),
  activity_level text check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
    or activity_level is null
  ),
  goal text check (goal in ('cut', 'maintain', 'bulk') or goal is null),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Shared updated_at trigger helper, reused by every table below that has one.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up, so onboarding
-- always has a row to update into rather than needing an insert-or-update.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
