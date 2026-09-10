import type { AnalyticsProperties } from "./analytics";

export type LandingCtaName = "header_login" | "hero_start" | "hero_features" | "footer_start";

type MarketingAttribution = {
  source: "landing_page";
  ctaName: LandingCtaName;
  createdAt: number;
};

const STORAGE_KEY = "gym_tracker_marketing_attribution_v1";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function saveMarketingAttribution(ctaName: LandingCtaName): void {
  if (typeof window === "undefined") return;
  const attribution: MarketingAttribution = {
    source: "landing_page",
    ctaName,
    createdAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function consumeMarketingAttribution(): AnalyticsProperties {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  window.localStorage.removeItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const value = JSON.parse(raw) as Partial<MarketingAttribution>;
    if (
      value.source === "landing_page" &&
      typeof value.ctaName === "string" &&
      typeof value.createdAt === "number" &&
      Date.now() - value.createdAt <= MAX_AGE_MS
    ) {
      return { entry_source: value.source, landing_cta: value.ctaName };
    }
  } catch {
    // Attribution rusak atau kedaluwarsa cukup diabaikan.
  }
  return {};
}
