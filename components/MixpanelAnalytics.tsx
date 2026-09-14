"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initMixpanel, identifyAndSetUser, trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase/client";

const PAGE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/today": "Latihan Hari Ini",
  "/workout/new": "Tambah Latihan",
  "/progress": "Progres",
  "/account": "Profil",
  "/login": "Masuk / Daftar",
  "/forgot-password": "Lupa Password",
  "/auth/callback": "Konfirmasi Akun",
  "/auth/reset-password": "Buat Password Baru",
  "/~offline": "Offline",
  "/aplikasi-tracking-gym": "Landing Page Marketing",
};

let appOpenedTracked = false;
let pwaOpenedTracked = false;

const APPLICATION_PATHS = new Set([
  "/",
  "/today",
  "/workout/new",
  "/progress",
  "/account",
  "/history",
  "/routine",
]);

function getMarketingPageType(pathname: string): "landing_page" | "blog_index" | "blog_article" | null {
  if (pathname === "/aplikasi-tracking-gym") return "landing_page";
  if (pathname === "/blog") return "blog_index";
  if (pathname.startsWith("/blog/")) return "blog_article";
  return null;
}

function isPwa(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  );
}

function Tracker({ appVersion }: { appVersion: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authResolved, setAuthResolved] = useState(!supabase);
  const authenticatedRef = useRef(false);
  const previousPageRef = useRef<string | null>(null);
  const lastPageRef = useRef<string | null>(null);

  useEffect(() => {
    initMixpanel();

    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      authenticatedRef.current = Boolean(user);
      if (user) identifyAndSetUser(user);
      setAuthResolved(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authenticatedRef.current = Boolean(session?.user);
        if (session?.user) identifyAndSetUser(session.user);
        setAuthResolved(true);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !authResolved ||
      appOpenedTracked ||
      !pathname ||
      !APPLICATION_PATHS.has(pathname) ||
      !authenticatedRef.current
    ) {
      return;
    }
    const openedAsPwa = isPwa();
    appOpenedTracked = true;
    trackEvent("App Opened", {
      platform: navigator.platform || "web",
      is_pwa: openedAsPwa,
      app_version: appVersion,
      is_authenticated: authenticatedRef.current,
    });

    if (openedAsPwa && !pwaOpenedTracked) {
      pwaOpenedTracked = true;
      trackEvent("PWA Opened", {
        platform: navigator.platform || "web",
        app_version: appVersion,
        is_authenticated: authenticatedRef.current,
        detection_method: "standalone_display_mode",
      });
    }
  }, [appVersion, authResolved, pathname]);

  useEffect(() => {
    if (!authResolved || !pathname) return;
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    if (lastPageRef.current === pagePath) return;

    trackEvent("Page Viewed", {
      page_name: pathname === "/blog" ? "Blog" : pathname.startsWith("/blog/") ? "Artikel Blog" : PAGE_NAMES[pathname] ?? pathname,
      page_path: pagePath,
      previous_page: previousPageRef.current,
      is_authenticated: authenticatedRef.current,
    });

    const marketingPageType = getMarketingPageType(pathname);
    if (marketingPageType) {
      trackEvent("Marketing Site Viewed", {
        content_type: marketingPageType,
        page_path: pagePath,
        is_authenticated: authenticatedRef.current,
      });
    }

    if (marketingPageType === "blog_article") {
      trackEvent("Blog Article Opened", {
        article_slug: pathname.slice("/blog/".length),
        page_path: pagePath,
        is_authenticated: authenticatedRef.current,
      });
    }
    previousPageRef.current = pagePath;
    lastPageRef.current = pagePath;
  }, [authResolved, pathname, searchParams]);

  return null;
}

export default function MixpanelAnalytics({ appVersion }: { appVersion: string }) {
  return (
    <Suspense fallback={null}>
      <Tracker appVersion={appVersion} />
    </Suspense>
  );
}
