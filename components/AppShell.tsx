"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import InstallPrompt from "./InstallPrompt";

const MARKETING_PATHS = new Set(["/aplikasi-tracking-gym"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (MARKETING_PATHS.has(pathname)) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </>
  );
}
