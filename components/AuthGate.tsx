"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useIsMarketingHost } from "@/lib/useMarketingHost";
import { isMarketingHostname } from "@/lib/site";
import { clearCoachOfferShownThisSession, saveCoachOfferIntentFromUrl } from "@/lib/coachOfferIntent";

const PUBLIC_PATHS = new Set([
  "/login",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/~offline",
  "/aplikasi-tracking-gym",
]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isMarketingHost = useIsMarketingHost();
  // Hook hostname baru diperbarui setelah hydration. Guard sinkron ini
  // mencegah effect redirect berjalan pada domain marketing sebelum update
  // state hook tersebut selesai.
  const isCurrentMarketingHost =
    isMarketingHost ||
    (typeof window !== "undefined" && isMarketingHostname(window.location.hostname));
  const isIndexablePublicPath =
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/aplikasi-tracking-gym" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  const isPublicPath = PUBLIC_PATHS.has(pathname) || isIndexablePublicPath;
  const redirectTo =
    !loading && user && pathname === "/login"
      ? "/"
      : !loading && !user && !isPublicPath && !isCurrentMarketingHost
        ? "/login"
        : null;

  useEffect(() => {
    if (redirectTo) {
      if (pathname === "/login" && typeof window !== "undefined") {
        if (user?.id) clearCoachOfferShownThisSession(user.id);
        saveCoachOfferIntentFromUrl(new URLSearchParams(window.location.search));
      }
      router.replace(redirectTo);
    }
  }, [pathname, redirectTo, router, user?.id]);

  // Konten marketing harus langsung tersedia pada HTML awal untuk crawler;
  // route ini tidak membaca data user dan tidak perlu menunggu pemulihan sesi.
  // Pada host marketing semua path app di-301 ke gym.abadikan.com (proxy.ts),
  // jadi tidak ada halaman yang perlu di-gate di sini.
  if (isIndexablePublicPath || isMarketingHost) return children;

  // Callback harus segera dirender agar Supabase dapat memproses token URL.
  if (
    pathname === "/auth/callback" ||
    pathname === "/auth/reset-password" ||
    pathname === "/~offline"
  ) {
    return children;
  }

  if (loading || redirectTo) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-gray-500">Memeriksa sesi...</p>
      </main>
    );
  }

  return children;
}
