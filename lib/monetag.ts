import { isMarketingHostname } from "./site";

const MONETAG_VIGNETTE_ZONE_ID = "11926122";
const MONETAG_SCRIPT_SRC = "https://n6wxm.com/vignette.min.js";
const MONETAG_LAST_SHOWN_KEY = "gym_tracker_monetag_last_shown_v1";
const MONETAG_COOLDOWN_MS = 5 * 60 * 1000;

function canUseMonetag(): boolean {
  return process.env.NODE_ENV === "production" && typeof window !== "undefined";
}

function readLastShownAt(): number {
  if (!canUseMonetag()) return 0;
  if (isMarketingHostname(window.location.hostname)) return 0;

  try {
    const raw = localStorage.getItem(MONETAG_LAST_SHOWN_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeLastShownAt(timestamp: number): void {
  if (!canUseMonetag()) return;
  try {
    localStorage.setItem(MONETAG_LAST_SHOWN_KEY, JSON.stringify(timestamp));
  } catch {
    /* localStorage tidak tersedia / penuh. */
  }
}

export function canShowMonetagVignetteBanner(now = Date.now()): boolean {
  return now - readLastShownAt() >= MONETAG_COOLDOWN_MS;
}

export function maybeShowMonetagVignetteBanner(): boolean {
  if (!canUseMonetag()) return false;
  if (isMarketingHostname(window.location.hostname)) return false;
  if (!canShowMonetagVignetteBanner()) return false;

  const root = [document.documentElement, document.body].filter(Boolean).pop();
  if (!root) return false;

  const script = document.createElement("script");
  script.dataset.zone = MONETAG_VIGNETTE_ZONE_ID;
  script.src = MONETAG_SCRIPT_SRC;
  root.appendChild(script);

  writeLastShownAt(Date.now());
  return true;
}
