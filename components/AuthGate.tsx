"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const PUBLIC_PATHS = new Set(["/login", "/auth/callback", "/~offline"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const redirectTo =
    !loading && user && pathname === "/login"
      ? "/"
      : !loading && !user && !isPublicPath
        ? "/login"
        : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Callback harus segera dirender agar Supabase dapat memproses token URL.
  if (pathname === "/auth/callback" || pathname === "/~offline") {
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
