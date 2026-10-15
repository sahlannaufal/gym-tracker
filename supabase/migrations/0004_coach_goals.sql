-- Satu goal Coach aktif per pengguna. Isi goal berbentuk JSONB agar iterasi
-- berikutnya dapat menambah tipe goal tanpa memecah data goal lama.
create table if not exists public.coach_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal jsonb not null,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.coach_goals enable row level security;

create policy "Users manage their own coach goal"
  on public.coach_goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.coach_goals is
  'Goal Coach aktif per pengguna, disinkronkan offline-first dengan last-write-wins.';
