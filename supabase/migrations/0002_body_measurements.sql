-- Riwayat pengukuran komposisi tubuh (offline-safe ID dari client).
create table if not exists public.body_measurements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg double precision not null check (weight_kg > 0),
  height_cm double precision not null check (height_cm > 0),
  body_fat_percentage double precision check (
    body_fat_percentage is null or body_fat_percentage between 1 and 70
  ),
  muscle_mass_kg double precision check (
    muscle_mass_kg is null or muscle_mass_kg > 0
  ),
  measured_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.body_measurements enable row level security;

create policy "body_measurements_select_own" on public.body_measurements
  for select using (auth.uid() = user_id);
create policy "body_measurements_insert_own" on public.body_measurements
  for insert with check (auth.uid() = user_id);
create policy "body_measurements_update_own" on public.body_measurements
  for update using (auth.uid() = user_id);
create policy "body_measurements_delete_own" on public.body_measurements
  for delete using (auth.uid() = user_id);

create index if not exists body_measurements_user_date_idx
  on public.body_measurements (user_id, measured_at desc);
