-- Fondasi Coach berbayar. Entitlement hanya dapat dibaca pemilik; penulisan
-- harus dilakukan backend tepercaya setelah webhook pembayaran tervalidasi.
create table if not exists public.coach_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'cancelled')),
  provider text,
  provider_customer_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.coach_entitlements enable row level security;
drop policy if exists "Users read own coach entitlement" on public.coach_entitlements;
create policy "Users read own coach entitlement" on public.coach_entitlements
  for select using (auth.uid() = user_id);
revoke insert, update, delete on public.coach_entitlements from public, anon, authenticated;
grant select on public.coach_entitlements to authenticated;

-- Versi program dan check-in menjadi histori append-only milik tiap akun.
create table if not exists public.coach_program_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null,
  source text not null check (source in ('initial', 'weekly_checkin', 'user_edit')),
  profile jsonb not null,
  recommendation jsonb not null,
  status text not null default 'proposed' check (status in ('proposed', 'active', 'superseded', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, version)
);
alter table public.coach_program_versions enable row level security;
drop policy if exists "Users manage own coach program versions" on public.coach_program_versions;
create policy "Users manage own coach program versions" on public.coach_program_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.coach_program_versions to authenticated;

create table if not exists public.coach_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  answers jsonb not null,
  recommendation jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, week_start)
);
alter table public.coach_checkins enable row level security;
drop policy if exists "Users manage own coach checkins" on public.coach_checkins;
create policy "Users manage own coach checkins" on public.coach_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.coach_checkins to authenticated;

comment on table public.coach_entitlements is
  'Entitlement Coach. Mutasi status hanya dari backend tepercaya/provider webhook.';
