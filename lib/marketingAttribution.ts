import type { AnalyticsProperties } from "./analytics";
import type { MarketingSource } from "./site";

export type LandingCtaName = "header_login" | "hero_start" | "hero_features" | "footer_start";
export type BlogCtaName = "header_start" | "article_start";
export type { MarketingSource };

type MarketingAttribution = {
  source: MarketingSource;
  ctaName: LandingCtaName | BlogCtaName;
  createdAt: number;
};

const STORAGE_KEY = "gym_tracker_marketing_attribution_v1";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function saveMarketingAttribution(
  ctaName: LandingCtaName | BlogCtaName,
  source: MarketingSource = "landing_page",
): void {
  if (typeof window === "undefined") return;
  const attribution: MarketingAttribution = {
    source,
    ctaName,
    createdAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

// Menyerap atribusi yang dikirim lintas domain melalui query string pada
// URL /login (mis. ?entry_source=landing_page&landing_cta=hero_start) lalu
// menyimpannya di localStorage origin aplikasi, sehingga alur
// consumeMarketingAttribution() yang sudah ada tetap bekerja lintas origin.
export function saveMarketingAttributionFromUrl(query: URLSearchParams): void {
  if (typeof window === "undefined") return;
  const entrySource = query.get("entry_source");
  if (entrySource !== "landing_page" && entrySource !== "blog") return;
  const ctaParam = entrySource === "blog" ? "blog_cta" : "landing_cta";
  const ctaName = query.get(ctaParam);
  if (!ctaName) return;
  saveMarketingAttribution(ctaName as LandingCtaName | BlogCtaName, entrySource);
}

export function isMarketingSource(value: unknown): value is MarketingSource {
  return value === "landing_page" || value === "blog";
}

export function consumeMarketingAttribution(): AnalyticsProperties {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  window.localStorage.removeItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const value = JSON.parse(raw) as Partial<MarketingAttribution>;
    if (
      isMarketingSource(value.source) &&
      typeof value.ctaName === "string" &&
      typeof value.createdAt === "number" &&
      Date.now() - value.createdAt <= MAX_AGE_MS
    ) {
      return {
        entry_source: value.source,
        [value.source === "blog" ? "blog_cta" : "landing_cta"]: value.ctaName,
      };
    }
  } catch {
    // Attribution rusak atau kedaluwarsa cukup diabaikan.
  }
  return {};
}
