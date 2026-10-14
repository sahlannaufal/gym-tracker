"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import InstallPrompt from "./InstallPrompt";
import ShopeeRedirect from "./ShopeeRedirect";
import { isMarketingHostname } from "@/lib/site";
import { useIsMarketingHost } from "@/lib/useMarketingHost";

function isMarketingPath(pathname: string): boolean {
  return pathname === "/aplikasi-tracking-gym" || pathname === "/blog" || pathname.startsWith("/blog/");
}

// Halaman admin blog: tanpa bottom nav/FAB karena bukan bagian alur aplikasi.
function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isPublicUtilityPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth/") ||
    pathname === "/~offline"
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketingHost = useIsMarketingHost();
  const isCurrentMarketingHost =
    isMarketingHost ||
    (typeof window !== "undefined" && isMarketingHostname(window.location.hostname));

  if (isCurrentMarketingHost || isMarketingPath(pathname) || pathname === "/terms" || pathname === "/privacy") {
    return <div className="min-h-screen">{children}</div>;
  }

  const shopeeRedirect = !isPublicUtilityPath(pathname) && <ShopeeRedirect />;

  if (isDashboardPath(pathname)) {
    return (
      <>
        {shopeeRedirect}
        <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-16">{children}</main>
      </>
    );
  }

  return (
    <>
      {shopeeRedirect}
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </>
  );
}
