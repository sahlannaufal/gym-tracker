export const APP_HOST = "gym.abadikan.com";
export const MARKETING_HOST = "abadikan.com";
export const APP_ORIGIN = `https://${APP_HOST}`;
export const MARKETING_ORIGIN = `https://${MARKETING_HOST}`;

export type MarketingSource = "landing_page" | "blog";

export function isMarketingHostname(hostname: string): boolean {
  return hostname === MARKETING_HOST || hostname === `www.${MARKETING_HOST}`;
}

// Alamat /login yang memuat atribusi marketing lintas subdomain. Pada
// production arahkan ke app (gym.abadikan.com); non-production dipakai untuk
// development localhost agar alur auth tetap berjalan satu origin.
function getAuthBaseUrl(): string {
  if (process.env.NODE_ENV === "production") return APP_ORIGIN;
  if (typeof window === "undefined") return APP_ORIGIN;
  return window.location.origin;
}

export function buildAuthUrl(ctaName: string, source: MarketingSource): string {
  const ctaParam = source === "blog" ? "blog_cta" : "landing_cta";
  return `${getAuthBaseUrl()}/login?entry_source=${source}&${ctaParam}=${encodeURIComponent(ctaName)}`;
}