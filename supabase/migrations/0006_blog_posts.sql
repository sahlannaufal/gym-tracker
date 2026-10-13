-- Konten blog dikelola lewat /dashboard (admin). Body artikel disimpan sebagai
-- HTML hasil editor WYSIWYG, bukan struktur heading/paragraf terpisah.
--
-- Migration ini idempotent: aman dijalankan ulang, dan memperbaiki tabel
-- `blog_posts` yang mungkin sudah dibuat sebelumnya tanpa seluruh kolom
-- (mis. `intro`, `reading_time`) atau dengan policy lama.
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  intro text not null default '',
  published_at date,
  reading_time text not null default '',
  keywords text[] not null default '{}',
  content_html text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Tabel lama (pramigrasi) dapat melewatkan dua kolom berikut.
alter table public.blog_posts add column if not exists intro text not null default '';
alter table public.blog_posts add column if not exists reading_time text not null default '';

-- Jaminan integritas bila tabel dibuat tanpa constraint ini.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.blog_posts'::regclass
      and c.contype in ('u', 'p')
      and a.attname = 'slug'
  ) then
    alter table public.blog_posts add constraint blog_posts_slug_key unique (slug);
  end if;

  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.blog_posts'::regclass
      and c.contype = 'c'
      and a.attname = 'status'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_status_check check (status in ('draft', 'published'));
  end if;
end $$;

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

-- Ganti seluruh policy lama pada blog_posts agar definisi keamanan di bawah
-- satu-satunya yang berlaku (mencegah policy sisa yang terlalu permisif).
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'blog_posts'
  loop
    execute format('drop policy %I on public.blog_posts', pol.policyname);
  end loop;
end $$;

-- Pembaca publik (anon) hanya melihat artikel yang sudah dipublish.
create policy "Published blog posts are publicly readable"
  on public.blog_posts
  for select
  using (status = 'published');

-- Satu akun admin (dicek lewat klaim email pada JWT) berwenang penuh,
-- termasuk membaca dan mengelola draft.
create policy "Admin manages all blog posts"
  on public.blog_posts
  for all
  using ((select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com');

-- Role anon tidak pernah boleh menulis, apa pun policy yang terpasang.
revoke insert, update, delete on table public.blog_posts from anon;
-- Pastikan hak baca publik dan hak tulis admin (role authenticated) eksplisit
-- ada, meski tabel dibuat dengan konfigurasi grant yang berbeda.
grant select on table public.blog_posts to anon;
grant select, insert, update, delete on table public.blog_posts to authenticated;

-- Bucket publik untuk gambar artikel (dipilih dari editor maupun cover).
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Bersihkan policy storage lama yang menunjuk bucket ini, lalu pasang ulang.
-- Catatan: pg_policies menyimpan ekspresi di kolom `qual` (USING) dan
-- `with_check` — tidak ada kolom `definition` di view ini.
do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        qual ilike '%blog-images%'
        or with_check ilike '%blog-images%'
      )
  loop
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy "Blog images are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'blog-images');

create policy "Admin uploads blog images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'blog-images'
    and (select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com'
  );

create policy "Admin updates blog images"
  on storage.objects
  for update
  using (
    bucket_id = 'blog-images'
    and (select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com'
  )
  with check (
    bucket_id = 'blog-images'
    and (select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com'
  );

create policy "Admin deletes blog images"
  on storage.objects
  for delete
  using (
    bucket_id = 'blog-images'
    and (select auth.jwt() ->> 'email') = 'sahlannaufal.sn@gmail.com'
  );
