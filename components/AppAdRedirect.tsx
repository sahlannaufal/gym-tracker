"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const REDIRECT_INTERVAL_MS = 5 * 60 * 1000;
const ENTITLEMENT_UPDATED_EVENT = "coach-entitlement-updated";
const ENTITLEMENT_UPDATED_STORAGE_KEY = "coach-entitlement-updated";

function getSafeAdUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function AppAdRedirect() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !supabase) return;

    let active = true;
    let canRedirect = false;
    let currentUserId: string | null = null;
    let checkSequence = 0;
    let remainingMs = REDIRECT_INTERVAL_MS;
    let timerId: number | null = null;
    let timerStartedAt: number | null = null;

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const recordElapsedTime = () => {
      if (timerStartedAt === null) return;
      remainingMs = Math.max(0, remainingMs - (Date.now() - timerStartedAt));
      timerStartedAt = null;
    };

    const startTimer = () => {
      if (!canRedirect || timerId !== null) return;

      timerStartedAt = Date.now();
      timerId = window.setTimeout(() => {
        recordElapsedTime();
        timerId = null;
        void redirectIfStillEligible();
      }, remainingMs);
    };

    const redirectIfStillEligible = async () => {
      const userId = currentUserId;
      if (!canRedirect || !userId) return;
      const sequence = checkSequence;

      // Recheck before leaving in case this account became premium in another tab.
      const { data, error } = await supabase!
        .from("coach_entitlements")
        .select("status,current_period_end")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active || sequence !== checkSequence || !canRedirect || currentUserId !== userId || error) return;
      if (document.visibilityState !== "visible") {
        remainingMs = 0;
        return;
      }

      const isPremium = data?.status === "active" &&
        (!data.current_period_end || data.current_period_end > new Date().toISOString());
      if (isPremium) {
        canRedirect = false;
        remainingMs = REDIRECT_INTERVAL_MS;
        return;
      }

      const { data: adSettings, error: adSettingsError } = await supabase!
        .from("app_ad_settings")
        .select("enabled,target_url")
        .eq("id", 1)
        .maybeSingle();
      if (!active || sequence !== checkSequence || !canRedirect || currentUserId !== userId || adSettingsError) return;
      const latestRedirectUrl = adSettings?.enabled ? getSafeAdUrl(adSettings.target_url) : null;
      if (!latestRedirectUrl) {
        canRedirect = false;
        remainingMs = REDIRECT_INTERVAL_MS;
        stopTimer();
        return;
      }
      if (document.visibilityState !== "visible") {
        remainingMs = 0;
        return;
      }

      window.location.assign(latestRedirectUrl);
    };

    const checkEntitlement = async (userId: string | null) => {
      const sequence = ++checkSequence;
      const userChanged = currentUserId !== userId;
      recordElapsedTime();
      currentUserId = userId;
      canRedirect = false;
      stopTimer();
      if (userChanged) remainingMs = REDIRECT_INTERVAL_MS;

      if (!userId) return;

      const { data, error } = await supabase!
        .from("coach_entitlements")
        .select("status,current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      // Fail closed: uncertainty about premium access must not force navigation.
      if (!active || sequence !== checkSequence || error) return;

      const isPremium = data?.status === "active" &&
        (!data.current_period_end || data.current_period_end > new Date().toISOString());
      if (isPremium) {
        remainingMs = REDIRECT_INTERVAL_MS;
        return;
      }

      const { data: adSettings, error: adSettingsError } = await supabase!
        .from("app_ad_settings")
        .select("enabled,target_url")
        .eq("id", 1)
        .maybeSingle();
      if (!active || sequence !== checkSequence || adSettingsError) return;

      if (!adSettings?.enabled || !getSafeAdUrl(adSettings.target_url)) {
        remainingMs = REDIRECT_INTERVAL_MS;
        return;
      }

      canRedirect = true;
      startTimer();
    };

    const refreshCurrentEntitlement = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (active) void checkEntitlement(session?.user.id ?? null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshCurrentEntitlement();
    };

    const handleCoachEntitlementUpdated = () => {
      canRedirect = false;
      recordElapsedTime();
      stopTimer();
      remainingMs = REDIRECT_INTERVAL_MS;
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ENTITLEMENT_UPDATED_STORAGE_KEY) handleCoachEntitlementUpdated();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkEntitlement(session?.user.id ?? null);
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", refreshCurrentEntitlement);
    window.addEventListener(ENTITLEMENT_UPDATED_EVENT, handleCoachEntitlementUpdated);
    window.addEventListener("storage", handleStorage);
    void refreshCurrentEntitlement();

    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", refreshCurrentEntitlement);
      window.removeEventListener(ENTITLEMENT_UPDATED_EVENT, handleCoachEntitlementUpdated);
      window.removeEventListener("storage", handleStorage);
      stopTimer();
    };
  }, []);

  return null;
}
