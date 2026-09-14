"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { saveMarketingAttribution, type LandingCtaName } from "@/lib/marketingAttribution";
import { buildAuthUrl } from "@/lib/site";

export default function TrackedMarketingLink({
  href,
  ctaName,
  leadsToAuth = false,
  className,
  children,
}: {
  href: string;
  ctaName: LandingCtaName;
  leadsToAuth?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  // CTA autentikasi menuju /login di domain aplikasi sambil membawa atribusi
  // lewat query string, karena localStorage tidak dapat dibaca lintas origin.
  const destination = leadsToAuth ? buildAuthUrl(ctaName, "landing_page") : href;
  return (
    <Link
      href={destination}
      className={className}
      onClick={() => {
        if (leadsToAuth) saveMarketingAttribution(ctaName);
        trackEvent("Landing CTA Clicked", {
          cta_name: ctaName,
          cta_destination: destination,
          leads_to_auth: leadsToAuth,
        });
      }}
    >
      {children}
    </Link>
  );
}
