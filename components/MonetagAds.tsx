"use client";

import { useEffect } from "react";
import { isMarketingHostname } from "@/lib/site";

const MONETAG_ZONE_ID = "11925185";
const MONETAG_SCRIPT_SRC = "https://al5sm.com/tag.min.js";

// Monetag hanya dipasang di domain aplikasi produksi agar landing/blog tetap
// bebas dari skrip iklan tambahan dan service worker PWA Serwist tetap utuh.
export default function MonetagAds() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (isMarketingHostname(window.location.hostname)) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-zone="${MONETAG_ZONE_ID}"][src="${MONETAG_SCRIPT_SRC}"]`,
    );
    if (existingScript) return;

    const root = [document.documentElement, document.body].filter(Boolean).pop();
    if (!root) return;

    const script = document.createElement("script");
    script.dataset.zone = MONETAG_ZONE_ID;
    script.src = MONETAG_SCRIPT_SRC;
    script.async = true;
    root.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
