"use client";

import { useEffect, useRef, useState } from "react";
import CoachPurchaseFlow from "./CoachPurchaseFlow";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase/client";
import {
  consumeCoachOfferIntent,
  hasCoachOfferIntent,
  hasShownCoachOfferThisSession,
  markCoachOfferShownThisSession,
} from "@/lib/coachOfferIntent";

export default function CoachSessionOffer() {
  const { user, loading, configured } = useAuth();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"session_start" | "referral_link">("session_start");
  const inspectedUserId = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (loading) return;
    if (!userId) {
      inspectedUserId.current = null;
      return;
    }
    if (!configured || !supabase || inspectedUserId.current === userId) return;

    // Capture the narrowed ID explicitly; TypeScript does not retain the
    // optional-chain narrowing inside the nested async function.
    const authenticatedUserId: string = userId;
    inspectedUserId.current = authenticatedUserId;
    let active = true;

    async function inspectEntitlement() {
      const { data, error } = await supabase!
        .from("coach_entitlements")
        .select("status,current_period_end")
        .eq("user_id", authenticatedUserId)
        .maybeSingle();

      // Jangan tampilkan paywall jika status premium tidak dapat dipastikan.
      if (!active || error) return;

      const entitled = data?.status === "active" &&
        (!data.current_period_end || data.current_period_end > new Date().toISOString());
      if (entitled) {
        consumeCoachOfferIntent();
        return;
      }

      const referralIntent = hasCoachOfferIntent();
      if (!referralIntent && hasShownCoachOfferThisSession(authenticatedUserId)) return;

      markCoachOfferShownThisSession(authenticatedUserId);
      setPlacement(consumeCoachOfferIntent() ? "referral_link" : "session_start");
      setOpen(true);
    }

    void inspectEntitlement();
    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  function handleActivated() {
    setOpen(false);
    window.dispatchEvent(new Event("coach-entitlement-updated"));
    try {
      window.localStorage.setItem("coach-entitlement-updated", String(Date.now()));
    } catch {
      // Pembaruan entitlement tetap berlaku meski storage browser tidak tersedia.
    }
  }

  return <CoachPurchaseFlow open={open} onClose={() => setOpen(false)} onActivated={handleActivated} placement={placement} />;
}
