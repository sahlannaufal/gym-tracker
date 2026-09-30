"use client";

import { useEffect } from "react";
import { loadMonetagVignetteTag } from "@/lib/monetag";
import { useIsMarketingHost } from "@/lib/useMarketingHost";

export default function MonetagTag() {
  const isMarketingHost = useIsMarketingHost();

  useEffect(() => {
    if (!isMarketingHost) loadMonetagVignetteTag();
  }, [isMarketingHost]);

  return null;
}
