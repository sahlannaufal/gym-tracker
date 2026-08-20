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
  "/auth/callback": "Konfirmasi Akun",
  "/~offline": "Offline",
};

let appOpenedTracked = false;

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
    if (!authResolved || appOpenedTracked) return;
    appOpenedTracked = true;
    trackEvent("App Opened", {
      platform: navigator.platform || "web",
      is_pwa: isPwa(),
      app_version: appVersion,
      is_authenticated: authenticatedRef.current,
    });
  }, [appVersion, authResolved]);

  useEffect(() => {
    if (!authResolved || !pathname) return;
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    if (lastPageRef.current === pagePath) return;

    trackEvent("Page Viewed", {
      page_name: PAGE_NAMES[pathname] ?? pathname,
      page_path: pagePath,
      previous_page: previousPageRef.current,
      is_authenticated: authenticatedRef.current,
    });
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
