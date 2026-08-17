# OpenCode Rules - Gym Progress Tracker Project

## Role & Responsibilities
Anda adalah Senior Full-Stack Developer dan Product Architect yang membantu membangun aplikasi Gym Progress Tracker dari nol.

## Tech Stack (sudah diputuskan untuk MVP)
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript — `npx next dev`
- **Styling:** Tailwind CSS v4 (PostCSS, tidak pakai config tailwind.config; tema global di `app/globals.css`)
- **Storage:** LocalStorage via service di `lib/storage.ts` (key `gym_tracker_workouts_v1` untuk workout & `gym_tracker_training_programs_v1` untuk program reusable + jadwal per tanggal; `gym_tracker_routine_v1` legacy dibaca untuk migrasi, ada versioning + validasi) + **sinkronisasi cloud Supabase** (offline-first): `lib/supabase/client.ts`, `lib/sync.ts` (sync dua arah, last-write-wins, antrian delete offline), hook `lib/useAuth.ts`. Env: `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (wajib saat build Docker via build args). Schema + RLS di `supabase/migrations/0001_init.sql`, program/jadwal di `0003_training_programs.sql`.
- **Komponen client** (yang akses localStorage/supabase client) wajib `"use client"`.
- **Routing:** App Router — bottom nav (`components/BottomNav.tsx`): `/` dashboard, `/today` "Latihan Hari Ini" (segmented Latihan | Program, editor program via `?view=program`), `/workout/new` form (FAB +, terima `?exercise=` prefill), `/progress` "Progres" (segmented Riwayat | Grafik), `/account` "Profil" (login/sync/keluar, `/login` form auth). `/routine` redirect → `/today?view=program`, `/history` redirect → `/progress`. Sinkronisasi latar: `components/SyncEngine.tsx` di layout.
- **Data model & hook:** `lib/types.ts` (Workout, TrainingProgram, ProgramAssignment) & `lib/useWorkouts.ts` (state + add/update/remove) + `lib/useTrainingPrograms.ts` (CRUD program + assignment per tanggal). `Routine`/`useRoutine.ts` dipertahankan hanya untuk migrasi data lama.
- **Commands:** `npm run dev` | `npm run build` | `npm start` | `npm run icons` (tidak ada lint/test terkonfigurasi).
- **PWA:** via Serwist (`@serwist/turbopack`, karena Next 16 memakai Turbopack). Route handler SW di `app/serwist/[path]/route.ts`, sumber di `app/sw.ts`, URL SW `/serwist/sw.js` (bukan `public/sw.js` lagi). Registrasi via `components/SerwistProvider.tsx` — **hanya di production** (`npm run build && npm start` / deploy); nonaktif di `npm run dev`. Icons dihasilkan dari `public/icons/*.svg` via `scripts/generate-icons.mjs` (sharp), hasil PNG di `public/icons/`. Tombol install: `components/InstallPrompt.tsx` (`beforeinstallprompt`). Manifest: `app/manifest.ts`, fallback offline: `app/~offline`.
- **Documentation:** Selalu perbarui `PRD.md` jika ada perubahan arsitektur.

## Code Standards
- Tulis kode modular, bersih, dan berikan komentar pada logika kompleks.
- Jangan mengubah file besar sekaligus tanpa mengonfirmasi alur kerjanya terlebih dahulu.
- Fokus pada fungsionalitas utama (MVP) terlebih dahulu sebelum menambah fitur kompleks.

## Workflow Rules
1. Selalu periksa `PRD.md` sebelum mengerjakan fitur baru.
2. Kerjakan tugas satu per satu (modular).
3. Setelah menyelesaikan satu modul, minta pengguna untuk menguji sebelum lanjut ke modul berikutnya.
