"use client";

import { useState } from "react";
import { isMarketingHostname } from "@/lib/site";

// Deteksi host marketing di client. Deteksi berbasis pathname tidak cukup:
// rewrite `/` -> `/aplikasi-tracking-gym` di proxy.ts tidak mengubah URL di
// browser, sehingga usePathname() membaca `/` (route dashboard) dan AuthGate
// bisa salah me-redirect ke /login. Hostname adalah sumber kebenaran.
export function useIsMarketingHost(): boolean {
  const [isMarketingHost] = useState(
    () => typeof window !== "undefined" && isMarketingHostname(window.location.hostname),
  );
  return isMarketingHost;
}