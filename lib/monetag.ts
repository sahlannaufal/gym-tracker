import { isMarketingHostname } from "./site";

export const MONETAG_VIGNETTE_ZONE_ID = "11926122";
export const MONETAG_SCRIPT_SRC = "https://n6wxm.com/vignette.min.js";

function canUseMonetag(): boolean {
  return process.env.NODE_ENV === "production" && typeof window !== "undefined";
}

function getRootNode(): HTMLElement | null {
  return [document.documentElement, document.body].filter(Boolean).pop() ?? null;
}

function hasMonetagScript(): boolean {
  return Boolean(
    document.querySelector<HTMLScriptElement>(
      `script[data-zone="${MONETAG_VIGNETTE_ZONE_ID}"][src="${MONETAG_SCRIPT_SRC}"]`,
    ),
  );
}

export function injectMonetagVignetteScript(): boolean {
  if (!canUseMonetag()) return false;
  if (isMarketingHostname(window.location.hostname)) return false;
  if (hasMonetagScript()) return true;

  const root = getRootNode();
  if (!root) return false;

  const script = document.createElement("script");
  script.dataset.zone = MONETAG_VIGNETTE_ZONE_ID;
  script.src = MONETAG_SCRIPT_SRC;
  root.appendChild(script);
  return true;
}
