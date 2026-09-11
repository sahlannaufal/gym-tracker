"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import InstallPrompt from "./InstallPrompt";

function isMarketingPath(pathname: string): boolean {
  return pathname === "/aplikasi-tracking-gym" || pathname === "/blog" || pathname.startsWith("/blog/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isMarketingPath(pathname)) {
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
