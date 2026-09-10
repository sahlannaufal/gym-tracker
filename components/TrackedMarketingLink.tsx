"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { saveMarketingAttribution, type LandingCtaName } from "@/lib/marketingAttribution";

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
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (leadsToAuth) saveMarketingAttribution(ctaName);
        trackEvent("Landing CTA Clicked", {
          cta_name: ctaName,
          cta_destination: href,
          leads_to_auth: leadsToAuth,
        });
      }}
    >
      {children}
    </Link>
  );
}
