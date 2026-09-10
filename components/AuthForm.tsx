"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";
import { requestSync } from "@/lib/sync";
import { identifyAndSetUser, trackEvent } from "@/lib/analytics";
import { consumeOAuthIntent, saveOAuthIntent } from "@/lib/oauthIntent";
import { consumeMarketingAttribution } from "@/lib/marketingAttribution";
import PasswordInput from "./PasswordInput";

function normalizeLoginFailure(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return "invalid_credentials";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "network_error";
  }
  if (message.includes("password") || message.includes("email")) {
    return "validation_error";
  }
  return "server_error";
}

function normalizeRegistrationFailure(error: unknown): string {
  const authError = error as { code?: string; message?: string } | null;
  const code = authError?.code?.toLowerCase() ?? "";
  const message = authError?.message?.toLowerCase() ?? "";
  const detail = `${code} ${message}`;

  if (detail.includes("rate") || detail.includes("too many")) return "rate_limited";
  if (detail.includes("already") || detail.includes("exists")) return "account_already_exists";
  if (detail.includes("weak") || detail.includes("password")) return "invalid_password";
  if (detail.includes("email")) return "invalid_email";
  if (detail.includes("network") || detail.includes("fetch")) return "network_error";
  return "server_error";
}

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
  const [signupSubmitted, setSignupSubmitted] = useState(false);

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

        // Supabase dapat mengembalikan user tersamarkan tanpa identities untuk
        // email yang sudah terdaftar agar status akun tidak bocor ke UI.
        const existingAccount = data.user?.identities?.length === 0;
        const attribution = existingAccount ? {} : consumeMarketingAttribution();
        if (existingAccount) {
          trackEvent("Registration Failed", {
            registration_method: "email_password",
            failed_reason: "account_already_exists",
          });
        } else {
          if (data.user) identifyAndSetUser(data.user);
          trackEvent("Registration Completed", {
            registration_method: "email_password",
            verification_required: !data.session,
            ...attribution,
          });
        }

        // Konfirmasi email nonaktif -> signUp sudah mengembalikan session,
        // langsung login tanpa perlu membuka link verifikasi.
        if (data.session) {
          identifyAndSetUser(data.session.user);
          trackEvent("Login Completed", { login_method: "email_password", ...attribution });
          requestSync();
          router.replace("/");
          return;
        }

        setNotice(
          "Akun berhasil dibuat. Silakan klik link aktivasi yang dikirim ke email kamu."
        );
        setSignupSubmitted(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const attribution = consumeMarketingAttribution();
        identifyAndSetUser(data.user);
        trackEvent("Login Completed", { login_method: "email_password", ...attribution });
        requestSync();
        router.replace("/");
      }
    } catch (err) {
      if (mode === "login") {
        trackEvent("Login Failed", {
          login_method: "email_password",
          failed_reason: normalizeLoginFailure(err),
        });
      } else {
        trackEvent("Registration Failed", {
          registration_method: "email_password",
          failed_reason: normalizeRegistrationFailure(err),
        });
      }
      setError(
        err instanceof Error ? err.message : "Gagal masuk, coba lagi."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");

    const action = mode;
    saveOAuthIntent({ provider: "google", action, startedAt: Date.now() });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      consumeOAuthIntent();
      if (action === "login") {
        trackEvent("Login Failed", {
          login_method: "google",
          failed_reason: normalizeLoginFailure(err),
        });
      } else {
        trackEvent("Registration Failed", {
          registration_method: "google",
          failed_reason: normalizeRegistrationFailure(err),
        });
      }
      setError(err instanceof Error ? err.message : "Gagal terhubung ke Google. Coba lagi.");
      setBusy(false);
    }
  };

  if (signupSubmitted) {
    return (
      <div className="space-y-4 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-2xl font-bold text-gray-950">
          ✓
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Cek email kamu</h2>
          <p className="mt-2 text-sm text-gray-400">
            Link aktivasi sudah dikirim ke <span className="font-medium text-gray-200">{email}</span>.
            Buka link tersebut untuk mengaktifkan akun dan masuk ke aplikasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSignupSubmitted(false);
            setMode("login");
            setNotice("");
            setPassword("");
          }}
          className="text-sm font-semibold text-lime-400 hover:text-lime-300"
        >
          Sudah aktivasi? Masuk
        </button>
      </div>
    );
  }

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

      <PasswordInput
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        action={
          mode === "login" ? (
            <Link href="/forgot-password" className="text-xs font-semibold text-lime-400 hover:text-lime-300">
              Lupa password?
            </Link>
          ) : undefined
        }
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      {notice && <p className="text-sm text-lime-400">{notice}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
      >
        {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
      </button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-800" />
        <span className="text-xs font-medium text-gray-500">Atau</span>
        <span className="h-px flex-1 bg-gray-800" />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={handleGoogleAuth}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-white px-5 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.97-3.39.97-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.49l3.35-2.62Z" />
          <path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z" />
        </svg>
        {mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Masuk untuk mengakses dan menyinkronkan data latihanmu.
      </p>
    </form>
  );
}
