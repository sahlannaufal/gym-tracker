-- ============================================================
-- Gym Progress Tracker - Inisialisasi schema untuk Supabase
-- Jalankan di Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ---------- Tabel workouts ----------
-- id text PK: id di-generate client (offline-safe, contoh "w_...")
create table if not exists public.workouts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  weight double precision not null,
  reps integer not null,
  sets integer not null,
  date text not null, -- format YYYY-MM-DD
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "workouts_select_own" on public.workouts
  for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts
  for update using (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts
  for delete using (auth.uid() = user_id);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, date);

-- ---------- Tabel routine (1 baris per user) ----------
create table if not exists public.routine (
  id uuid primary key references auth.users(id) on delete cascade,
  days jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.routine enable row level security;

create policy "routine_select_own" on public.routine
  for select using (auth.uid() = id);
create policy "routine_insert_own" on public.routine
  for insert with check (auth.uid() = id);
create policy "routine_update_own" on public.routine
  for update using (auth.uid() = id);
create policy "routine_delete_own" on public.routine
  for delete using (auth.uid() = id);
