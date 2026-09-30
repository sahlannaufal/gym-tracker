import { isMarketingHostname } from "./site";

const MONETAG_DIRECT_LINK_URL = "https://omg10.com/4/11925451";
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

export function canShowMonetagDirectLink(now = Date.now()): boolean {
  return now - readLastShownAt() >= MONETAG_COOLDOWN_MS;
}

export function maybeOpenMonetagDirectLink(): boolean {
  if (!canUseMonetag()) return false;
  if (isMarketingHostname(window.location.hostname)) return false;
  if (!canShowMonetagDirectLink()) return false;

  const openedWindow = window.open(
    MONETAG_DIRECT_LINK_URL,
    "_blank",
    "noopener,noreferrer",
  );
  if (!openedWindow) return false;

  writeLastShownAt(Date.now());
  return true;
}
