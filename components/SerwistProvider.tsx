"use client";

import { useState } from "react";
import { isMarketingHostname } from "@/lib/site";
import {
  SerwistProvider as BaseSerwistProvider,
  type SerwistProviderProps,
} from "@serwist/turbopack/react";

// Nonaktifkan service worker/PWA pada domain marketing (abadikan.com) agar
// landing/blog tidak terdeteksi sebagai aplikasi yang bisa di-install.
export function SerwistProvider(props: SerwistProviderProps) {
  const [isMarketingHost] = useState(() =>
    typeof window !== "undefined" && isMarketingHostname(window.location.hostname),
  );
  return <BaseSerwistProvider {...props} disable={isMarketingHost} />;
}