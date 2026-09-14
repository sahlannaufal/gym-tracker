"use client";

import { useEffect, useState } from "react";
import { isMarketingHostname } from "@/lib/site";

// Deteksi host marketing di client. Deteksi berbasis pathname tidak cukup:
// rewrite `/` -> `/aplikasi-tracking-gym` di proxy.ts tidak mengubah URL di
// browser, sehingga usePathname() membaca `/` (route dashboard) dan AuthGate
// bisa salah me-redirect ke /login. Hostname adalah sumber kebenaran.
export function useIsMarketingHost(): boolean {
  // Nilai state SSR harus konsisten dengan HTML awal. Setelah hydration, baru
  // hostname browser dibaca; initializer useState saja tidak cukup karena state
  // dari render server akan dipakai ulang oleh React di client.
  const [isMarketingHost, setIsMarketingHost] = useState(false);

  useEffect(() => {
    setIsMarketingHost(isMarketingHostname(window.location.hostname));
  }, []);

  return isMarketingHost;
}
