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
- Rutin latihan harian (jadwal mingguan + quick-log).
- Penyimpanan data LocalStorage.

### 5.2 Out-of-Scope (MVP)

- Autentikasi & multi-user.
- Sinkronisasi cloud (Supabase/SQLite) — fase berikutnya.
- Edit data yang sudah tersimpan.
- Template program latihan lanjutan (rotasi Push/Pull/Legs) & rest timer.
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
- Tombol **"Simpan"** menyimpan entri ke LocalStorage, lalu kembali ke halaman sebelumnya (dashboard/histori).
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
- Key rutin: `gym_tracker_routine_v1`.
- Struktur: array objek workout (lihat Data Model) + rutin harian.
- Tambahkan **versi data** agar mudah dimigrasi ke depannya.
- Handler saat JSON corrupt / tidak valid: reset data lama dengan aman tanpa crash.

### F6. Rutin Latihan Harian

- Atur jadwal **mingguan tetap** (Senin–Minggu): tiap hari berisi list latihan (dari `EXERCISE_CATEGORIES` atau nama custom).
- Editor rutin (`/routine`): tambah/hapus hanya mengubah **draft lokal** per hari → ada tombol **"Simpan"** per hari (persist via `setDayExercises`) dengan indikator "Belum disimpan" / "✓ Tersimpan". Bukan auto-save global.
- Halaman **"Latihan Hari Ini"** (`/today`) menampilkan list latihan berdasarkan tanggal terpilih (date picker, default hari ini; label nama hari). Tiap latihan punya tombol **"Catat Latihan"** → shortcut ke `/workout/new?exercise=<nama>`, di mana nama latihan ter-pilih otomatis dan **beban/repetisi/set di-prefill dari sesi terakhir** latihan tersebut (tanggal tetap hari ini). Tombol "Set Latihan Harian" → `/routine`.
- Tiap latihan di list menampilkan **badge jumlah set** pada tanggal terpilih, dan tombol **dropdown (chevron)** untuk **expand riwayat progres latihan itu di tanggal tersebut** (entri per jam: beban × rep × set + aksi hapus).
- Dashboard menampilkan kartu ringkas "Latihan Hari Ini" (jumlah latihan) → tombol "Isi Sekarang" / "Set Latihan Harian".
- Empty state: hari tanpa rutin menampilkan link ke editor rutin.

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

```json
// localStorage["gym_tracker_routine_v1"]
{
  "version": 1,
  "days": {
    "minggu": [],
    "senin": ["Bench Press (Barbell)", "Squat"],
    "selasa": [],
    "rabu": ["Pull-Up / Chin-Up"],
    "kamis": [],
    "jumat": ["Deadlift"],
    "sabtu": []
  }
}
```

- **days:** map `Weekday` (minggu–sabtu, indeks sama dengan `Date.getDay()`) → list nama latihan unik.

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
|  Latihan | Rutin|      |  Riwayat | Grafik |
+----------------+      +------------------+
```

- **Bottom navigation (mobile-first):** tab bawah tetap — **Beranda** (`/`), **Hari Ini** (`/today`), FAB **+ Tambah** (`/workout/new`), **Progres** (`/progress`).
- **Hari Ini** memuat dua view (segmented control): **Latihan** (date picker + list latihan per tanggal + "Catat Latihan") dan **Rutin** (editor jadwal mingguan, simpan per hari). `/routine` redirect → `/today?view=rutin`.
- **Progres** memuat dua view (segmented control): **Riwayat** (list histori + filter latihan/rentang tanggal + hapus) dan **Grafik** (chart beban per latihan). `/history` redirect → `/progress`.
- Setelah simpan entri: kembali ke Dashboard.
- Dashboard menampilkan kartu "Latihan Hari Ini" → `/today` (jika ada rutin) atau `/today?view=rutin` (jika belum).

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
| M6 | Rutin latihan harian: editor jadwal mingguan (simpan per hari) + halaman "Latihan Hari Ini" per tanggal dengan shortcut "Catat Latihan" (prefill sesi terakhir). |
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
- Template program latihan lanjutan (rotasi Push/Pull/Legs).
- Prefill beban/repetisi/set dari sesi terakhir di shortcut "Catat Latihan" (sudah aktif di MVP F6).
- Sinkronisasi cloud: Supabase / SQLite (multi-device).
- Ekspor data (CSV/JSON) & backup.
- Statistik lanjutan: volume mingguan, streak, kalender aktivitas.

## 13. Risiko & Asumsi

- **Asumsi:** single user, data perangkat (browser) yang sama.
- **Risiko LocalStorage:** kapasitas terbatas (±5MB) & tidak lintas perangkat — cukup untuk MVP, jadi alasan utama migrasi ke Supabase di fase berikutnya.
- **Risiko data korup:** ditangani dengan versioning & validasi saat load.
- **Prasyarat PWA:** service worker & install hanya aktif di HTTPS (localhost dikecualikan). Perlu deploy (Vercel/Netlify) agar bisa di-install dari HP.
