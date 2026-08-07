# Panduan Deploy ke VPS (Docker + Caddy)

App PWA (Next.js). Data utama di **LocalStorage browser (offline-first)** dengan **sinkronisasi cloud Supabase** (opsional) untuk login & data lintas perangkat.

## Prasyarat
- VPS dengan **domain/subdomain** yang bisa diarahkan (DNS) ke IP VPS.
- **Node ≥ 20.9** hanya dibutuhkan untuk build manual; Docker build juga berjalan di dalam image (`node:22-alpine`).
- **Akun Supabase (free tier)** jika ingin mengaktifkan login & sinkronisasi.

## 0. (Opsional) Siapkan Supabase
1. Buat project di https://supabase.com → **Project Settings → API**: catat **Project URL** & **anon key** (bukan `service_role`).
2. Buka **SQL Editor** → paste isi `supabase/migrations/0001_init.sql` → **Run** (membuat tabel `workouts`, `routine`, + RLS).
3. **Authentication → Providers → Email**: untuk MVP boleh matikan "Confirm email".
4. Di VPS, buat file `.env` di folder project:
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
gym.example.com   A   <IP_VPS>
```

## 3. Clone & konfigurasi
```bash
git clone <url-repo-mu> gym_tracker && cd gym_tracker
```
Edit `Caddyfile`, ganti `gym.example.com` dengan domain aslimu.

## 4. Build & jalankan
```bash
# tanpa Supabase (mode lokal penuh):
docker compose up -d --build

# dengan Supabase (login + sync): pastikan file .env sudah dibuat dulu
docker compose up -d --build
```
> `NEXT_PUBLIC_SUPABASE_*` di-inline saat **build** (build args dari `.env`). Jika sudah pernah build tanpa env, jalankan ulang dengan `--build`.

## 5. Verifikasi
- `https://gym.example.com` → dashboard terbuka dengan HTTPS (Caddy auto-issue SSL Let's Encrypt).
- Pastikan service worker aktif (DevTools → Application → Service Workers) → `sw.js` dari `/serwist/sw.js`.
- Uji install PWA dari HP: buka site → menu browser → "Add to Home Screen".
- Uji login: tab Profil → Masuk/Daftar → data lokal ter-upload otomatis.

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
