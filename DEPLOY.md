# Panduan Deploy ke VPS (Docker + Caddy)

App statis + PWA, data tersimpan di **LocalStorage browser** — tidak ada database server.

## Prasyarat
- VPS dengan **domain/subdomain** yang bisa diarahkan (DNS) ke IP VPS.
- **Node ≥ 20.9** hanya dibutuhkan untuk build manual; Docker build juga berjalan di dalam image (`node:22-alpine`).

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
docker compose up -d --build
```

## 5. Verifikasi
- `https://gym.example.com` → dashboard terbuka dengan HTTPS (Caddy auto-issue SSL Let's Encrypt).
- Pastikan service worker aktif (DevTools → Application → Service Workers) → `sw.js` dari `/serwist/sw.js`.
- Uji install PWA dari HP: buka site → menu browser → "Add to Home Screen".

## Log & update
```bash
docker compose logs -f app       # log aplikasi
docker compose down              # hentikan semua
docker compose pull && docker compose up -d --build   # update setelah push baru
```

## Troubleshooting
- **SSL belum aktif / domain tidak resolve**: pastikan A record sudah masuk DNS (tunggu beberapa menit) dan port 80/443 terbuka di firewall VPS.
- **PWA tidak bisa install di HP**: PWA butuh HTTPS. Caddy menangani otomatis — pastikan kamu akses lewat `https://` (bukan IP).
