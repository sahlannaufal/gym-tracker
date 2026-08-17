-- Program latihan reusable dan pemilihan program per tanggal.
-- Tetap memakai satu baris per user pada tabel routine agar sinkronisasi
-- offline-first dapat menggunakan last-write-wins untuk satu dokumen utuh.
alter table public.routine
  add column if not exists programs jsonb not null default '[]'::jsonb,
  add column if not exists schedule jsonb not null default '{}'::jsonb,
  add column if not exists program_updated_at timestamptz;

comment on column public.routine.programs is
  'Daftar program latihan reusable milik pengguna.';
comment on column public.routine.schedule is
  'Map tanggal YYYY-MM-DD ke object assignment; programId null menandai rest day.';
comment on column public.routine.program_updated_at is
  'Timestamp last-write-wins khusus dokumen program dan jadwal.';
