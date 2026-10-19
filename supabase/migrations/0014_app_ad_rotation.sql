-- Satu pengguna dapat mengatur beberapa URL promosi yang diputar berurutan.
alter table public.app_ad_settings
  add column if not exists target_urls text[];

update public.app_ad_settings
  set target_urls = array[target_url]
  where target_urls is null or cardinality(target_urls) = 0;

alter table public.app_ad_settings
  alter column target_urls set default array['https://s.shopee.co.id/7AeJwNLgIX']::text[],
  alter column target_urls set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.app_ad_settings'::regclass
      and conname = 'app_ad_settings_target_urls_count_check'
  ) then
    alter table public.app_ad_settings
      add constraint app_ad_settings_target_urls_count_check
      check (cardinality(target_urls) between 1 and 20);
  end if;
end $$;

comment on column public.app_ad_settings.target_urls is
  'Daftar URL promosi yang diputar berurutan per akun dan sesi aplikasi.';
