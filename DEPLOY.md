# Panduan Deploy ke VPS (Docker + Caddy)

App PWA (Next.js). Data utama di **LocalStorage browser (offline-first)** dengan **sinkronisasi cloud Supabase** (opsional) untuk login & data lintas perangkat.

## Prasyarat
- VPS dengan **domain/subdomain** yang bisa diarahkan (DNS) ke IP VPS.
- **Node ≥ 20.9** hanya dibutuhkan untuk build manual; Docker build juga berjalan di dalam image (`node:22-alpine`).
- **Akun Supabase (free tier)** jika ingin mengaktifkan login & sinkronisasi.
- Dua domain: aplikasi di `gym.abadikan.com` dan situs marketing (landing/blog/terms) di `abadikan.com`. Keduanya dilayani kontainer yang sama; routing per-hostname ditangani `proxy.ts`.

## 0. (Opsional) Siapkan Supabase
1. Buat project di https://supabase.com → **Project Settings → API**: catat **Project URL** & **anon key** (bukan `service_role`).
2. Buka **SQL Editor** → jalankan isi `supabase/migrations/*.sql` satu per satu sesuai urutan nomor yang tersedia (saat ini 0001 → 0014). `0006` membuat tabel `blog_posts` + bucket Storage `blog-images`, `0007` men-seed artikel blog, `0008` membuat fondasi Coach, `0009` membatasi penulisan versi program Coach, `0010` menambah ledger pembayaran, `0011` menyelaraskan validasi program, `0012` mengubah entitlement Coach menjadi akses permanen, `0013` menyiapkan pengaturan tautan iklan, dan `0014` mengaktifkan rotasi beberapa URL iklan.
3. Setelah `0013_app_ad_settings.sql` dan `0014_app_ad_rotation.sql` dijalankan, admin dapat membuka `/dashboard` → **Tautan Iklan** untuk mengatur daftar URL dan mematikan pengalihan tanpa rebuild/redeploy aplikasi.
4. **Authentication → Providers → Email**: untuk MVP boleh matikan "Confirm email".
5. Di VPS, buat file `.env` di folder project:
   ```bash
   SUPABASE_URL=<Project_URL>
   SUPABASE_ANON_KEY=<anon_key>
   ```

## 1. Siapkan Docker di VPS
```bash
# Debian/Ubuntu
curl -fsSL https://get.docker.com | sh
# pastikan compose plugin terpasang
docker compose version
```

## 2. Arahkan DNS
Buat record **A** di panel DNS domain kamu, misalnya untuk subdomain:
```
gym.abadikan.com   A   <IP_VPS>
```
Untuk domain marketing (`abadikan.com`), tambahkan juga:
```
abadikan.com       A   <IP_VPS>
www.abadikan.com   A   <IP_VPS>
```
> Jika `abadikan.com` memakai proxy Cloudflare (orange cloud), **matikan proxy** (set ke DNS-only/grey cloud) agar Caddy di VPS yang menerbitkan sertifikat Let's Encrypt. Ini juga yang membuat `gym.abadikan.com` saat ini berjalan mulus.

## 3. Clone & konfigurasi
```bash
git clone <url-repo-mu> gym_tracker && cd gym_tracker
```
Edit `Caddyfile`, ganti `gym.example.com` dengan domain aslimu. Pastikan blok `abadikan.com` (dan redirect `www.abadikan.com`) ikut diterapkan agar landing page, blog, dan terms dilayani di domain marketing.

## 4. Build & jalankan
```bash
# tanpa Supabase (mode lokal penuh):
docker compose up -d --build

# dengan Supabase/Mixpanel: pastikan file .env sudah dibuat dulu
docker compose up -d --build
```
Contoh `.env` production:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_project_token
NEXT_PUBLIC_APP_ENV=production
SUPABASE_SERVICE_ROLE_KEY=<server-only service_role key>
MAYAR_API_KEY=<Mayar Read & Write API key>
MAYAR_API_BASE_URL=https://api.mayar.id/hl/v2
COACH_PRICE_IDR=<harga dalam rupiah, bilangan bulat>
APP_BASE_URL=https://gym.abadikan.com
```

`SUPABASE_SERVICE_ROLE_KEY`, `MAYAR_API_KEY`, dan harga Coach dipakai saat runtime oleh endpoint server. Jangan menaruhnya pada variabel `NEXT_PUBLIC_*`. `APP_BASE_URL` dipakai sebagai URL kembali setelah checkout. Untuk sandbox, gunakan API key sandbox dan `MAYAR_API_BASE_URL=https://api.mayar.io/hl/v2`.

## 4. Siapkan Mayar untuk pembayaran Coach
1. Dari dashboard Mayar yang sudah terverifikasi, buat API key dengan akses API yang diperlukan untuk membuat invoice dan membaca transaksi. Simpan sebagai `MAYAR_API_KEY` di `.env` VPS; jangan kirim key melalui chat atau menaruhnya di frontend.
2. Pastikan `MAYAR_API_BASE_URL=https://api.mayar.id/hl/v2` untuk transaksi production dan isi `COACH_PRICE_IDR` dengan harga akses Coach selamanya.
3. Di Mayar buka **Integration → Webhook**, masukkan `https://gym.abadikan.com/api/payments/mayar/webhook`, simpan, lalu gunakan tombol tes URL. Event `testing` hanya dikonfirmasi endpoint dan tidak mengaktifkan akses. Event pembayaran baru diproses setelah konfigurasi runtime lengkap.
4. Checkout membuat invoice server-side dan pengguna membayar pada halaman hosted Mayar. Webhook `payment.received` hanya memicu pemeriksaan; server membaca detail transaksi dari API Mayar dan mencocokkan ID transaksi yang tersimpan serta nominal sebelum RPC Supabase mengaktifkan akses. Respons detail transaksi Mayar dapat berisi `extraData: null`, sehingga verifikasi tidak bergantung pada field itu. Saat kembali dengan ID order, aplikasi mencoba verifikasi otomatis beberapa kali untuk mengatasi jeda singkat sebelum status Mayar diperbarui. Jika pengguna keluar lalu membuka Coach lagi, order terakhir dan tautan checkout dipulihkan dari server, lalu status diperiksa ulang; pengguna juga dapat meminta pemeriksaan manual jika webhook terlambat.
5. Setelah mengubah `.env`, terapkan environment baru pada layanan aplikasi (`docker compose up -d --build`). Uji dulu dengan API key dan akun sandbox sebelum mengaktifkan pembayaran production.

> Variabel publik Supabase dan Mixpanel di-inline saat **build** melalui build args. Jika image pernah dibuat tanpa env tersebut, jalankan ulang dengan `--build`. Jangan memasukkan Mixpanel API Secret ke frontend.

## 5. Verifikasi
- `https://gym.example.com` → dashboard terbuka dengan HTTPS (Caddy auto-issue SSL Let's Encrypt).
- `https://abadikan.com` → landing page marketing terbuka; `https://abadikan.com/blog` dan `/terms` ikut berfungsi.
- Redirect marketing lama: `https://gym.example.com/aplikasi-tracking-gym` → `301` ke `https://abadikan.com/`; `https://abadikan.com/login` → `301` ke `https://gym.example.com/login`.
- Pastikan service worker aktif (DevTools → Application → Service Workers) → `sw.js` dari `/serwist/sw.js` — hanya pada `gym.example.com`, tidak pada domain marketing.
- Uji install PWA dari HP: buka site → menu browser → "Add to Home Screen".
- Uji login: tab Profil → Masuk/Daftar → data lokal ter-upload otomatis. Cek bahwa klik CTA "Mulai Gratis" di landing mengarah ke `https://gym.example.com/login?entry_source=landing_page&landing_cta=hero_start`.
- Verifikasi Mixpanel: DevTools → Network menampilkan request Mixpanel setelah aplikasi dibuka, lalu cek **Mixpanel → Data → Events**. Jika PWA masih memakai bundle lama, unregister service worker/hapus site data atau uji melalui incognito.

## Log & update
```bash
docker compose logs -f app       # log aplikasi
docker compose down              # hentikan semua
docker compose pull && docker compose up -d --build   # update setelah push baru
```

## Troubleshooting
- **SSL belum aktif / domain tidak resolve**: pastikan A record sudah masuk DNS (tunggu beberapa menit) dan port 80/443 terbuka di firewall VPS.
- **PWA tidak bisa install di HP**: PWA butuh HTTPS. Caddy menangani otomatis — pastikan kamu akses lewat `https://` (bukan IP).
- **Login/sync tidak muncul**: pastikan file `.env` ada di VPS dan build ulang dengan `docker compose up -d --build`.
- **Mixpanel tidak menerima event**: pastikan `NEXT_PUBLIC_MIXPANEL_TOKEN` dan `NEXT_PUBLIC_APP_ENV=production` ada di `.env` sebelum build, lalu rebuild image dan bersihkan cache PWA lama.
- **Checkout Coach belum tersedia**: pastikan migration `0010_coach_payments.sql` sudah dijalankan dan `SUPABASE_SERVICE_ROLE_KEY`, `MAYAR_API_KEY`, `MAYAR_API_BASE_URL`, serta `COACH_PRICE_IDR` sudah diisi di environment runtime.
