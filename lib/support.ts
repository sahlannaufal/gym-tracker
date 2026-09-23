// Link donasi Trakteer milik pengembang. Dipisah di satu tempat agar mudah
// diganti tanpa menyentuh komponen UI.
export const TRAKTEER_URL = "https://trakteer.id/sahlan_naufal/tip";

// Banner Dashboard hanya boleh disembunyikan untuk hari yang sama; tanggal
// penutupan disimpan agar besok banner muncul kembali (siklus harian).
const TRAKTEER_BANNER_DISMISSED_KEY = "gym_tracker_trakteer_banner_dismissed_v1";

export function loadTrakteerBannerDismissedDate(): string | null {
  try {
    const raw = localStorage.getItem(TRAKTEER_BANNER_DISMISSED_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    // Nilai legacy dari versi boolean dianggap bukan tanggal → banner tampil lagi.
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function dismissTrakteerBanner(date: string): void {
  try {
    localStorage.setItem(TRAKTEER_BANNER_DISMISSED_KEY, JSON.stringify(date));
  } catch {
    /* localStorage tidak tersedia — abaikan */
  }
}
