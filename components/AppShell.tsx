"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import InstallPrompt from "./InstallPrompt";
import { useIsMarketingHost } from "@/lib/useMarketingHost";

function isMarketingPath(pathname: string): boolean {
  return pathname === "/aplikasi-tracking-gym" || pathname === "/blog" || pathname.startsWith("/blog/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketingHost = useIsMarketingHost();

  if (isMarketingHost || isMarketingPath(pathname) || pathname === "/terms") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </>
  );
}
