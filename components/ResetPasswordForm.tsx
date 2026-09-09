"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import PasswordInput from "./PasswordInput";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setState("invalid");
      return;
    }

    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const search = new URLSearchParams(window.location.search);
    const urlError = hash.get("error") ?? search.get("error");
    if (urlError) {
      setState("invalid");
      return;
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) setState("ready");
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState(data.session ? "ready" : "invalid");
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return <div className="py-14 text-center text-sm text-gray-400">Memeriksa link pemulihan...</div>;
  }

  if (state === "invalid") {
    return (
      <div className="space-y-4 rounded-2xl border border-red-900/60 bg-red-950/20 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-300">Link tidak valid atau kedaluwarsa</h2>
        <p className="text-sm leading-6 text-gray-400">Minta link reset password yang baru untuk melanjutkan.</p>
        <Link href="/forgot-password" className="inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 hover:bg-lime-300">Minta Link Baru</Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-3 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-2xl font-bold text-gray-950">✓</div>
        <h2 className="text-lg font-semibold">Password berhasil diperbarui</h2>
        <p className="text-sm text-gray-400">Mengalihkan ke aplikasi...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        if (password.length < 6) return setError("Password minimal 6 karakter.");
        if (password !== confirmation) return setError("Konfirmasi password tidak sama.");
        if (!supabase) return setState("invalid");

        setBusy(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          trackEvent("Password Reset Failed", { failed_reason: "update_failed" });
          setError("Password belum dapat diperbarui. Minta link baru lalu coba lagi.");
          setBusy(false);
          return;
        }

        trackEvent("Password Reset Completed", { reset_method: "email" });
        setState("success");
        window.setTimeout(() => router.replace("/"), 1200);
      }}
      className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5"
    >
      <PasswordInput label="Password baru" value={password} onChange={setPassword} autoComplete="new-password" />
      <PasswordInput label="Konfirmasi password baru" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 hover:bg-lime-300 disabled:opacity-50">
        {busy ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
