export const APP_HOST = "gym.abadikan.com";
export const MARKETING_HOST = "abadikan.com";
export const APP_ORIGIN = `https://${APP_HOST}`;
export const MARKETING_ORIGIN = `https://${MARKETING_HOST}`;

export type MarketingSource = "landing_page" | "blog";

export function isMarketingHostname(hostname: string): boolean {
  return hostname === MARKETING_HOST || hostname === `www.${MARKETING_HOST}`;
}

// Alamat /login yang memuat atribusi marketing lintas subdomain. Nilai ini
// sengaja tidak membaca `window` karena helper dipanggil saat SSR dan render
// client; URL relatif pada development tetap satu origin tanpa hydration mismatch.
function getAuthBaseUrl(): string {
  if (process.env.NODE_ENV === "production") return APP_ORIGIN;
  return "";
}

export function buildAuthUrl(ctaName: string, source: MarketingSource): string {
  const ctaParam = source === "blog" ? "blog_cta" : "landing_cta";
  return `${getAuthBaseUrl()}/login?entry_source=${source}&${ctaParam}=${encodeURIComponent(ctaName)}`;
}
