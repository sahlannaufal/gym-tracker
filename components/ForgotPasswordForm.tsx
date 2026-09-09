"use client";

import Link from "next/link";
import { useState } from "react";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

function failureReason(error: unknown): string {
  const detail = error instanceof Error ? error.message.toLowerCase() : "";
  if (detail.includes("rate") || detail.includes("too many")) return "rate_limited";
  if (detail.includes("network") || detail.includes("fetch")) return "network_error";
  if (detail.includes("email")) return "invalid_email";
  return "server_error";
}

export default function ForgotPasswordForm() {
  const authClient = supabase;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!isSyncConfigured() || !authClient) {
    return <p className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">Layanan akun belum dikonfigurasi.</p>;
  }

  if (sent) {
    return (
      <div className="space-y-4 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-2xl font-bold text-gray-950">✓</div>
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Periksa email kamu</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Jika email tersebut terdaftar, link untuk membuat password baru akan segera dikirim.
          </p>
        </div>
        <button type="button" onClick={() => { setSent(false); setError(""); }} className="block w-full text-sm font-semibold text-lime-400 hover:text-lime-300">
          Kirim ulang atau gunakan email lain
        </button>
        <Link href="/login" className="inline-block text-sm text-gray-400 hover:text-gray-200">Kembali ke halaman masuk</Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          const { error: requestError } = await authClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          if (requestError) throw requestError;
          trackEvent("Password Reset Requested", { reset_method: "email" });
          setSent(true);
        } catch (requestError) {
          trackEvent("Password Reset Request Failed", {
            reset_method: "email",
            failed_reason: failureReason(requestError),
          });
          setError(
            failureReason(requestError) === "rate_limited"
              ? "Terlalu banyak permintaan email. Tunggu beberapa saat lalu coba lagi."
              : "Email reset belum dapat dikirim. Periksa koneksi lalu coba lagi.",
          );
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-300">Email akun</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required autoComplete="email" className={inputClass} />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 hover:bg-lime-300 disabled:opacity-50">
        {busy ? "Mengirim..." : "Kirim Link Reset"}
      </button>
      <Link href="/login" className="block text-center text-sm text-gray-400 hover:text-gray-200">Kembali ke halaman masuk</Link>
    </form>
  );
}
