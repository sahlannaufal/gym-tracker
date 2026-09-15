-- Satu dokumen daftar latihan custom per pengguna. Dipisahkan dari histori
-- agar nama dapat dipakai ulang pada form dan editor program.
create table if not exists public.custom_exercise_libraries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exercises jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.custom_exercise_libraries enable row level security;

create policy "Users manage their own custom exercise library"
  on public.custom_exercise_libraries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
