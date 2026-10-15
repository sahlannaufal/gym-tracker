"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CoachSheet from "./CoachSheet";
import { useCoachGoal } from "@/lib/useCoachGoal";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import { supabase } from "@/lib/supabase/client";
import type { CoachProgramRecommendation } from "@/lib/coachProgramRecommendation";
import type { CoachGoal } from "@/lib/types";
import CoachIcon from "./CoachIcon";
import CoachPurchaseFlow from "./CoachPurchaseFlow";

function createCoachProgramId(): string {
  return `p_${Date.now()}_${crypto.randomUUID()}`;
}

export default function CoachEntry({ placement = "profile" }: { placement?: "dashboard" | "profile" }) {
  const router = useRouter();
  const { goal, saveGoal } = useCoachGoal();
  const { activateCoachPrograms } = useTrainingPrograms();
  const [open, setOpen] = useState(false);
  const [entitled, setEntitled] = useState(false);
  const [membershipLoaded, setMembershipLoaded] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);

  const handleCoachActivated = useCallback(() => {
    setEntitled(true);
    window.dispatchEvent(new Event("coach-entitlement-updated"));
    try {
      window.localStorage.setItem("coach-entitlement-updated", String(Date.now()));
    } catch {
      // Pembaruan entitlement tetap berlaku meski storage browser tidak tersedia.
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadMembership() {
      if (!supabase) { setMembershipLoaded(true); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) { if (active) setMembershipLoaded(true); return; }
      const { data } = await supabase.from("coach_entitlements").select("status,current_period_end").eq("user_id", user.id).maybeSingle();
      const isActive = data?.status === "active" && (!data.current_period_end || data.current_period_end > new Date().toISOString());
      if (active) setEntitled(Boolean(isActive));
      if (active) setMembershipLoaded(true);
    }
    void loadMembership();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!membershipLoaded) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("coach_payment") !== "return") return;
    const orderId = url.searchParams.get("orderId");
    if (!orderId) return;

    setReturnOrderId(orderId);
    setPaywallOpen(true);
    url.searchParams.delete("coach_payment");
    url.searchParams.delete("orderId");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [membershipLoaded]);

  async function acceptRecommendation(input: Parameters<typeof saveGoal>[0], recommendation: CoachProgramRecommendation): Promise<void> {
    if (!supabase) throw new Error("Coach memerlukan koneksi akun.");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) throw new Error("Sesi login berakhir. Silakan masuk kembali.");

    const previousProgramIds = goal?.programIds ?? [];
    const replacementIds = recommendation.programs.map(() => createCoachProgramId());
    const now = new Date().toISOString();
    const profile = {
      version: 1 as const,
      ...input,
      programId: replacementIds[0] ?? null,
      programIds: replacementIds,
      startedAt: goal?.startedAt ?? now,
      updatedAt: now,
    };

    const response = await fetch("/api/coach/program/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ profile, recommendation }),
    });
    let payload: { error?: string } = {};
    try {
      payload = await response.json() as { error?: string };
    } catch {
      // Respons non-JSON tetap ditampilkan sebagai kegagalan simpan umum.
    }
    if (!response.ok) {
      if (response.status === 401) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
      if (response.status === 403) throw new Error("Coach Premium tidak aktif. Program belum diterapkan.");
      throw new Error(payload.error === "recommendation_mismatch"
        ? "Rekomendasi berubah. Buat ulang program sebelum menerapkannya."
        : "Program belum tersimpan. Periksa koneksi lalu coba lagi.");
    }

    activateCoachPrograms(previousProgramIds, recommendation.programs, replacementIds);
    saveGoal(profile);
    router.push("/today");
  }

  return (
    <>
      {placement === "dashboard" ? (
        <button type="button" onClick={() => entitled ? setOpen(true) : setPaywallOpen(true)} aria-label={entitled ? "Buka Coach saya" : "Lihat Coach Premium"} title={entitled ? "Coach Saya" : "Coach Premium"} className="relative grid h-11 w-11 place-items-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-300 transition-colors hover:border-lime-300/60 hover:bg-lime-400/20 focus:outline-none focus:ring-2 focus:ring-lime-400/50">
          <CoachIcon id="coach" className="h-6 w-6" />
          <span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${entitled ? "bg-emerald-400" : "bg-lime-300"}`} />
        </button>
      ) : <section className="rounded-2xl border border-lime-400/25 bg-gradient-to-r from-gray-900 to-lime-950/40 p-4 shadow-lg shadow-black/10 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-lime-300">
            <CoachIcon id="coach" className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-lime-200 sm:text-lg">Coach Personal</h2>
            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${entitled ? "bg-emerald-400/10 text-emerald-300" : "bg-gray-800 text-gray-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${entitled ? "bg-emerald-400" : "bg-gray-500"}`} />
              {entitled ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <button type="button" onClick={() => entitled ? setOpen(true) : setPaywallOpen(true)} className="shrink-0 rounded-lg bg-lime-400 px-3 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-lime-300">
            {entitled ? "Kelola" : "Lihat Coach"}
          </button>
        </div>
      </section>}
      {membershipLoaded && <CoachPurchaseFlow open={paywallOpen} onClose={() => setPaywallOpen(false)} onActivated={handleCoachActivated} returnOrderId={returnOrderId} placement={placement} />}
      <CoachSheet open={open} goal={goal as CoachGoal | null} onClose={() => setOpen(false)} onUseRecommendation={acceptRecommendation} placement={placement} />
    </>
  );
}
