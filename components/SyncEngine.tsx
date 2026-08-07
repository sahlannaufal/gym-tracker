"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { requestSync, setSyncUser } from "@/lib/sync";

/**
 * Latar belakang sinkronisasi global: trigger saat login/logout,
 * saat koneksi kembali online, dan saat window mendapat fokus.
 * Tidak merender apa pun.
 */
export default function SyncEngine() {
  useEffect(() => {
    if (!supabase) return;

    const onOnline = () => requestSync();
    const onFocus = () => requestSync();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSyncUser(session?.user?.id ?? null);
      if (session?.user) requestSync();
    });

    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onFocus);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
