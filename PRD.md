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
- Floating rest timer yang konsisten pada quick-log dan form tambah workout.
- Tutorial gerakan untuk latihan bawaan dengan animasi yang dimuat saat diminta.
- Riwayat pengukuran dan summary komposisi tubuh untuk pengguna yang login.
- Coach opsional untuk goal membangun massa otot dan target frekuensi latihan mingguan.
- Daftar latihan custom per akun yang dapat dipakai ulang pada pencatatan workout dan editor program.
- Google Analytics 4 untuk page-view production.
- Mixpanel Analytics production-only untuk funnel autentikasi, penggunaan workout, progres, dan sinkronisasi.
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
  - Jumlah sesi minggu ini berdasarkan tanggal latihan unik (tanggal mendatang tidak dihitung).
  - Total set minggu ini.
  - Otot terakhir dilatih dari seluruh workout pada tanggal aktual terbaru: diagram anatomi depan/belakang dari `react-body-highlighter` menyorot otot utama dengan hijau terang dan otot pendukung dengan hijau gelap. Badge tekstual tetap ditampilkan sebagai keterangan/fallback; ringkasan jumlah latihan/set dan kartu Personal Best tidak ditampilkan.
- Kartu **Sesi Minggu Ini** dan **Set Minggu Ini** memakai tampilan ringkas dengan padding, label, angka, dan jarak antarkartu yang lebih kecil.
- Dashboard tidak menampilkan tombol **"Tambah Latihan"**; akses pencatatan tetap tersedia melalui FAB navigasi bawah.
- Kartu **Latihan Hari Ini** tampil dalam satu baris. Saat program belum dipilih kartu hanya menampilkan label dan tombol **Pilih Program**; setelah dipilih kartu menampilkan nama program tanpa jumlah latihan.
- Dashboard otomatis ter-refresh saat data berubah.
- Menampilkan heatmap **Aktivitas 12 Bulan Terakhir** bergaya contribution graph GitHub: 52 kolom minggu × 7 baris hari tanpa interaksi per kotak. Nama bulan berada di atas kelompok minggu dan grid dapat digeser horizontal pada layar sempit; posisi awal scroll otomatis berada di ujung kanan agar bulan serta minggu terbaru langsung terlihat. Intensitas warna dihitung dari total set harian (0, 1–3, 4–6, 7–10, dan >10 set), dilengkapi jumlah minggu aktif tanpa skor persentase konsistensi.
- Metadata `primaryMuscles`/`secondaryMuscles` untuk latihan bawaan disimpan statis di `lib/constants/exerciseMuscles.ts`, terpisah dari model workout agar offline-ready dan tidak memerlukan migrasi storage/database. Latihan custom menggunakan fallback `Lainnya`.

### F2. Form Pencatatan Workout

- Field input:
  - **Nama Latihan** — memakai picker katalog yang sama dengan editor Program: pencarian, filter bagian tubuh/equipment, infinite scroll, bagian **Latihan Saya** untuk nama custom milik akun, tombol Tutorial, serta opsi **Latihan custom** yang memunculkan text input. *Required*.
  - **Beban/Weight (kg)** — number, *required*, > 0.
  - **Repetisi** — number, *required*, > 0.
  - **Set** — number, *required*, > 0.
  - **Tanggal** — date picker, *required*, default hari ini.
- Validasi: latihan wajib dipilih (atau nama custom tidak boleh kosong); beban/repetisi/set harus angka > 0. Tampilkan pesan error inline.
- Tombol **"Simpan"** menyimpan entri ke LocalStorage, menampilkan toast kecil **"✓ Data tersimpan"** di bagian atas layar selama sekitar 2,5 detik, lalu memulai **floating rest timer** (lihat F8) tanpa meninggalkan form.
- Tombol **"Batal"** kembali tanpa menyimpan.

### F3. Halaman Histori / Log Latihan

- Bagian "Riwayat" dari halaman **Progres** (`/progress`, tab kedua setelah "Grafik").
- Menampilkan seluruh entri workout terurut tanggal **descending** (terbaru di atas).
- Filter per nama latihan (dropdown "Pilih Latihan", default "Semua Latihan").
- Filter rentang tanggal ("Dari" & "Sampai", keduanya opsional, string `YYYY-MM-DD`); berlaku bersamaan dengan filter latihan. Rentang tidak valid (Dari > Sampai) menampilkan pesan peringatan.
- Setiap item menampilkan: nama latihan, beban, repetisi, set, tanggal.
- Aksi **hapus** per entri (dengan konfirmasi).
- Tampilan kosong (empty state): pesan "Belum ada latihan, yuk catat latihan pertama" + tombol tambah.

### F4. Grafik Progress Beban

- Bagian "Grafik" dari halaman **Progres** (`/progress`) menjadi tab pertama dan tampilan default, diikuti tab "Riwayat". View tetap menampilkan judul "Grafik Progress", sedangkan label visual "Pilih Latihan" di atas dropdown dihilangkan; nama aksesibel tetap tersedia melalui `aria-label`.
- Line chart sederhana: sumbu X = tanggal, sumbu Y = beban (kg).
- Dapat dipilih per nama latihan (dropdown "Pilih Latihan"); grafik kosong sebelum memilih latihan.
- Data yang diplot: beban maksimum per tanggal untuk latihan terpilih (jika ada beberapa set dalam sehari, pakai nilai terbesar).
- Nama latihan tidak diulang di dalam kartu grafik karena sudah terlihat pada dropdown; keterangan "Beban maksimum per sesi" ditempatkan sebagai informasi di bawah grafik.
- Setelah latihan dipilih, ringkasan Max Beban, Total Volume, dan Total Sesi ditampilkan sebagai tiga kartu ringkas berukuran kecil.
- Tidak memerlukan library berat; boleh pakai chart library ringan (Chart.js / Recharts) atau SVG custom sesuai kebutuhan.

### F5. Penyimpanan LocalStorage

- Key workout per akun: `gym_tracker_workouts_v1_<user_id>`.
- Key program latihan per akun: `gym_tracker_training_programs_v1_<user_id>` (`gym_tracker_routine_v1_<user_id>` hanya dibaca untuk migrasi data lama).
- Tombstone penghapusan workout juga dipisahkan per akun melalui `gym_tracker_pending_delete_v1_<user_id>`. Data dari key global versi lama diklaim satu kali oleh akun pertama yang aktif, sehingga upgrade tidak mencampurkan data saat beberapa akun memakai browser yang sama.
- Preferensi rest timer: `gym_tracker_rest_seconds_v1` (number, default 60) & `gym_tracker_rest_muted_v1` (boolean).
- Struktur: array objek workout (lihat Data Model) + program latihan + jadwal per tanggal.
- Tambahkan **versi data** agar mudah dimigrasi ke depannya.
- Handler saat JSON corrupt / tidak valid: reset data lama dengan aman tanpa crash.

### F6. Program Latihan & Jadwal Per Tanggal

- Pengguna dapat membuat beberapa **program latihan reusable** dengan nama bebas dan daftar latihan dari `EXERCISE_CATEGORIES` atau nama custom. Program dapat dibuat, diedit, dan dihapus.
- Daftar program tidak menampilkan seluruh nama latihan secara inline. Setiap card dapat dibuka melalui tombol panah untuk menampilkan list latihan bernomor; setiap latihan pada list menyediakan tombol **Tutorial**. Subjudul penjelasan paket latihan tidak ditampilkan.
- Editor **Program** tersedia sebagai view kedua di `/today` (`?view=program`). Route lama `/routine` dipertahankan sebagai redirect kompatibilitas ke view Program.
- Halaman **"Latihan Hari Ini"** (`/today`) langsung memakai tanggal lokal hari ini tanpa date picker. Pengguna memilih satu program untuk hari ini, memilih **Rest Day**, atau membiarkannya belum dipilih. Tidak ada jadwal mingguan/default otomatis pada versi ini.
- Pemilihan program tetap disimpan dengan key tanggal hari ini (`YYYY-MM-DD`). Mengganti pilihan tidak mengubah isi program atau histori workout yang sudah tercatat. Nama dan jumlah latihan ditampilkan langsung di dalam opsi selector (mis. `Pull Day · 6 latihan`), tanpa teks ringkasan tambahan di bawah selector.
- Setelah program dipilih, daftar latihannya tampil untuk hari ini. Saat kartu latihan dibuka, form pencatatan set tampil langsung secara inline: tiap baris berisi beban (kg) dan repetisi, data sesi terakhir menjadi prefill awal, serta tombol **"Tambah Set"** membuat dan langsung menyimpan baris baru dengan nilai dari baris sebelumnya. Perubahan nilai disimpan otomatis saat input selesai diedit; tidak ada tombol simpan terpisah.
- Tiap latihan di list menampilkan **badge jumlah set** hari ini. Baris pada form inline sekaligus merepresentasikan histori set hari ini; ikon **×** menghapus workout tersimpan beserta tombstone sinkronisasinya.
- Dashboard menampilkan kartu ringkas "Latihan Hari Ini" berupa nama program, Rest Day, atau hanya label saat belum memilih, dengan tombol menuju `/today`.
- Empty state hari yang belum dipilih menampilkan link ke editor Program; Rest Day memiliki state khusus.
- Migrasi lokal satu kali mengubah setiap hari pada rutin lama yang tidak kosong menjadi program bernama `Rutin <Nama Hari>` tanpa menjadwalkannya otomatis ke tanggal tertentu.

### F7. Sinkronisasi Cloud (Supabase) & Login

- **Offline-first:** LocalStorage tetap sumber utama untuk UI; Supabase adalah cloud copy + identitas. PWA tetap berfungsi penuh tanpa koneksi.
- **Login wajib untuk masuk ke aplikasi** (email + password via Supabase Auth): auth gate menunggu pemulihan session client, mengarahkan user tanpa session ke `/login`, dan mengarahkan user dengan session aktif yang membuka `/login` ke beranda. Session yang masih valid dipulihkan dari persistence Supabase sehingga user yang pernah login tidak perlu login ulang.
- **Google OAuth:** form Masuk dan Daftar menyediakan tombol Google setelah pemisah “Atau”. Tombol memakai `signInWithOAuth({ provider: "google" })` dengan `prompt=select_account` agar pemilih akun selalu tampil, lalu kembali melalui `/auth/callback`; pengguna Google baru langsung dibuat tanpa konfirmasi email, sedangkan identitas dengan email terverifikasi yang sama ditautkan otomatis oleh Supabase. Intent OAuth disimpan sementara di `sessionStorage` agar callback dapat membedakan analytics registrasi dan login tanpa menyimpan token provider.
- **Sinkronisasi dua arah** (`lib/sync.ts`): antrian delete offline (tombstone) diproses dulu → upload workout lokal yang lebih baru (upsert by `id`) → pull server → merge **last-write-wins by `updated_at`** → tulis balik LocalStorage. Saat menulis balik, `loadWorkouts()` & `pending_deletes` dibaca ulang sehingga workout yang **disimpan** selama sync berjalan dipertahankan dan workout yang **dihapus** selama sync (tombstone baru) tidak ditulis kembali (sehingga tidak ter-upload ulang). Routine disinkronkan sebagai satu baris JSON per user dengan **last-write-wins by `updated_at`** (`updatedAt` disimpan lokal & server; perangkat baru tidak lagi menimpa data server dengan data kosong). Ada pending-sync retry bila ada perubahan selama sync berjalan.
- **Trigger sync:** saat login/logout, event `online`, window focus, dan setelah setiap mutasi (add/hapus workout, program, atau jadwal tanggal) via `requestSync()`.
- **Tabel Supabase**: `workouts` (`id text PK`, `user_id uuid` FK `auth.users`, kolom entri + `created_at`/`updated_at`) & `routine` (`id uuid PK = user_id`; kolom legacy `days`/`updated_at`; kolom `programs`, `schedule`, dan `program_updated_at` dari `0003_training_programs.sql`), semuanya **RLS** (`auth.uid() = user_id`). Program dan jadwal disinkronkan sebagai satu dokumen dengan last-write-wins memakai `program_updated_at`.
- **Status sinkronisasi** tampil di kartu akun pada halaman Profil (`/account`): belum tersinkron / menyinkronkan / tersinkron / gagal, dengan icon button siklus di sisi kanan. Ikon berputar dan tombol dinonaktifkan selama sinkronisasi. Logout menjadi baris aksi terpisah di bagian bawah halaman dengan ikon keluar dan dialog konfirmasi; logout tidak menghapus data lokal.
- **Verifikasi email (signup):** saat daftar, `signUp` mengirim `options.emailRedirectTo = <origin>/auth/callback` sehingga link konfirmasi mendarat di halaman client `/auth/callback` (bukan root `/`). Setelah signup yang memerlukan verifikasi, form tetap menampilkan state “Cek email” dan tidak otomatis berpindah ke form login. Token verifikasi dibawa di hash fragment (`#access_token=...&refresh_token=...&type=signup`, flow **implicit** — eksplisit di `lib/supabase/client.ts` dengan `flowType: "implicit"` dan `detectSessionInUrl: true`); SDK auto-mendeteksi & menyimpan session saat bundle dimuat. Halaman `/auth/callback` menampilkan: loading → sukses (redirect ke beranda) atau error (fragment `error`/`error_description`, mis. `otp_expired` → tampilkan pesan + kembali ke `/login`).
- **Reset password:** link **Lupa password?** pada mode login membuka route publik `/forgot-password`. Form memanggil `resetPasswordForEmail()` dengan redirect ke `/auth/reset-password` dan selalu menampilkan pesan generik agar keberadaan akun tidak bocor. Halaman reset menerima recovery session implicit dari link email, memvalidasi password baru + konfirmasi minimal 6 karakter, lalu memanggil `updateUser({ password })`; link invalid/kedaluwarsa menawarkan permintaan link baru dan keberhasilan mengarahkan pengguna yang sudah memiliki recovery session ke beranda. Seluruh input password pada login, daftar, dan reset menyediakan tombol tampil/sembunyikan yang tidak mengubah nilai atau penyimpanannya.
- **Konfigurasi dashboard Supabase wajib:** Authentication → URL Configuration → **Site URL** = domain produksi, dan **Redirect URLs** berisi `https://<domain>/**` (produksi) + `http://localhost:3000/**` (dev). Tanpa ini `emailRedirectTo` diabaikan dan link email memakai Site URL yang terkonfigurasi (jika `http://localhost:3000`, link akan salah arah).
- Env: `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dibutuhkan saat build Docker).

### F8. Floating Rest Timer

- Setelah menekan **"Simpan"** pada form tambah workout, workout tersimpan lalu floating timer otomatis muncul di atas bottom navigation tanpa meninggalkan form.
- Hitung mundur memakai format `MM:SS` dan progress bar; auto-start saat muncul.
- **Durasi dapat diubah** dengan stepper `-30s`/`+30s`; **default 60 detik**. Pilihan tersimpan di LocalStorage (`gym_tracker_rest_seconds_v1`) dan dipakai sebagai default berikutnya.
- Kontrol: **Jeda/Lanjut**, ulangi setelah selesai, **Lewati** untuk menutup panel, dan toggle **Suara Nyala/Mati** (`gym_tracker_rest_muted_v1`).
- Saat selesai, timer memberikan notifikasi **beep via Web Audio API** + **vibrasi** kecuali muted. Form tetap terbuka agar pengguna dapat mencatat set berikutnya atau kembali melalui navigasi aplikasi.
- Countdown memakai deadline waktu nyata, bukan sekadar pengurangan per callback interval. Jadi saat tab/PWA berada di background, sisa waktu dihitung ulang ketika aplikasi dibuka atau aktif kembali.
- Timer berjalan penuh di client (tidak ada request jaringan), aman untuk mode offline/PWA.
- Pada form inline **Latihan Hari Ini**, timer yang sama dimulai manual melalui tombol **"Mulai Istirahat"** di dalam kartu latihan. Timer tetap terlihat saat collapse ditutup atau latihan lain dibuka; memulai timer dari latihan lain akan mereset timer aktif menggunakan durasi preferensi terakhir.

### F9. Riwayat & Summary Komposisi Tubuh

- Tersedia di halaman **Profil** hanya setelah pengguna login.
- Form menyimpan tanggal pengukuran, berat (kg), tinggi (cm), body fat (%) opsional, dan muscle mass (kg) opsional.
- Setiap pengukuran disimpan sebagai histori; tinggi pengukuran terakhir menjadi prefill berikutnya. Pengguna dapat menghapus entri.
- Summary terbaru menampilkan BMI, perubahan berat, estimasi massa lemak, dan persentase massa otot. Bagian Insight serta catatan penjelasan BMI/body composition tidak ditampilkan.
- Card Komposisi Tubuh berisi form dan ringkasan pengukuran terbaru; daftar Riwayat ditempatkan pada card terpisah di bawahnya.
- Offline-first dengan cache LocalStorage per `user_id`, pending-delete, dan sinkronisasi dua arah last-write-wins melalui tabel Supabase `body_measurements` dengan RLS. Tombstone penghapusan hanya dibersihkan setelah query verifikasi memastikan baris cloud benar-benar sudah tidak ada; kegagalan/RLS yang menghasilkan nol baris mempertahankan tombstone untuk retry dan mencegah data muncul kembali. Migration upgrade: `supabase/migrations/0002_body_measurements.sql`.

### F10. Google Analytics

- Google tag memakai measurement ID `G-JJ4FVTJ9TY` dan dimuat non-blocking melalui `next/script` setelah halaman interaktif.
- Analytics hanya aktif pada build production sehingga aktivitas development/localhost tidak masuk ke laporan.
- Page view dicatat pada load awal dan setiap navigasi client-side App Router, termasuk query string.
- Implementasi tidak mengirim data workout, pengukuran tubuh, email, atau isi LocalStorage sebagai event analytics.

### F11. Mixpanel Analytics

- SDK browser dibungkus oleh `lib/analytics.ts`; komponen dan service aplikasi tidak memanggil SDK secara langsung.
- Tracking hanya aktif jika build memakai `NODE_ENV=production`, `NEXT_PUBLIC_APP_ENV=production`, dan `NEXT_PUBLIC_MIXPANEL_TOKEN` tersedia. Development menampilkan preview via `console.debug`; staging/preview menjadi no-op.
- Inisialisasi menggunakan persistence `localStorage`, `track_pageview: false`, dan `debug: false`. Route App Router dicatat oleh `components/MixpanelAnalytics.tsx` tanpa auto page-view SDK.
- Event: `App Opened`, `Page Viewed`, `Marketing Site Viewed`, `Landing CTA Clicked`, `Blog Article Opened`, `Blog Article Clicked`, `Blog CTA Clicked`, `Registration Completed`, `Registration Failed`, `Login Completed`, `Login Failed`, `Logout Completed`, `Password Reset Requested`, `Password Reset Request Failed`, `Password Reset Completed`, `Password Reset Failed`, `Workout Logged`, `Workout Updated`, `Workout Deleted`, `Workout History Viewed`, `Progress Chart Viewed`, `Quick Log Used`, dan `Workout Sync Completed`. `App Opened` hanya dicatat setelah pengguna terautentikasi membuka route fitur aplikasi, sehingga kunjungan landing page/blog tidak menambah metrik penggunaan aplikasi. Registrasi berhasil menyimpan metode dan status kebutuhan verifikasi serta dihubungkan ke stable Supabase user ID jika tersedia; kegagalan registrasi/reset hanya menyimpan kategori penyebab tanpa alamat email.
- Funnel instalasi PWA dicatat melalui `PWA Install Prompt Shown`, `PWA Install Clicked`, `PWA Install Accepted`, `PWA Install Dismissed`, dan `PWA Installed` pada browser yang mendukung install prompt. `PWA Opened` dicatat satu kali per app load ketika display mode `standalone` terdeteksi, termasuk sebagai konfirmasi penggunaan setelah Add to Home Screen pada iOS. Event terhubung ke stable user ID Mixpanel setelah autentikasi; profil user yang instalasinya terdeteksi diberi `pwa_installed` dan `pwa_last_installed_at`.
- Session Supabase yang dipulihkan maupun login baru dihubungkan ke stable user ID. Profile menyimpan `$email` dari user terautentikasi serta `$name`/`role` hanya jika tersedia; email tidak dikirim pada event aktivitas.
- Logout mencatat `Logout Completed` sebelum identitas Mixpanel di-reset. Error analytics selalu diabaikan agar alur utama tetap berjalan.
- SDK mengandalkan persistence dan retry bawaan browser. Aplikasi tidak menambahkan queue analytics terpisah; event yang terjadi sepenuhnya offline dapat bergantung pada perilaku antrean SDK/browser dan berisiko tidak terkirim bila storage dibersihkan sebelum koneksi pulih.

#### Konfigurasi dan verifikasi Mixpanel

- Pada deployment production saja, set `NEXT_PUBLIC_MIXPANEL_TOKEN` ke Project Token dan `NEXT_PUBLIC_APP_ENV=production`. Build Docker meneruskan keduanya sebagai build args karena nilai `NEXT_PUBLIC_*` di-inline oleh Next.js saat build. Jangan memasukkan API Secret ke frontend atau variabel `NEXT_PUBLIC_*`.
- Development dan staging harus membiarkan `NEXT_PUBLIC_APP_ENV` selain `production` (atau tidak diset), sehingga seluruh operasi SDK menjadi no-op.
- Di Mixpanel, verifikasi event melalui **Data → Events** dan user melalui **Users / User Profiles**. Buat Insights report dari event yang dibutuhkan, lalu gunakan breakdown user-profile property `$email` untuk melihat aktivitas per akun.
- `$email` adalah data pribadi dan akses report harus dibatasi hanya untuk pihak yang berwenang.

### F12. Tutorial Gerakan Latihan

- Setiap kartu latihan pada halaman **Latihan Hari Ini** memiliki tombol **Tutorial** terpisah agar form quick-log tetap ringkas. Picker latihan di editor **Program** menampilkan katalog 1.324 latihan dengan pencarian, filter bagian tubuh/equipment, serta infinite scroll dalam batch 20 item. Batch berikutnya otomatis ditampilkan saat pengguna mencapai item ke-15 dari batch aktif. Latihan populer/legacy berada di urutan awal agar alur lama tetap cepat. Daftar latihan yang sudah dipilih juga menyediakan tombol Tutorial pada setiap baris.
- Tutorial dibuka sebagai bottom sheet/modal dan berisi animasi GIF, target otot, peralatan, serta instruksi langkah demi langkah dalam bahasa Indonesia. Instruksi diterjemahkan satu kali saat menyiapkan dataset dan disimpan statis di shard JSON; aplikasi tidak memanggil layanan penerjemahan saat runtime.
- Katalog ringkas berada di `public/data/exercises/catalog.json`; detail tutorial dibagi menjadi shard berisi maksimal 50 latihan dan baru dimuat sesuai latihan yang dibuka. Respons disimpan dalam cache memori selama sesi. Nama latihan lama dipertahankan melalui alias ID dan nama duplikat diberi label varian agar histori tidak ambigu; nama latihan custom menampilkan state bahwa tutorial belum tersedia.
- Animasi 180×180 tidak dibundel ke aplikasi. GIF dimuat dari CDN ExerciseDB hanya setelah modal dibuka; kegagalan jaringan menampilkan pesan yang jelas tanpa mengganggu detail teks tutorial.
- Tutorial tidak mengubah model `Workout`, program latihan, LocalStorage, atau skema sinkronisasi Supabase.

### F13. Landing Page Marketing

- Situs marketing dipisah ke domain brand `abadikan.com` (landing page, blog, syarat & ketentuan, dan kebijakan privasi), tidak lagi disajikan di `gym.abadikan.com/aplikasi-tracking-gym`. Domain aplikasi `gym.abadikan.com` murni untuk dashboard/login/data.
- Routing per-hostname ditangani `proxy.ts` (konvensi proxy Next 16): di `abadikan.com`, `/` dan `/aplikasi-tracking-gym` di-rewrite ke landing, `/blog*`, `/terms`, dan `/privacy` dilayani langsung, sedangkan route aplikasi (`/login`, `/today`, `/progress`, dst.) di-301 ke `https://gym.abadikan.com<path>` dengan query string dipertahankan. Di `gym.abadikan.com`, route marketing lama (`/aplikasi-tracking-gym`, `/blog*`, `/terms`, `/privacy`) di-301 ke `abadikan.com` agar sinyal SEO berkumpul di canonical baru. Host selain keduanya (localhost/IP/domain sementara) dibiarkan lewat tanpa intervensi sehingga development tidak terganggu.
- Kedua domain dilayani kontainer/VPS yang sama: `Caddyfile` menambah blok `abadikan.com` (dan redirect permanen `www.abadikan.com`) di samping `gym.abadikan.com`.
- Landing tersedia sebagai halaman server yang dapat diindeks di `https://abadikan.com/`, memakai metadata unik, canonical production, Open Graph, serta structured data `SoftwareApplication` tanpa rating/review buatan. Blog, terms, dan privacy juga memakai canonical `abadikan.com`; semuanya dicantumkan di `/sitemap.xml` (URL `abadikan.com`) dan diizinkan oleh `/robots.txt`.
- Halaman marketing tidak menampilkan bottom navigation, FAB, atau install prompt aplikasi. Service worker/PWA dimatikan di domain marketing (`SerwistProvider` menerima prop `disable` saat hostname marketing terdeteksi) agar landing/blog tidak menjadi aplikasi yang bisa di-install. CTA autentikasi mengarah ke `https://gym.abadikan.com/login`.
- Landing memakai animasi masuk ringan pada hero dan reveal saat section/kartu memasuki viewport. Implementasi memakai `IntersectionObserver` tanpa dependensi animasi tambahan, bertahap pada daftar kartu, dan menghormati preferensi sistem `prefers-reduced-motion`.
- Deteksi "halaman marketing" di komponen client (`AuthGate`, `AppShell`, `MixpanelAnalytics`, `useIsMarketingHost`) **berbasis hostname**, bukan pathname saja. Sebab rewrite `/` → `/aplikasi-tracking-gym` di `proxy.ts` tidak mengubah URL di browser, sehingga `usePathname()` membaca `/` (route dashboard) dan `AuthGate` sempat me-redirect ke `/login` → 301 ke `gym.abadikan.com`. Hostname (`lib/useMarketingHost.ts` → `isMarketingHostname` di `lib/site.ts`) adalah sumber kebenaran. Deteksi pathname hanya dipakai untuk halaman yang memang berada di host app (mis. `AppShell` melihat `/terms` di `gym.abadikan.com`).
- Karena localStorage tidak dapat dibaca lintas origin, atribusi marketing dikirim lewat query string pada URL login (mis. `https://gym.abadikan.com/login?entry_source=landing_page&landing_cta=hero_start`); halaman `/login` menyerapnya ke localStorage origin aplikasi (`saveMarketingAttributionFromUrl`), sehingga `Registration Completed`/`Login Completed` berikutnya tetap membawa `entry_source`/`landing_cta`/`blog_cta` dan funnel landing/blog → autentikasi dapat dianalisis. Event CTA `Landing CTA Clicked`/`Blog CTA Clicked` dan `Marketing Site Viewed` tetap tercatat dari domain marketing.
- Konstanta domain (`gym.abadikan.com`, `abadikan.com`) terpusat di `lib/site.ts` bersama helper `buildAuthUrl` untuk CTA autentikasi.
- Autentikasi dan seluruh halaman data pengguna tetap berada di balik auth gate di `gym.abadikan.com`.

### F14. Security Headers & CSP

- Seluruh route mengirim `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`, dan HSTS. Header identifikasi framework `X-Powered-By` dinonaktifkan.
- Content Security Policy diterapkan lebih dahulu sebagai `Content-Security-Policy-Report-Only`, sehingga pelanggaran dilaporkan di console browser tetapi tidak memblokir fitur pengguna. Sumber eksternal dibatasi pada integrasi aplikasi: Supabase, Google Analytics/Tag Manager, Google AdSense, Mixpanel, Google Accounts, dan CDN GIF ExerciseDB.
- CSP baru boleh diubah menjadi mode enforcement setelah login email/Google, sinkronisasi Supabase, analytics, tutorial GIF, manifest, dan service worker PWA lolos pengujian production tanpa pelanggaran CSP yang valid. Endpoint pengumpulan laporan belum diaktifkan pada tahap ini.

### F15. Blog SEO

- Blog publik tersedia di `/blog` dan artikel statis di `/blog/[slug]`, dapat diakses tanpa autentikasi serta tidak menampilkan bottom navigation/FAB aplikasi.
- Enam artikel awal membahas pencatatan progres gym, progressive overload, program pemula, waktu istirahat antar set, membaca grafik progres, dan konsistensi latihan. Seluruh konten menggunakan bahasa Indonesia dan memiliki internal link ke artikel lain serta CTA menuju aplikasi.
- Setiap artikel memiliki metadata title/description/keywords, canonical production, Open Graph Article, structured data `Article`, dan static params. Index blog dan semua artikel dicantumkan di sitemap serta diizinkan oleh robots.txt.
- Landing page marketing menautkan Blog melalui header dan footer. Mixpanel mencatat `Marketing Site Viewed` untuk landing, index blog, dan artikel; `Blog Article Opened` membawa slug artikel, sementara klik kartu/tautan artikel dan CTA autentikasi dicatat terpisah tanpa mengirim isi artikel. CTA blog menyimpan attribution maksimal dua jam agar autentikasi berikutnya membawa `entry_source: blog` dan `blog_cta`.
- Google AdSense memakai publisher ID `ca-pub-9272067329159734` dan skrip hanya dimuat pada layout Blog di production. File `public/ads.txt` menerbitkan deklarasi publisher Google di `/ads.txt`. Satu unit in-article responsif (`ad-slot` `9468524348`) tampil setelah dua section awal setiap artikel blog, dengan label “Iklan”; kegagalan pengisian seperti ad blocker tidak mengganggu artikel. Tidak memakai Auto Ads atau unit iklan pada dashboard, pencatatan workout, program, timer, progres, autentikasi, maupun data akun.

### F16. Syarat & Ketentuan

- Halaman publik `/terms` dapat dibaca sebelum login, tanpa menunggu pemulihan sesi dan tanpa navigasi bawah/FAB.
- Halaman disajikan di domain marketing `abadikan.com/terms` (redirect dari `gym.abadikan.com/terms`); tautan footer mengarah absolut ke login dan tentang aplikasi di domain masing-masing.
- Tautan hanya tersedia di footer landing page, tidak ditampilkan di login atau Profil. Informasi mencakup penggunaan akun, batas tutorial/perhitungan kesehatan, penyimpanan lokal/cloud, Supabase/Google/ExerciseDB, identifikasi akun pada Mixpanel, keterbatasan penghapusan, serta perubahan layanan.
- Aplikasi belum mencatat persetujuan ketentuan atau menyediakan kontrol persetujuan analitik. Halaman ini tidak menggantikan kebijakan privasi lengkap. Identitas pengelola dan kontak perlu dikonfirmasi pemilik sebelum publikasi.
- Kebijakan Privasi publik tersedia di `/privacy`, menjelaskan kategori data aplikasi dan teknis, tujuan pemrosesan, penyimpanan lokal/cloud, penyedia pihak ketiga, Google AdSense/CMP, retensi, keamanan, serta keterbatasan hak penghapusan mandiri. Permintaan privasi dapat dikirim ke `gabutintech@gmail.com`.

### F17. Coach Goal (Iterasi 1)

- Dashboard menyediakan tombol kecil **Coach** di sisi kanan judul. Coach tidak muncul sebagai onboarding wajib; pengguna yang tidak mengaktifkannya tetap memakai seluruh fungsi aplikasi seperti biasa.
- Menekan tombol membuka onboarding bottom sheet empat tahap: **tujuan** (saat ini hanya **Bangun massa otot** dengan fokus Full Body, Dada, Punggung, Bahu, Lengan, atau Kaki), **pengalaman latihan** (baru mulai/sudah pernah/berpengalaman), **jadwal & peralatan** (target 1–7 sesi per minggu, durasi ideal 30/45/60+ menit, dan akses peralatan), lalu **keselamatan & persetujuan**.
- Program latihan bukan input onboarding. Tahap kelima menampilkan rotasi program reusable yang disusun deterministik dari target, fokus, pengalaman, frekuensi, durasi, dan peralatan. Pengguna meninjau daftar latihan lalu harus menekan **Gunakan Program** sebelum seluruh rotasi dibuat. Program yang disetujui dapat diedit melalui editor Program; jadwal tanggal tetap dipilih pengguna dari halaman Latihan Hari Ini.
- Split rekomendasi: 1 sesi = Full Body; 2 sesi = Upper/Lower (atau Fokus A/B); 3 sesi = Full Body A/B/C untuk pemula atau Push/Pull/Legs untuk pengguna yang sudah pernah latihan; 4 sesi = Upper/Lower A/B; 5 sesi = Upper/Lower + Fokus (atau Push/Pull/Legs); 6 sesi = Push/Pull/Legs A/B. Target 7 sesi dibatasi menjadi 6 sesi latihan agar tetap menyisakan satu hari pemulihan. Untuk fokus otot tertentu, split ≤3 sesi memunculkan sesi fokus dua kali bila memungkinkan.
- Safety mengharuskan konfirmasi usia 18+, deklarasi ada/tidaknya pembatasan cedera/kondisi/tenaga profesional, serta persetujuan bahwa Coach memberi panduan umum dan bukan layanan medis. Jawaban “Ya” menampilkan arahan konsultasi profesional sebelum menaikkan intensitas; detail diagnosis tidak diminta atau disimpan.
- Satu akun hanya memiliki satu goal Coach aktif. Menekan tombol Coach setelah aktif membuka onboarding yang sama untuk memperbarui profil maupun target.
- Goal disimpan offline-first dalam LocalStorage per akun (`gym_tracker_coach_goal_v1_<user_id>`) dan disinkronkan last-write-wins melalui tabel `coach_goals` (`0004_coach_goals.sql`).
- Iterasi ini belum menghasilkan rekomendasi progressive overload, mengubah program otomatis, memberi saran nutrisi/medis, maupun mengklaim kenaikan massa otot. Modul rekomendasi dibuat setelah alur aktivasi Coach tervalidasi.

### F18. Daftar Latihan Custom

- Nama yang dimasukkan melalui **Lainnya (Custom)** pada form workout otomatis disimpan ke daftar latihan custom pemilik akun. Nama custom yang dibuat dari editor Program juga masuk daftar yang sama.
- Form workout menampilkan daftar tersebut dalam optgroup **Latihan Saya**. Editor Program menampilkannya di bagian atas picker latihan sehingga dapat dipakai kembali tanpa mengetik ulang.
- Nama dinormalisasi dengan trim dan tidak boleh duplikat tanpa membedakan huruf besar/kecil. Menghapus fitur ini di iterasi berikutnya tidak boleh menghapus histori workout maupun exercise yang sudah ada di program.
- Daftar disimpan offline-first dalam `gym_tracker_custom_exercises_v1_<user_id>` dan disinkronkan sebagai satu dokumen last-write-wins melalui tabel `custom_exercise_libraries` (`0005_custom_exercises.sql`).

## 7. Data Model

```json
// localStorage["gym_tracker_workouts_v1_<user_id>"]
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

```json
// localStorage["gym_tracker_coach_goal_v1_<user_id>"]
{
  "version": 1,
  "type": "build_muscle",
  "focus": "chest",
  "weeklySessionTarget": 3,
  "sessionDurationMinutes": 45,
  "programId": null,
  "programIds": [],
  "trainingExperience": "beginner",
  "equipmentAccess": "full_gym",
  "isAdultConfirmed": true,
  "healthRestrictionDeclared": false,
  "safetyAcknowledgedAt": "2026-09-15T09:30:00.000Z",
  "startedAt": "2026-09-14T09:30:00.000Z",
  "updatedAt": "2026-09-14T09:30:00.000Z"
}
```

- `programId` dipertahankan untuk kompatibilitas data awal dan menunjuk program pertama rotasi; `programIds` menyimpan seluruh program yang disetujui dari rekomendasi Coach.

```json
// localStorage["gym_tracker_custom_exercises_v1_<user_id>"]
{
  "version": 1,
  "exercises": [
    {
      "id": "ce_1700000000000_abc123",
      "name": "Cable Fly Rendah",
      "createdAt": "2026-09-15T09:30:00.000Z",
      "updatedAt": "2026-09-15T09:30:00.000Z"
    }
  ],
  "updatedAt": "2026-09-15T09:30:00.000Z"
}
```

> **Sinkronisasi:** workout direpresentasikan di tabel `workouts`. Program dan jadwal tanggal disimpan pada kolom JSONB tabel `routine` (migration `0003_training_programs.sql`). Kolom `updated_at`/`program_updated_at` di DB ↔ `updatedAt` di client.

```json
// localStorage["gym_tracker_training_programs_v1_<user_id>"]
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
| Latihan|Program|      |  Grafik | Riwayat |
+----------------+      +------------------+
```

- **Domain:** aplikasi diakses di `gym.abadikan.com`; situs marketing (landing/blog/terms) di `abadikan.com` dengan routing per-hostname `proxy.ts`. URL marketing lama di subdomain aplikasi di-301 ke domain marketing.
- **Bottom navigation (mobile-first):** tab bawah tetap — **Beranda** (`/`), **Hari Ini** (`/today`), FAB **+ Tambah** (`/workout/new`), **Progres** (`/progress`), **Profil** (`/account`).
- **Hari Ini** memuat dua view (segmented control): **Latihan** (tanggal otomatis hari ini + pilihan program/Rest Day + quick-log) dan **Program** (buat/edit/hapus paket latihan). `/routine` redirect → `/today?view=program`.
- **Progres** memuat dua view (segmented control): **Grafik** sebagai default (chart beban per latihan), lalu **Riwayat** (list histori + filter latihan/rentang tanggal + hapus). `/history` redirect → `/progress`.
- Setelah simpan entri: kembali ke Dashboard.
- Dashboard menampilkan kartu "Latihan Hari Ini" berisi nama program, Rest Day, atau hanya label saat belum memilih → `/today`.

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
