"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";
import { requestSync } from "@/lib/sync";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSyncConfigured()) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-gray-300">Sinkronisasi belum dikonfigurasi.</p>
        <p className="mt-1 text-sm text-gray-500">
          Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pada file `.env.local`.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        // Konfirmasi email nonaktif -> signUp sudah mengembalikan session,
        // langsung login tanpa perlu membuka link verifikasi.
        if (data.session) {
          requestSync();
          router.push("/account");
          return;
        }

        setNotice(
          "Akun berhasil dibuat. Silakan klik link aktivasi yang dikirim ke email kamu untuk mengaktifkan akun, lalu masuk."
        );
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        requestSync();
        router.push("/account");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal masuk, coba lagi."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5"
    >
      <div className="flex rounded-xl border border-gray-800 bg-gray-950 p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              setNotice("");
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === m
                ? "bg-lime-400 text-gray-950"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {m === "login" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-300">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-300">
          Password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {notice && <p className="text-sm text-lime-400">{notice}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
      >
        {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Tanpa akun, app tetap bisa dipakai — data hanya tersimpan di perangkat
        ini.
      </p>
    </form>
  );
}
