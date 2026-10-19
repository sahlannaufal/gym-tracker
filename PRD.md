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
- Dapat dipilih dari katalog latihan yang sama dengan editor Program: pencarian, filter bagian tubuh/equipment, infinite scroll, daftar Latihan Saya, dan tombol Tutorial; mode Grafik tidak menyediakan aksi membuat latihan custom. Grafik kosong sebelum memilih latihan; pilihan yang belum memiliki catatan menampilkan empty state yang jelas.
- Data yang diplot: beban maksimum per tanggal untuk latihan terpilih (jika ada beberapa set dalam sehari, pakai nilai terbesar).
- Setelah latihan dipilih, kartu grafik memiliki selector rentang tanggal ringkas berlebar maksimal setengah section dengan pilihan **7 Hari** (default), **30 Hari**, dan **3 Bulan**; garis, ringkasan, dan event analytics hanya menggunakan data pada rentang aktif. Saat jumlah titik meningkat, label tanggal sumbu X dikurangi otomatis agar tetap terbaca.
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
- **Sinkronisasi dua arah** (`lib/sync.ts`): LocalStorage tetap offline-first; workout, program/jadwal, goal Coach, daftar latihan custom, dan pengukuran tubuh memakai merge **last-write-wins**. Penghapusan workout dan pengukuran memakai tombstone yang baru dihapus setelah server mengonfirmasi barisnya hilang. Snapshot program yang sengaja dikosongkan tetap diunggah agar data lama tidak muncul kembali. Riwayat workout dan pengukuran tubuh ditarik dengan paginasi 500 baris per permintaan. Perubahan lokal saat sync berjalan dipertahankan dan meminta satu putaran ulang.
- **Trigger sync:** satu listener global menjalankan sync saat session login pulih/berubah; sync juga berjalan saat event `online`, window focus, tombol manual, dan setelah mutasi. Hook data tidak memulai sync penuh lagi saat mount, untuk menghindari beberapa permintaan identik.
- **Tabel Supabase**: `workouts` (`id text PK`, `user_id uuid` FK `auth.users`, kolom entri + `created_at`/`updated_at`) & `routine` (`id uuid PK = user_id`; kolom legacy `days`/`updated_at`; kolom `programs`, `schedule`, dan `program_updated_at` dari `0003_training_programs.sql`), semuanya **RLS** (`auth.uid() = user_id`). Program dan jadwal disinkronkan sebagai satu dokumen dengan last-write-wins memakai `program_updated_at`.
- **Status sinkronisasi** tampil di kartu akun pada halaman Profil (`/account`): titik status membedakan tersinkron, proses, offline, dan gagal. Jika gagal, UI menampilkan jenis data yang bermasalah beserta kode error Supabase bila tersedia; detail teknis dicatat di console tanpa mengirim data workout ke analytics. Klik tombol memulai sync manual. Logout menjadi baris aksi terpisah di bagian bawah halaman dengan ikon keluar dan dialog konfirmasi; logout tidak menghapus data lokal.
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
- Offline-first dengan cache LocalStorage per `user_id`, pending-delete, dan sinkronisasi dua arah last-write-wins melalui tabel Supabase `body_measurements` dengan RLS. Tombstone penghapusan hanya dibersihkan setelah query verifikasi memastikan baris cloud benar-benar sudah tidak ada; kegagalan/RLS mempertahankan tombstone untuk retry dan mencegah data muncul kembali. Permintaan sync saat sync lain berjalan menunggu putaran ulang agar tombstone terbaru diproses sebelum data ditarik kembali. Migration upgrade: `supabase/migrations/0002_body_measurements.sql`.

### F10. Google Analytics

- Google tag memakai measurement ID `G-JJ4FVTJ9TY` dan dimuat non-blocking melalui `next/script` setelah halaman interaktif.
- Analytics hanya aktif pada build production sehingga aktivitas development/localhost tidak masuk ke laporan.
- Page view dicatat pada load awal dan setiap navigasi client-side App Router, termasuk query string.
- Implementasi tidak mengirim data workout, pengukuran tubuh, email, atau isi LocalStorage sebagai event analytics.

### F11. Mixpanel Analytics

- SDK browser dibungkus oleh `lib/analytics.ts`; komponen dan service aplikasi tidak memanggil SDK secara langsung.
- Tracking hanya aktif jika build memakai `NODE_ENV=production`, `NEXT_PUBLIC_APP_ENV=production`, dan `NEXT_PUBLIC_MIXPANEL_TOKEN` tersedia. Development menampilkan preview via `console.debug`; staging/preview menjadi no-op.
- Inisialisasi menggunakan persistence `localStorage`, `track_pageview: false`, dan `debug: false`. Route App Router dicatat oleh `components/MixpanelAnalytics.tsx` tanpa auto page-view SDK.
- ID order dan penanda callback pembayaran Coach dihapus dari query sebelum `Page Viewed` dikirim.
- Event: `App Opened`, `Page Viewed`, `Marketing Site Viewed`, `Landing CTA Clicked`, `Blog Article Opened`, `Blog Article Clicked`, `Blog CTA Clicked`, `Registration Completed`, `Registration Failed`, `Login Completed`, `Login Failed`, `Logout Completed`, `Password Reset Requested`, `Password Reset Request Failed`, `Password Reset Completed`, `Password Reset Failed`, `Workout Logged`, `Workout Updated`, `Workout Deleted`, `Workout History Viewed`, `Progress Chart Viewed`, `Quick Log Used`, dan `Workout Sync Completed`. `App Opened` hanya dicatat setelah pengguna terautentikasi membuka route fitur aplikasi, sehingga kunjungan landing page/blog tidak menambah metrik penggunaan aplikasi. Registrasi berhasil menyimpan metode dan status kebutuhan verifikasi serta dihubungkan ke stable Supabase user ID jika tersedia; kegagalan registrasi/reset hanya menyimpan kategori penyebab tanpa alamat email.
- Funnel Coach dicatat dengan `Coach Purchase Offer Viewed`, `Coach Checkout Details Viewed`, `Coach Checkout Submitted`, `Coach Invoice Created`, `Coach Invoice Creation Failed`, `Coach Checkout Resumed`, `Coach Payment Status Checked`, `Coach Purchase Completed`, `Coach Setup Started`, `Coach Setup Step Viewed`, `Coach Setup Closed`, `Coach Recommendation Generated`, `Coach Recommendation Generation Failed`, `Coach Exercise Substituted`, `Coach Program Applied`, `Coach Program Apply Failed`, `Coach Program Selected`, dan `Coach Workout Logged`. Properti dibatasi pada penempatan dashboard/profil/link referral/sesi baru, tahap onboarding, jenis generate awal/ulang, sumber pilihan program, status pembayaran (`pending`/`paid`/`failed`/`expired`/`unavailable`), alasan kegagalan generik, provider, jenis akses, serta nilai dan mata uang produk. Event ini tidak mengirim nama, email, nomor ponsel, ID order/program, tanggal latihan, pilihan tujuan/otot/alat, nama gerakan, atau detail set/repetisi.
- Funnel instalasi PWA dicatat melalui `PWA Install Prompt Shown`, `PWA Install Clicked`, `PWA Install Accepted`, `PWA Install Dismissed`, dan `PWA Installed` pada browser yang mendukung install prompt. `PWA Opened` dicatat satu kali per app load ketika display mode `standalone` terdeteksi, termasuk sebagai konfirmasi penggunaan setelah Add to Home Screen pada iOS. Event terhubung ke stable user ID Mixpanel setelah autentikasi; profil user yang instalasinya terdeteksi diberi `pwa_installed` dan `pwa_last_installed_at`.
- Session Supabase yang dipulihkan maupun login baru dihubungkan ke stable user ID. Profile menyimpan `$email` dari user terautentikasi serta `$name`/`role` hanya jika tersedia; email tidak dikirim pada event aktivitas.
- Logout mencatat `Logout Completed` sebelum identitas Mixpanel di-reset. Error analytics selalu diabaikan agar alur utama tetap berjalan.
- SDK mengandalkan persistence dan retry bawaan browser. Aplikasi tidak menambahkan queue analytics terpisah; event yang terjadi sepenuhnya offline dapat bergantung pada perilaku antrean SDK/browser dan berisiko tidak terkirim bila storage dibersihkan sebelum koneksi pulih.

#### Konfigurasi dan verifikasi Mixpanel

- Pada deployment production saja, set `NEXT_PUBLIC_MIXPANEL_TOKEN` ke Project Token dan `NEXT_PUBLIC_APP_ENV=production`. Build Docker meneruskan keduanya sebagai build args karena nilai `NEXT_PUBLIC_*` di-inline oleh Next.js saat build. Jangan memasukkan API Secret ke frontend atau variabel `NEXT_PUBLIC_*`.
- Development dan staging harus membiarkan `NEXT_PUBLIC_APP_ENV` selain `production` (atau tidak diset), sehingga seluruh operasi SDK menjadi no-op.
- Di Mixpanel, verifikasi event melalui **Data → Events** dan user melalui **Users / User Profiles**. Buat Insights report dari event yang dibutuhkan, lalu gunakan breakdown user-profile property `$email` untuk melihat aktivitas per akun.
- Funnel yang disarankan: pembelian `Coach Purchase Offer Viewed` → `Coach Checkout Details Viewed` → `Coach Invoice Created` → `Coach Purchase Completed`; aktivasi/pemakaian `Coach Purchase Completed` → `Coach Setup Started` → `Coach Recommendation Generated` → `Coach Program Applied` → `Coach Program Selected` → `Coach Workout Logged`. Gunakan `payment_status`, `failure_reason`, `step_number`, `placement`, dan `generation_type` sebagai breakdown/filter.
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
- Landing memakai arah visual editorial sinematik: hero dengan preview UI aplikasi buatan HTML/CSS, alur cerita tentang progres latihan, kartu fitur, quote section, dan CTA penutup. Scroll halus menggunakan Lenis hanya pada landing (bukan blog/aplikasi); reveal section/kartu menggunakan `IntersectionObserver`; section cerita memakai sticky scroll sementara agar penekanan dua bagian headline bergeser sebelum pengguna lanjut ke bawah. Semua motion menghormati `prefers-reduced-motion`, dan konten tetap terlihat bila JavaScript tidak aktif.
- Landing menampilkan section Coach Personal untuk pemula: program disesuaikan dengan tujuan, pengalaman, otot prioritas, dan alat; pengguna dapat meninjau program, mengganti gerakan, lalu mencatat progres. Tautan hero menuju section ini dan CTA Premium menuju login dengan atribusi landing CTA tersimpan. Pesan pemasaran menjelaskan pembayaran sekali untuk akses selamanya dan tidak mengklaim fitur AI atau umpan balik otomatis.
- Modul marketing lain memakai bahasa visual yang sama: blog memiliki kartu artikel editorial, halaman artikel memakai judul serif besar dan CTA aksen, sedangkan Syarat & Ketentuan/Kebijakan Privasi menggunakan header-footer bersama dan daftar bagian bernomor.
- Deteksi "halaman marketing" di komponen client (`AuthGate`, `AppShell`, `MixpanelAnalytics`, `useIsMarketingHost`) **berbasis hostname**, bukan pathname saja. Sebab rewrite `/` → `/aplikasi-tracking-gym` di `proxy.ts` tidak mengubah URL di browser, sehingga `usePathname()` membaca `/` (route dashboard) dan `AuthGate` sempat me-redirect ke `/login` → 301 ke `gym.abadikan.com`. Hostname (`lib/useMarketingHost.ts` → `isMarketingHostname` di `lib/site.ts`) adalah sumber kebenaran. Deteksi pathname hanya dipakai untuk halaman yang memang berada di host app (mis. `AppShell` melihat `/terms` di `gym.abadikan.com`).
- Karena localStorage tidak dapat dibaca lintas origin, atribusi marketing dikirim lewat query string pada URL login (mis. `https://gym.abadikan.com/login?entry_source=landing_page&landing_cta=hero_start`); halaman `/login` menyerapnya ke localStorage origin aplikasi (`saveMarketingAttributionFromUrl`), sehingga `Registration Completed`/`Login Completed` berikutnya tetap membawa `entry_source`/`landing_cta`/`blog_cta` dan funnel landing/blog → autentikasi dapat dianalisis. Event CTA `Landing CTA Clicked`/`Blog CTA Clicked` dan `Marketing Site Viewed` tetap tercatat dari domain marketing.
- Konstanta domain (`gym.abadikan.com`, `abadikan.com`) terpusat di `lib/site.ts` bersama helper `buildAuthUrl` untuk CTA autentikasi.
- Autentikasi dan seluruh halaman data pengguna tetap berada di balik auth gate di `gym.abadikan.com`.

### F14. Security Headers & CSP

- Seluruh route mengirim `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`, dan HSTS. Header identifikasi framework `X-Powered-By` dinonaktifkan.
- Content Security Policy diterapkan lebih dahulu sebagai `Content-Security-Policy-Report-Only`, sehingga pelanggaran dilaporkan di console browser tetapi tidak memblokir fitur pengguna. Sumber eksternal dibatasi pada integrasi aplikasi: Supabase, Google Analytics/Tag Manager, Google AdSense, Mixpanel, Google Accounts, dan CDN GIF ExerciseDB.
- CSP baru boleh diubah menjadi mode enforcement setelah login email/Google, sinkronisasi Supabase, analytics, tutorial GIF, manifest, dan service worker PWA lolos pengujian production tanpa pelanggaran CSP yang valid. Endpoint pengumpulan laporan belum diaktifkan pada tahap ini.

### F15. Blog SEO

- Blog publik tersedia di `/blog` dan artikel di `/blog/[slug]`, dapat diakses tanpa autentikasi serta tidak menampilkan bottom navigation/FAB aplikasi.
- Konten artikel disimpan di tabel Supabase `blog_posts` (migration `0006_blog_posts.sql`) dan dikelola lewat admin `/dashboard` (F20). Tujuh artikel awal — pencatatan progres gym, progressive overload, program pemula, latihan full body tiga kali seminggu, waktu istirahat antar set, membaca grafik progres, dan konsistensi latihan — di-seed sebagai `published` lewat `0007_seed_blog_posts.sql`. Seluruh konten menggunakan bahasa Indonesia dan memiliki internal link ke artikel lain serta CTA menuju aplikasi.
- Halaman index, artikel, dan sitemap adalah server component **dinamis** (fetch `cache: "no-store"`, tanpa ISR) sehingga selalu membaca data terbaru dari Supabase tiap request/refresh — tidak ada jeda cache setelah admin menerbitkan postingan. Bacaan publik lewat client anon (`lib/supabase/server.ts` + `lib/blogPosts.ts`); hanya baris `status = published` yang terbaca publik lewat RLS. Body artikel dirender sebagai HTML dari editor (`dangerouslySetInnerHTML` dengan class `.blog-content`) — ditulis hanya oleh akun admin sehingga konten tepercaya. Trade-off: tiap kunjungan `/blog` memicu 1 query Supabase dan artikel tidak lagi di-prerender (tetap server-rendered untuk SEO).
- Setiap artikel memiliki metadata title/description/keywords, canonical production, Open Graph Article, dan structured data `Article` (slug tidak dikenal menghasilkan 404; artikel baru langsung terbaca tanpa tunggu build). Index blog dan semua artikel dicantumkan di sitemap (diambil dari DB) serta diizinkan oleh robots.txt. Cover opsional (`cover_image_url`) dipakai untuk OG image dan kartu index bila tersedia.
- Landing page marketing menautkan Blog melalui header dan footer. Mixpanel mencatat `Marketing Site Viewed` untuk landing, index blog, dan artikel; `Blog Article Opened` membawa slug artikel, sementara klik kartu/tautan artikel dan CTA autentikasi dicatat terpisah tanpa mengirim isi artikel. CTA blog menyimpan attribution maksimal dua jam agar autentikasi berikutnya membawa `entry_source: blog` dan `blog_cta`.
- Google AdSense memakai publisher ID `ca-pub-9272067329159734` dan skrip hanya dimuat pada layout Blog di production. File `public/ads.txt` menerbitkan deklarasi publisher Google di `/ads.txt`. Satu unit in-article responsif (`ad-slot` `9468524348`) disisipkan lewat pemecahan body HTML sebelum heading ketiga (`splitHtmlAtThirdHeading`), dengan label “Iklan”; kegagalan pengisian seperti ad blocker tidak mengganggu artikel. Tidak memakai Auto Ads atau unit iklan pada dashboard, pencatatan workout, program, timer, progres, autentikasi, maupun data akun.

### F16. Syarat & Ketentuan

- Halaman publik `/terms` dapat dibaca sebelum login, tanpa menunggu pemulihan sesi dan tanpa navigasi bawah/FAB.
- Halaman disajikan di domain marketing `abadikan.com/terms` (redirect dari `gym.abadikan.com/terms`); tautan footer mengarah absolut ke login dan tentang aplikasi di domain masing-masing.
- Tautan hanya tersedia di footer landing page, tidak ditampilkan di login atau Profil. Informasi mencakup penggunaan akun, batas tutorial/perhitungan kesehatan, penyimpanan lokal/cloud, Supabase/Google/ExerciseDB, identifikasi akun pada Mixpanel, keterbatasan penghapusan, serta perubahan layanan.
- Aplikasi belum mencatat persetujuan ketentuan atau menyediakan kontrol persetujuan analitik. Halaman ini tidak menggantikan kebijakan privasi lengkap. Identitas pengelola dan kontak perlu dikonfirmasi pemilik sebelum publikasi.
- Kebijakan Privasi publik tersedia di `/privacy`, menjelaskan kategori data aplikasi dan teknis, tujuan pemrosesan, penyimpanan lokal/cloud, penyedia pihak ketiga, Google AdSense/CMP, retensi, keamanan, serta keterbatasan hak penghapusan mandiri. Permintaan privasi dapat dikirim ke `gabutintech@gmail.com`.

### F17. Coach Goal (Iterasi 1)

- Dashboard menampilkan ikon Coach ringkas di samping judul untuk membuka alur Coach/paywall. Kartu Profil hanya menampilkan **Coach Personal** dan status **Aktif/Nonaktif** dengan aksen hijau. Coach tidak muncul sebagai onboarding wajib; pengguna yang tidak mengaktifkannya tetap memakai seluruh fungsi aplikasi seperti biasa.
- Menekan tombol membuka onboarding bottom sheet empat tahap: tujuan utama dipilih melalui dropdown (**Membangun massa otot**, **Menurunkan lemak tubuh**, **Meningkatkan kekuatan**, atau **Kebugaran umum**); pengalaman; **Target Latihan** untuk jadwal dan peralatan; lalu tinjauan rekomendasi. **Otot prioritas** dipilih melalui diagram anatomi depan/belakang atau badge yang selalu tampil di bawahnya. Pilihan dapat multi-select untuk enam area termasuk Core; badge **All** memilih semua area dan menghasilkan program seimbang. Diagram dan badge menampilkan keadaan aktif yang sama. Peralatan dipilih lewat hotspot aset alat transparan yang ditumpuk di atas foto ruang latihan. Gambar alat tampil grayscale sebelum dipilih; klik pada gambar mengaktifkannya dalam warna dengan highlight hijau. Preset Gym/Rumah mengisi pilihan awal dan pengguna dapat mengubah alat satu per satu.
- Program latihan bukan input onboarding. Langkah 4/4 meminta rekomendasi melalui `POST /api/coach/program`; route server memverifikasi access token Supabase dan entitlement `coach_entitlements.status = active` yang belum kedaluwarsa pada setiap permintaan. Generator fuzzy dan pembacaan katalog `public/data/exercises/catalog.json` berjalan di server, bukan di bundle browser. Input profil dan pilihan alat divalidasi server; respons rekomendasi memakai `Cache-Control: private, no-store`. Judul langkah 3/4 adalah **Target Latihan** dan judul langkah 4/4 **Program Rekomendasi**. Chevron sederhana di pojok kiri atas kembali ke langkah sebelumnya dan ikon X di pojok kanan atas menutup panel; area bawah hanya menampilkan satu tombol aksi utama dengan lebar penuh. Section hijau menampilkan nama split, jumlah sesi, durasi, serta tombol **Generate ulang** dengan ikon sparkles untuk meminta variasi generator deterministik berikutnya yang memilih kandidat gerakan lain per sesi dan slot sambil mempertahankan urutan slot dan kelompok otot. Sebelum diterapkan, pengguna dapat mengganti gerakan dengan item katalog lain yang memiliki kategori dan target otot utama sama, cocok dengan alat pilihannya, dan belum dipakai di slot lain dalam sesi yang sama. Route penerapan memvalidasi ulang variasi serta setiap substitusi di server, sambil mempertahankan split dan susunan sesi. Pengguna menekan **Gunakan Program** setelah meninjau daftar. Program yang disetujui dapat diedit melalui editor Program; jadwal tanggal tetap dipilih pengguna dari halaman Latihan Hari Ini.
- Daftar program menampilkan badge **Digunakan minggu ini** jika program dijadwalkan pada minggu berjalan dan setidaknya satu latihannya tercatat pada tanggal tersebut; selain itu tampil **Belum digunakan minggu ini**. Status dihitung dari jadwal dan log aktual, bukan penjadwalan saja.
- Fuzzy scorer memberi kecocokan bertingkat untuk target frekuensi, durasi, dan pengalaman, lalu memilih split 1–6 hari; tujuh hari dipetakan ke maksimum enam sesi. Tinjauan menampilkan split, frekuensi/durasi, dan gerakan tanpa skor atau uraian alasan. Generator memilih gerakan dari katalog `public/data/exercises/catalog.json` (1.324 item) memakai kategori otot dan metadata alat, menghindari duplikasi ID dalam satu sesi, memperbolehkan gerakan yang sama muncul pada sesi berbeda dalam rotasi mingguan, dan mengecualikan latihan boxing yang tidak relevan seperti **Left Hook. Boxing**. ID katalog disimpan sejajar dengan nama latihan dalam `TrainingProgram.exerciseIds`. Nama tetap dipakai oleh UI pencatatan/tutorial yang sudah ada. Key React untuk sesi memakai indeks sesi; key gerakan memakai ID katalog (atau nama untuk program lama/custom) serta indeks agar label berulang tidak menimbulkan collision.
- Satu akun hanya memiliki satu goal Coach aktif. Menekan tombol Coach setelah aktif membuka onboarding yang sama untuk memperbarui profil maupun target. Jika sudah ada program Coach, **Gunakan Program** menampilkan dialog konfirmasi di dalam aplikasi. Penerapan dikirim ke `POST /api/coach/program/apply`, yang memeriksa entitlement kembali, mencocokkan rekomendasi dengan generator fuzzy dan katalog, lalu memanggil RPC database transaksional. RPC menonaktifkan versi lama dan menyimpan versi baru aktif; penulisan langsung oleh klien ke `coach_program_versions` dicabut. Setelah server berhasil, aplikasi memperbarui program lokal dan goal, lalu mengarahkan pengguna ke `/today` untuk memilih program latihan bagi jadwalnya. Versi lama, jadwal, dan riwayat workout dipertahankan; rotasi Coach menggunakan ID program aktif pada goal. Program non-Coach tidak berubah.
- Goal disimpan offline-first dalam LocalStorage per akun (`gym_tracker_coach_goal_v1_<user_id>`) dan disinkronkan last-write-wins melalui tabel `coach_goals` (`0004_coach_goals.sql`). Program yang disetujui disimpan sebagai program reusable dan versi histori di `coach_program_versions`.
- Check-in mingguan belum menjadi bagian dari UI atau alur produk. Tabel `coach_checkins` pada migrasi 0008 dipertahankan sebagai fondasi database, belum digunakan aplikasi.
- Di halaman Latihan Hari Ini, rotasi Coach menandai sesi yang benar-benar tercatat dari log workout dan menampilkan tanggal pemakaian terakhir. Tombol **Pilih sesi berikutnya** memilih urutan setelah program Coach terakhir yang tercatat agar pengguna mudah berganti sesi pada hari berikutnya.
- Model penjualan Coach saat ini adalah **sekali bayar untuk akses selamanya**, tanpa auto-renewal. Pembelian tambahan tidak diperlukan untuk mempertahankan akses. Paket bulanan/berlangganan dapat dirancang sebagai produk terpisah setelah fitur AI dapat memberi feedback atas latihan yang sudah dilakukan.
- Status entitlement hanya dapat dibaca oleh pemilik akun. Mutasi tidak diizinkan dari klien; backend tepercaya memverifikasi pembayaran sebelum mengaktifkan akses permanen. Checkout membuat invoice Mayar API v2 dari server setelah pengguna mengisi nama dan nomor ponsel, lalu mengalihkan pengguna ke halaman pembayaran Mayar. Jika URL kembali membawa ID order, aplikasi memeriksa statusnya otomatis dan menampilkan konfirmasi sukses atau pesan bahwa pembayaran masih menunggu; pemeriksaan otomatis diulang singkat agar memberi waktu pada status transaksi Mayar untuk diperbarui. Saat modal checkout dibuka kembali, aplikasi memulihkan order terakhir dari ledger server, mempertahankan tautan pembayaran, dan memeriksa statusnya kembali sehingga pengguna tidak perlu memasukkan ulang data atau membuat transaksi baru. Webhook `payment.received` hanya menjadi pemicu: server memeriksa detail transaksi melalui API Mayar dan mencocokkan status lunas, ID transaksi yang tersimpan pada order, dan nominal sebelum memanggil RPC idempoten `activate_coach_payment_order` untuk mengaktifkan akses selamanya. Pencocokan tidak bergantung pada `extraData` transaksi karena API detail Mayar dapat mengembalikan field itu sebagai `null`. Pemeriksaan status manual juga memverifikasi transaksi ke API Mayar jika webhook terlambat. Ledger order dan RPC berada di `0010_coach_payments.sql`, dengan penyesuaian akses permanen pada `0012_coach_lifetime_access.sql`; API key Mayar dan service role Supabase hanya digunakan runtime server. Tombol checkout tetap tidak tersedia sampai API key, URL API, dan harga `COACH_PRICE_IDR` dikonfigurasi. Funnel pembelian sampai pemakaian pertama dicatat di Mixpanel: tampilan penawaran, checkout/invoice, status/verifikasi pembayaran, langkah setup, pembuatan dan penerapan rekomendasi, pemilihan program, serta pencatatan latihan quick-log. Event mengirim status/tahap umum saja, tanpa data kontak, ID, atau pilihan latihan pengguna.
- Popup penawaran checkout otomatis muncul setelah login atau saat sesi tab aplikasi dimulai untuk akun yang belum memiliki entitlement Coach aktif. Pemeriksaan entitlement harus berhasil sebelum popup dibuka; jika status tidak dapat dipastikan, popup tidak ditampilkan. Popup muncul sekali per akun per sesi tab dan dapat muncul lagi setelah login ulang. Akun Coach aktif tidak melihat popup. Penawaran dari tautan undangan `https://gym.abadikan.com/login?offer=coach` tetap diteruskan melalui login Google atau callback aktivasi email, diprioritaskan sebagai penempatan `referral_link`, dan dikonsumsi ketika popup dibuka. Checkout yang masih tertunda dipulihkan oleh flow checkout yang sudah ada. Penempatan sesi baru dan referral dicatat pada funnel Coach tanpa menyimpan identitas atau nilai parameter yang tidak dikenal.
- Kartu penawaran dan ringkasan checkout menampilkan harga Coach yang dikonfigurasi server; jika nilainya di bawah Rp95.000, harga normal Rp95.000 ditampilkan tercoret di atas harga yang dibayar.
- Coach tidak memberi diagnosis/terapi atau rekomendasi nutrisi. Check-in MVP menghasilkan arahan umum berbasis aturan dan belum otomatis mengubah beban atau program.

### F18. Daftar Latihan Custom

- Nama yang dimasukkan melalui **Lainnya (Custom)** pada form workout otomatis disimpan ke daftar latihan custom pemilik akun. Nama custom yang dibuat dari editor Program juga masuk daftar yang sama.
- Form workout menampilkan daftar tersebut dalam optgroup **Latihan Saya**. Editor Program menampilkannya di bagian atas picker latihan sehingga dapat dipakai kembali tanpa mengetik ulang.
- Nama dinormalisasi dengan trim dan tidak boleh duplikat tanpa membedakan huruf besar/kecil. Menghapus fitur ini di iterasi berikutnya tidak boleh menghapus histori workout maupun exercise yang sudah ada di program.
- Daftar disimpan offline-first dalam `gym_tracker_custom_exercises_v1_<user_id>` dan disinkronkan sebagai satu dokumen last-write-wins melalui tabel `custom_exercise_libraries` (`0005_custom_exercises.sql`).

### F19. Admin Blog (/dashboard)

- Halaman admin diakses langsung lewat route `/dashboard` di `gym.abadikan.com` (di domain marketing `/dashboard` di-301 ke domain aplikasi via `proxy.ts`). Tanpa link navigasi publik.
- Authorization berlapis: (1) `AuthGate` mewajibkan sesi login, (2) halaman membandingkan `user.email` dengan `ADMIN_EMAIL` (`sahlannaufal.sn@gmail.com` di `lib/blogPosts.ts`) — non-admin melihat “Akses ditolak”, (3) RLS `blog_posts` & bucket storage hanya mengizinkan tulis/baca semua baris untuk JWT dengan email admin tersebut, sedangkan publik hanya membaca `status = published`.
- `/dashboard` menampilkan daftar postingan (badge Draft/Publish, tanggal, slug) dengan aksi Tulis, Edit, dan Hapus (dengan konfirmasi).
- `/dashboard/post/[id]` (`new` untuk membuat) menyediakan form meta: judul, slug (otomatis dari judul sampai diedit manual), deskripsi SEO, intro, waktu baca, tanggal terbit, kata kunci (dipisah koma), cover opsional, serta pemilih status Draft/Publish.
- Editor konten memakai **TipTap** (`components/BlogEditor.tsx`): heading H2/H3, bold/italic/underline/strike, daftar, kutipan, tautan, undo/redo, dan penyisipan gambar. Body disimpan sebagai HTML di kolom `content_html`.
- Gambar (inline maupun cover) di-upload ke bucket publik `blog-images` (`lib/blogImages.ts`, maksimal 5 MB, hanya `image/*`); gambar yang di-drop/di-paste ke editor di-upload lebih dulu lalu disisipkan sebagai URL sehingga tidak ada konten base64 di database. RLS storage hanya menerima tulis dari email admin.
- Simpan draft maupun publish dari halaman editor; publish tanpa tanggal terbit otomatis memakai hari ini. Baris baru dibuat dengan `created_at`/`updated_at` yang diperbarui pada tiap simpan.
- Dashboard admin menyediakan halaman **Tautan Iklan** di `/dashboard/ads` untuk mengubah URL tujuan dan mengaktifkan/menonaktifkan pengalihan iklan aplikasi tanpa deploy ulang. Pengaturan disimpan di `app_ad_settings` (`0013_app_ad_settings.sql`); seluruh akun terautentikasi dapat membaca setting yang diperlukan aplikasi, sedangkan RLS hanya mengizinkan admin memperbaruinya.

### F21. Monetisasi Tautan Iklan

- Skrip, pemicu, dan metadata verifikasi Monetag dinonaktifkan; domain Monetag dihapus dari Content Security Policy. Google AdSense tetap hanya digunakan pada artikel blog publik.
- Setelah pengguna login tanpa entitlement Coach aktif yang belum kedaluwarsa, browser pada seluruh route non-marketing dapat dialihkan ke URL aktif di `app_ad_settings` setiap lima menit, termasuk dashboard admin. URL default adalah tautan Shopee yang sudah dipakai sebelumnya; admin dapat mengubah atau menonaktifkan pengalihan dari `/dashboard/ads` tanpa deploy. Akun Coach Premium dikecualikan. Entitlement dan pengaturan tautan dibaca dari Supabase; jika pengecekan gagal, pengalihan tidak dijalankan. URL dibaca ulang sebelum pengalihan dan diperiksa agar hanya memakai protokol HTTP/HTTPS. Timer tidak berjalan pada landing page, blog publik, terms/privacy, login, pemulihan akun, callback autentikasi, atau halaman offline; fitur hanya aktif pada production.
- Hitung waktu terus berjalan saat tab aplikasi disembunyikan. Jika lima menit tercapai saat tab tersembunyi, pengalihan dilakukan setelah tab terlihat kembali dan entitlement serta tautan diperiksa ulang. Saat pembayaran Coach terverifikasi, timer dihentikan langsung pada tab aktif dan sinyal storage memperbarui tab lain. Pengalihan memakai navigasi biasa sehingga pengguna dapat kembali ke aplikasi lewat tombol Back.
- Tautan promosi dapat membawa atribusi referral/afiliasi sesuai program penyedia tautan; kebijakan privasi dan syarat layanan menjelaskan pengalihan serta kemungkinan komisi.

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

> **Blog admin:** artikel disimpan di tabel `blog_posts` (`id`, `slug` unik, `title`, `description`, `intro`, `published_at`, `reading_time`, `keywords[]`, `content_html`, `cover_image_url`, `status` draft/published, `created_at`, `updated_at`) beserta bucket Storage `blog-images` (migration `0006_blog_posts.sql`, seed `0007_seed_blog_posts.sql`). RLS: publik hanya `select` baris published; tulis penuh hanya untuk JWT email admin.

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
