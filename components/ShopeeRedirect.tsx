"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const SHOPEE_URL = "https://s.shopee.co.id/7AeJwNLgIX";
const REDIRECT_INTERVAL_MS = 5 * 60 * 1000;
const ENTITLEMENT_UPDATED_EVENT = "coach-entitlement-updated";
const ENTITLEMENT_UPDATED_STORAGE_KEY = "coach-entitlement-updated";

export default function ShopeeRedirect() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !supabase) return;

    let active = true;
    let canRedirect = false;
    let currentUserId: string | null = null;
    let checkSequence = 0;
    let remainingMs = REDIRECT_INTERVAL_MS;
    let timerId: number | null = null;
    let resumedAt: number | null = null;

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const startTimer = () => {
      if (!canRedirect || document.visibilityState !== "visible" || timerId !== null) return;

      resumedAt = Date.now();
      timerId = window.setTimeout(() => {
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
        return;
      }

      window.location.assign(SHOPEE_URL);
    };

    const checkEntitlement = async (userId: string | null) => {
      const sequence = ++checkSequence;
      currentUserId = userId;
      canRedirect = false;
      stopTimer();
      resumedAt = null;

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
      if (isPremium) return;

      canRedirect = true;
      startTimer();
    };

    const refreshCurrentEntitlement = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (active) void checkEntitlement(session?.user.id ?? null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (timerId !== null && resumedAt !== null) {
          remainingMs = Math.max(0, remainingMs - (Date.now() - resumedAt));
        }
        stopTimer();
        resumedAt = null;
        return;
      }

      void refreshCurrentEntitlement();
    };

    const handleCoachEntitlementUpdated = () => {
      canRedirect = false;
      stopTimer();
      resumedAt = null;
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
