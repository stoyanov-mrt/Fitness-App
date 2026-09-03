-- Body metrics: weight/measurements/progress-photo log, one row per
-- user/date (logging again on the same day updates that day's entry rather
-- than creating a duplicate — see src/features/metrics/api.ts's upsert).

create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  weight_kg numeric check (weight_kg is null or weight_kg > 0),
  measurements jsonb, -- e.g. {"waist_cm": 80, "chest_cm": 100, "arm_cm": 35}
  photo_urls text[] not null default '{}', -- paths in the progress-photos Storage bucket
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index body_metrics_user_id_date_idx on public.body_metrics (user_id, date desc);

alter table public.body_metrics enable row level security;

create policy "body metrics are viewable by their owner"
  on public.body_metrics for select
  using (auth.uid() = user_id);

create policy "body metrics are insertable by their owner"
  on public.body_metrics for insert
  with check (auth.uid() = user_id);

create policy "body metrics are updatable by their owner"
  on public.body_metrics for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "body metrics are deletable by their owner"
  on public.body_metrics for delete
  using (auth.uid() = user_id);
