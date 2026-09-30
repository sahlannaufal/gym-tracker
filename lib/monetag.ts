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
  script.async = true;
  script.src = MONETAG_SCRIPT_SRC;
  root.appendChild(script);
  return true;
}

/**
 * Load the tag during app startup so Monetag can initialize on the app host.
 * Loading the tag does not itself create an application-side ad trigger; callers
 * should use showMonetagVignette() only at the approved user actions.
 */
export function loadMonetagVignetteTag(): boolean {
  return injectMonetagVignetteScript();
}

/**
 * Monetag's Vignette Banner is visit-triggered, not exposed as a documented
 * show_<zone> API. Keep the tag initialized and let the approved user action
 * navigate through a same-origin URL so a fresh page visit can qualify.
 */
export function showMonetagVignette(): boolean {
  if (!canUseMonetag() || isMarketingHostname(window.location.hostname)) return false;
  return injectMonetagVignetteScript();
}
