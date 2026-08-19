# PRD - Gym Progress Tracker

## 1. Ringkasan Produk

Aplikasi web sederhana (MVP) untuk mencatat dan memantau progres latihan beban (gym). Pengguna mencatat setiap latihan — nama latihan, beban (kg), repetisi, set, dan tanggal — lalu melihat histori dan perkembangan beban melalui grafik sederhana. Seluruh data tersimpan di LocalStorage sehingga tidak memerlukan server pada MVP awal.

## 2. Tujuan & Metrik Kesuksesan

- **Tujuan:** Membantu pengguna melacak progres kekuatan secara konsisten dan visual, sehingga bisa melihat tren beban dari waktu ke waktu.
- **Metrik MVP:**
  - Pengguna berhasil mencatat ≥ 1 workout tanpa error.
  - Histori latihan tampil akurat sesuai data yang disimpan.
  - Grafik progress beban menampilkan tren setiap latihan.
  - Data tetap ada setelah halaman di-refresh / browser ditutup.

## 3. Target Pengguna

- Pemula gym yang baru mulai dan ingin mencatat latihan dengan cepat.
- Pengangkat beban yang ingin memantau perkembangan beban (progressive overload) antar sesi.

## 4. Persona & User Stories

| User Story | Penerimaan |
|---|---|
| Sebagai pemula, saya ingin mencatat latihan dengan cepat setelah selesai berlatih agar tidak lupa beban & repetisi. | Form sederhana, 5 field, simpan sekali klik. |
| Sebagai pengangkat beban, saya ingin melihat riwayat latihan saya agar bisa membandingkan performa antar sesi. | Halaman histori menampilkan semua entri terurut tanggal. |
| Sebagai pengguna, saya ingin melihat grafik beban per latihan agar tahu apakah beban saya naik. | Grafik line yang bisa dipilih per nama latihan. |
| Sebagai pengguna, saya ingin melihat ringkasan aktivitas saya agar tahu seberapa konsisten saya latihan. | Dashboard menampilkan total workout, total set, dan workout terakhir. |

## 5. Ruang Lingkup

### 5.1 In-Scope (MVP)

- Dashboard ringkasan latihan.
- Form pencatatan workout.
- Halaman histori / log latihan.
- Grafik progress beban sederhana.
- Program latihan reusable + pemilihan program/rest day per tanggal + quick-log.
- Rest timer setelah menyimpan workout (fullscreen, durasi bisa diubah).
- Riwayat pengukuran dan summary komposisi tubuh untuk pengguna yang login.
- Google Analytics 4 untuk page-view production.
- Penyimpanan data LocalStorage.

### 5.2 Out-of-Scope (MVP)

- Autentikasi & multi-user.
- Sinkronisasi cloud (Supabase/SQLite) — fase berikutnya.
- Edit data yang sudah tersimpan.
- Template program latihan lanjutan (rotasi Push/Pull/Legs).
- Kategori otot / equipment, foto sebelum-sesudah.
- Filtering lanjutan (rentang tanggal, musim, dll).

## 6. Spesifikasi Fitur MVP

### F1. Dashboard Ringkasan Latihan

- Menampilkan ringkasan cepat:
  - Total workout tercatat.
  - Total set latihan.
  - Latihan dengan volume terbanyak (beban × set × repetisi).
  - Workout terakhir (nama latihan, beban, tanggal).
- Menampilkan tombol aksi utama **"Tambah Latihan"**.
- Dashboard otomatis ter-refresh saat data berubah.

### F2. Form Pencatatan Workout

- Field input:
  - **Nama Latihan** — dropdown dari `EXERCISE_CATEGORIES` (`lib/constants/exercises.ts`), dikelompokkan `<optgroup>` per grup otot (Chest, Back, Legs, Shoulders, Arms, Core) + opsi "Lainnya (Custom)" yang memunculkan text input untuk nama di luar daftar. *Required*.
  - **Beban/Weight (kg)** — number, *required*, > 0.
  - **Repetisi** — number, *required*, > 0.
  - **Set** — number, *required*, > 0.
  - **Tanggal** — date picker, *required*, default hari ini.
- Validasi: latihan wajib dipilih (atau nama custom tidak boleh kosong); beban/repetisi/set harus angka > 0. Tampilkan pesan error inline.
- Tombol **"Simpan"** menyimpan entri ke LocalStorage, lalu muncul **rest timer** (lihat F8); aksi "Selesai" kembali ke Dashboard.
- Tombol **"Batal"** kembali tanpa menyimpan.

### F3. Halaman Histori / Log Latihan

- Bagian "Riwayat" dari halaman **Progres** (`/progress`, segmented control dengan "Grafik").
- Menampilkan seluruh entri workout terurut tanggal **descending** (terbaru di atas).
- Filter per nama latihan (dropdown "Pilih Latihan", default "Semua Latihan").
- Filter rentang tanggal ("Dari" & "Sampai", keduanya opsional, string `YYYY-MM-DD`); berlaku bersamaan dengan filter latihan. Rentang tidak valid (Dari > Sampai) menampilkan pesan peringatan.
- Setiap item menampilkan: nama latihan, beban, repetisi, set, tanggal.
- Aksi **hapus** per entri (dengan konfirmasi).
- Tampilan kosong (empty state): pesan "Belum ada latihan, yuk catat latihan pertama" + tombol tambah.

### F4. Grafik Progress Beban

- Bagian "Grafik" dari halaman **Progres** (`/progress`, segmented control dengan "Riwayat").
- Line chart sederhana: sumbu X = tanggal, sumbu Y = beban (kg).
- Dapat dipilih per nama latihan (dropdown "Pilih Latihan"); grafik kosong sebelum memilih latihan.
- Data yang diplot: beban maksimum per tanggal untuk latihan terpilih (jika ada beberapa set dalam sehari, pakai nilai terbesar).
- Tidak memerlukan library berat; boleh pakai chart library ringan (Chart.js / Recharts) atau SVG custom sesuai kebutuhan.

### F5. Penyimpanan LocalStorage

- Key workout: `gym_tracker_workouts_v1`.
- Key program latihan: `gym_tracker_training_programs_v1` (`gym_tracker_routine_v1` hanya dibaca untuk migrasi data lama).
- Preferensi rest timer: `gym_tracker_rest_seconds_v1` (number, default 60) & `gym_tracker_rest_muted_v1` (boolean).
- Struktur: array objek workout (lihat Data Model) + program latihan + jadwal per tanggal.
- Tambahkan **versi data** agar mudah dimigrasi ke depannya.
- Handler saat JSON corrupt / tidak valid: reset data lama dengan aman tanpa crash.

### F6. Program Latihan & Jadwal Per Tanggal

- Pengguna dapat membuat beberapa **program latihan reusable** dengan nama bebas dan daftar latihan dari `EXERCISE_CATEGORIES` atau nama custom. Program dapat dibuat, diedit, dan dihapus.
- Editor **Program** tersedia sebagai view kedua di `/today` (`?view=program`). Route lama `/routine` dipertahankan sebagai redirect kompatibilitas ke view Program.
- Halaman **"Latihan Hari Ini"** (`/today`) menyediakan date picker (default hari ini, dapat memilih tanggal mendatang), lalu pengguna memilih satu program untuk tanggal itu, memilih **Rest Day**, atau membiarkannya belum dipilih. Tidak ada jadwal mingguan/default otomatis pada versi ini.
- Pemilihan program disimpan langsung per tanggal (`YYYY-MM-DD`). Mengganti pilihan tidak mengubah isi program atau histori workout yang sudah tercatat.
- Setelah program dipilih, daftar latihannya tampil untuk tanggal tersebut. Saat kartu latihan dibuka, form pencatatan set tampil langsung secara inline: tiap baris berisi beban (kg) dan repetisi, data sesi terakhir menjadi prefill awal, serta tombol **"Tambah Set"** membuat dan langsung menyimpan baris baru dengan nilai dari baris sebelumnya. Perubahan nilai disimpan otomatis saat input selesai diedit; tidak ada tombol simpan terpisah.
- Tiap latihan di list menampilkan **badge jumlah set** pada tanggal terpilih. Baris pada form inline sekaligus merepresentasikan histori set di tanggal tersebut; ikon **×** menghapus workout tersimpan beserta tombstone sinkronisasinya.
- Dashboard menampilkan kartu ringkas "Latihan Hari Ini" berupa nama program + jumlah latihan, Rest Day, atau status belum memilih, dengan tombol menuju `/today`.
- Empty state tanggal yang belum dipilih menampilkan link ke editor Program; Rest Day memiliki state khusus.
- Migrasi lokal satu kali mengubah setiap hari pada rutin lama yang tidak kosong menjadi program bernama `Rutin <Nama Hari>` tanpa menjadwalkannya otomatis ke tanggal tertentu.

### F7. Sinkronisasi Cloud (Supabase) & Login

- **Offline-first:** LocalStorage tetap sumber utama untuk UI; Supabase adalah cloud copy + identitas. PWA tetap berfungsi penuh tanpa koneksi.
- **Login opsional** (email + password via Supabase Auth): tanpa login app tetap jalan (data lokal); dengan login data disinkronkan lintas perangkat.
- **Sinkronisasi dua arah** (`lib/sync.ts`): antrian delete offline (tombstone) diproses dulu → upload workout lokal yang lebih baru (upsert by `id`) → pull server → merge **last-write-wins by `updated_at`** → tulis balik LocalStorage. Saat menulis balik, `loadWorkouts()` & `pending_deletes` dibaca ulang sehingga workout yang **disimpan** selama sync berjalan dipertahankan dan workout yang **dihapus** selama sync (tombstone baru) tidak ditulis kembali (sehingga tidak ter-upload ulang). Routine disinkronkan sebagai satu baris JSON per user dengan **last-write-wins by `updated_at`** (`updatedAt` disimpan lokal & server; perangkat baru tidak lagi menimpa data server dengan data kosong). Ada pending-sync retry bila ada perubahan selama sync berjalan.
- **Trigger sync:** saat login/logout, event `online`, window focus, dan setelah setiap mutasi (add/hapus workout, program, atau jadwal tanggal) via `requestSync()`.
- **Tabel Supabase**: `workouts` (`id text PK`, `user_id uuid` FK `auth.users`, kolom entri + `created_at`/`updated_at`) & `routine` (`id uuid PK = user_id`; kolom legacy `days`/`updated_at`; kolom `programs`, `schedule`, dan `program_updated_at` dari `0003_training_programs.sql`), semuanya **RLS** (`auth.uid() = user_id`). Program dan jadwal disinkronkan sebagai satu dokumen dengan last-write-wins memakai `program_updated_at`.
- **Status sinkronisasi** tampil di halaman Profil (`/account`): belum tersinkron / menyinkronkan / tersinkron / gagal + tombol "Sinkronkan Sekarang" & "Keluar".
- **Verifikasi email (signup):** saat daftar, `signUp` mengirim `options.emailRedirectTo = <origin>/auth/callback` sehingga link konfirmasi mendarat di halaman client `/auth/callback` (bukan root `/`). Token verifikasi dibawa di hash fragment (`#access_token=...&refresh_token=...&type=signup`, flow **implicit** — eksplisit di `lib/supabase/client.ts` dengan `flowType: "implicit"` dan `detectSessionInUrl: true`); SDK auto-mendeteksi & menyimpan session saat bundle dimuat. Halaman `/auth/callback` menampilkan: loading → sukses (redirect ke `/account`) atau error (fragment `error`/`error_description`, mis. `otp_expired` → tampilkan pesan + kembali ke `/login`).
- **Konfigurasi dashboard Supabase wajib:** Authentication → URL Configuration → **Site URL** = domain produksi, dan **Redirect URLs** berisi `https://<domain>/**` (produksi) + `http://localhost:3000/**` (dev). Tanpa ini `emailRedirectTo` diabaikan dan link email memakai Site URL yang terkonfigurasi (jika `http://localhost:3000`, link akan salah arah).
- Env: `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dibutuhkan saat build Docker).

### F8. Rest Timer Setelah Menyimpan Workout

- Setelah menekan **"Simpan"** pada form pencatatan, workout tersimpan lalu muncul **timer fullscreen** untuk menghitung waktu istirahat antar set.
- Hitung mundur tampil besar (format `MM:SS`) + progress bar; auto-start saat muncul.
- **Durasi dapat diubah** dengan stepper `-30s`/`+30s` dan preset `30 / 60 / 90 / 120` detik; **default 60 detik**. Pilihan tersimpan di LocalStorage (`gym_tracker_rest_seconds_v1`) dan dipakai sebagai default berikutnya.
- Kontrol: **Jeda/Lanjut**, **Lewati** (langsung ke layar selesai tanpa sinyal), dan toggle **Suara Nyala/Mati** (`gym_tracker_rest_muted_v1`).
- Saat selesai: notifikasi **beep via Web Audio API** + **vibrasi** (kecuali muted), lalu dua aksi:
  - **"Catat Set Berikutnya"** — kembali ke form dengan nama latihan & tanggal dipertahankan, beban/repetisi/set dikosongkan (fokus ke field beban).
  - **"Selesai"** — kembali ke Dashboard.
- Timer berjalan penuh di client (tidak ada request jaringan), aman untuk mode offline/PWA.
- Pada form inline **Latihan Hari Ini**, timer dimulai manual melalui tombol **"Mulai Istirahat"** di dalam kartu latihan. Timer tampil sebagai panel floating di atas bottom navigation agar tetap terlihat saat collapse ditutup atau latihan lain dibuka. Panel menyediakan progress, jeda/lanjut, `-30s`/`+30s`, lewati, toggle suara, dan sinyal suara/vibrasi saat selesai; memulai timer dari latihan lain akan mereset timer aktif menggunakan durasi preferensi terakhir.

### F9. Riwayat & Summary Komposisi Tubuh

- Tersedia di halaman **Profil** hanya setelah pengguna login.
- Form menyimpan tanggal pengukuran, berat (kg), tinggi (cm), body fat (%) opsional, dan muscle mass (kg) opsional.
- Setiap pengukuran disimpan sebagai histori; tinggi pengukuran terakhir menjadi prefill berikutnya. Pengguna dapat menghapus entri.
- Summary terbaru menampilkan BMI, perubahan berat, estimasi massa lemak, persentase massa otot, dan insight sederhana berdasarkan perubahan dari pengukuran sebelumnya. Insight bukan diagnosis medis dan angka smart scale dianjurkan untuk dibaca sebagai tren.
- Offline-first dengan cache LocalStorage per `user_id`, pending-delete, dan sinkronisasi dua arah last-write-wins melalui tabel Supabase `body_measurements` dengan RLS. Migration upgrade: `supabase/migrations/0002_body_measurements.sql`.

### F10. Google Analytics

- Google tag memakai measurement ID `G-JJ4FVTJ9TY` dan dimuat non-blocking melalui `next/script` setelah halaman interaktif.
- Analytics hanya aktif pada build production sehingga aktivitas development/localhost tidak masuk ke laporan.
- Page view dicatat pada load awal dan setiap navigasi client-side App Router, termasuk query string.
- Implementasi tidak mengirim data workout, pengukuran tubuh, email, atau isi LocalStorage sebagai event analytics.

## 7. Data Model

```json
// localStorage["gym_tracker_workouts_v1"]
{
  "version": 1,
  "workouts": [
    {
      "id": "w_1700000000000_abc123",
      "exercise": "Bench Press",
      "weight": 60,       // kg
      "reps": 8,
      "sets": 3,
      "date": "2026-08-04", // format YYYY-MM-DD
      "createdAt": "2026-08-04T09:30:00.000Z"
    }
  ]
}
```

- **id:** unik, dihasilkan dari timestamp + random suffix.
- **exercise:** nama latihan (bukan `exercise_name`), diisi dari `EXERCISE_CATEGORIES` di `lib/constants/exercises.ts`, atau teks bebas dari opsi "Lainnya (Custom)".
- **date:** hanya tanggal (tanpa waktu) sebagai basis grouping & grafik.
- **createdAt:** timestamp lengkap saat pencatatan.
- **updatedAt:** timestamp terakhir diubah (untuk merge sinkronisasi, last-write-wins).

Riwayat komposisi tubuh menggunakan model `BodyMeasurement`: `id`, `weightKg`, `heightCm`, `bodyFatPercentage?`, `muscleMassKg?`, `measuredAt`, `createdAt`, dan `updatedAt`. Cache lokal dipisahkan per akun dengan key `gym_tracker_body_measurements_v1_<user_id>`.

> **Sinkronisasi:** workout direpresentasikan di tabel `workouts`. Program dan jadwal tanggal disimpan pada kolom JSONB tabel `routine` (migration `0003_training_programs.sql`). Kolom `updated_at`/`program_updated_at` di DB ↔ `updatedAt` di client.

```json
// localStorage["gym_tracker_training_programs_v1"]
{
  "version": 1,
  "programs": [
    {
      "id": "p_1700000000000_abc123",
      "name": "Push Day",
      "exercises": ["Bench Press (Barbell)", "Shoulder Press", "Tricep Extension"],
      "createdAt": "2026-08-17T09:30:00.000Z",
      "updatedAt": "2026-08-17T09:30:00.000Z"
    }
  ],
  "schedule": {
    "2026-08-17": {
      "programId": "p_1700000000000_abc123",
      "updatedAt": "2026-08-17T09:35:00.000Z"
    },
    "2026-08-18": {
      "programId": null,
      "updatedAt": "2026-08-17T09:36:00.000Z"
    }
  },
  "updatedAt": "2026-08-17T09:36:00.000Z"
}
```

- **programs:** daftar paket latihan reusable. ID stabil dipakai oleh jadwal tanggal.
- **schedule:** map tanggal `YYYY-MM-DD` → assignment. `programId: null` berarti Rest Day; key yang tidak ada berarti belum memilih program.
- **updatedAt:** timestamp perubahan terakhir dokumen program/jadwal untuk sinkronisasi last-write-wins.

## 8. Alur Navigasi (Wireframe Teks)

```
+----------------+      +------------------+      +------------------+
|   Dashboard    | ---> |   Form Tambah    | ---> |   Simpan -> Home |
|  (Ringkasan)   | <--- |   Workout        |      +------------------+
+----------------+      +------------------+
|      |                          ^
v      v                          |
+----------------+      +------------------+
|   Hari Ini     |      |  Progres:        |
| Latihan|Program|      |  Riwayat | Grafik |
+----------------+      +------------------+
```

- **Bottom navigation (mobile-first):** tab bawah tetap — **Beranda** (`/`), **Hari Ini** (`/today`), FAB **+ Tambah** (`/workout/new`), **Progres** (`/progress`), **Profil** (`/account`).
- **Hari Ini** memuat dua view (segmented control): **Latihan** (date picker + pilihan program/Rest Day + quick-log) dan **Program** (buat/edit/hapus paket latihan). `/routine` redirect → `/today?view=program`.
- **Progres** memuat dua view (segmented control): **Riwayat** (list histori + filter latihan/rentang tanggal + hapus) dan **Grafik** (chart beban per latihan). `/history` redirect → `/progress`.
- Setelah simpan entri: kembali ke Dashboard.
- Dashboard menampilkan kartu "Latihan Hari Ini" berisi nama program, jumlah latihan, Rest Day, atau status belum memilih → `/today`.

## 9. Non-Functional Requirements

- **Mobile-first & responsif:** pencatatan dilakukan saat di gym, harus nyaman di layar HP.
- **Installable (PWA):** dapat di-install ke home screen (manifest + service worker via Serwist/Turbopack), tombol install via `beforeinstallprompt`.
- **Offline:** seluruh halaman di-precache sehingga bisa dipakai tanpa koneksi (data tetap di LocalStorage); fallback `/~offline` untuk navigasi yang belum dicache.
- **Performa:** load cepat; tidak ada request jaringan (data lokal).
- **Keandalan data:** data tidak hilang saat refresh; penanganan error LocalStorage.
- **Usability:** minimal klik untuk mencatat (≤ 2 langkah dari dashboard).
- **Kode bersih & modular:** pemisahan logika storage/service, komponen UI, dan halaman.

## 10. Milestone Pengembangan

| Milestone | Deliverable |
|---|---|
| M1 | Setup project, routing/navigasi, service LocalStorage (baca/tulis/hapus) + data model. |
| M2 | Form pencatatan workout + validasi + simpan. |
| M3 | Dashboard ringkasan. |
| M4 | Halaman histori + hapus entri. |
| M5 | Grafik progress beban. |
| M6 | Program latihan reusable: CRUD program + pemilihan program/Rest Day per tanggal + halaman "Latihan Hari Ini" dengan quick-log (prefill sesi terakhir). |
| M7 | Polish: empty state, error handling, testing, update PRD jika ada perubahan. |

## 11. Definition of Done

- Semua acceptance criteria fitur terpenuhi.
- Data tersimpan & bertahan setelah refresh.
- Validasi bekerja (input kosong / tidak valid ditolak).
- Diuji oleh pengguna (sesuai workflow: satu modul selesai → minta pengguna menguji sebelum lanjut).
- `PRD.md` tetap sinkron dengan implementasi; `AGENTS.md` diperbarui jika ada perubahan arsitektur.

## 12. Roadmap (Non-MVP / Fase Berikutnya)

- Edit & duplikasi entri.
- Perhitungan 1RM (Epley/Brzycki) & target progressive overload.
- Default jadwal mingguan opsional dan rotasi program otomatis (mis. Push/Pull/Legs).
- Prefill beban/repetisi/set dari sesi terakhir di shortcut "Catat Latihan" (sudah aktif di MVP F6).
- Sinkronisasi cloud (Supabase + login) sudah aktif di MVP — lihat F7. Berikutnya: penyelesaian konflik yang lebih halus & sinkronisasi realtime.
- Ekspor data (CSV/JSON) & backup.
- Statistik lanjutan: volume mingguan, streak, kalender aktivitas.

## 13. Risiko & Asumsi

- **Asumsi:** single user, bisa multi perangkat dengan akun yang sama.
- **Risiko LocalStorage:** kapasitas terbatas (±5MB) — diatasi dengan sinkronisasi ke Supabase (F7); LocalStorage tetap menjadi cache offline.
- **Risiko bentrok data:** ditangani sederhana dengan last-write-wins by `updated_at`; untuk single user risiko rendah.
- **Risiko data korup:** ditangani dengan versioning & validasi saat load.
- **Prasyarat PWA:** service worker & install hanya aktif di HTTPS (localhost dikecualikan). Perlu deploy (Vercel/Netlify) agar bisa di-install dari HP.
- **Prasyarat sinkronisasi:** variabel env Supabase wajib diisi saat build Docker.
