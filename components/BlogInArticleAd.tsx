"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = "ca-pub-9272067329159734";
const BLOG_IN_ARTICLE_SLOT = "9468524348";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function BlogInArticleAd() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Skrip AdSense dimuat oleh BlogAdSense. Satu push per unit diperlukan
    // supaya AdSense dapat mengisi elemen <ins> ini setelah hydration.
    if (process.env.NODE_ENV !== "production" || !adRef.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Kegagalan pengisian (mis. ad blocker) tidak boleh mengganggu artikel.
    }
  }, []);

  if (process.env.NODE_ENV !== "production") return null;

  return (
    <aside className="my-10" aria-label="Iklan">
      <p className="mb-2 text-center text-xs text-gray-600">Iklan</p>
      <ins
        ref={adRef}
        className="adsbygoogle block text-center"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={BLOG_IN_ARTICLE_SLOT}
      />
    </aside>
  );
}
