"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import {
  saveMarketingAttribution,
  type BlogCtaName,
} from "@/lib/marketingAttribution";
import { buildAuthUrl } from "@/lib/site";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  location: string;
  articleSlug?: string;
  ctaName?: BlogCtaName;
};

export default function TrackedBlogLink({
  href,
  className,
  children,
  location,
  articleSlug,
  ctaName,
}: Props) {
  // CTA autentikasi blog menuju /login di domain aplikasi dengan atribusi
  // via query string (localStorage tidak dibaca lintas origin).
  const destination = ctaName ? buildAuthUrl(ctaName, "blog") : href;
  return (
    <Link
      href={destination}
      className={className}
      onClick={() => {
        if (ctaName) {
          saveMarketingAttribution(ctaName, "blog");
          trackEvent("Blog CTA Clicked", {
            cta_name: ctaName,
            cta_destination: destination,
            click_location: location,
          });
          return;
        }

        trackEvent("Blog Article Clicked", {
          article_slug: articleSlug,
          article_destination: href,
          click_location: location,
        });
      }}
    >
      {children}
    </Link>
  );
}
