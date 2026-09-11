"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

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
  const isIndexablePublicPath =
    pathname === "/aplikasi-tracking-gym" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  const isPublicPath = PUBLIC_PATHS.has(pathname) || isIndexablePublicPath;
  const redirectTo =
    !loading && user && pathname === "/login"
      ? "/"
      : !loading && !user && !isPublicPath
        ? "/login"
        : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Konten marketing harus langsung tersedia pada HTML awal untuk crawler;
  // route ini tidak membaca data user dan tidak perlu menunggu pemulihan sesi.
  if (isIndexablePublicPath) return children;

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
