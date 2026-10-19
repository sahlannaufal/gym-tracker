-- Pengaturan tautan promosi yang dapat diubah admin tanpa deploy aplikasi.
create table if not exists public.app_ad_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default true,
  target_url text not null default 'https://s.shopee.co.id/7AeJwNLgIX'
    check (target_url ~* '^https?://[^[:space:]]+$'),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.app_ad_settings (id, enabled, target_url)
values (1, true, 'https://s.shopee.co.id/7AeJwNLgIX')
on conflict (id) do nothing;

alter table public.app_ad_settings enable row level security;
drop policy if exists "Authenticated users read app ad settings" on public.app_ad_settings;
drop policy if exists "Admin updates app ad settings" on public.app_ad_settings;

create policy "Authenticated users read app ad settings"
  on public.app_ad_settings
  for select
  to authenticated
  using (auth.uid() is not null);

create policy "Admin updates app ad settings"
  on public.app_ad_settings
  for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com');

revoke all on table public.app_ad_settings from public, anon, authenticated;
grant select, update on table public.app_ad_settings to authenticated;

comment on table public.app_ad_settings is
  'Tautan iklan eksternal untuk pengalihan aplikasi; hanya admin yang dapat mengubahnya.';
