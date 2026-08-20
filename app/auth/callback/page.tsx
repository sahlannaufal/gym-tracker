"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";

type CallbackState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

// Baca parameter dari hash fragment, mis. #access_token=...&error=...
function readHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.slice(1));
}

// Cek apakah URL semula memuat token verifikasi (sebelum dibersihkan SDK).
function hadAuthTokenInUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hashParams = readHashParams();
  const searchParams = new URLSearchParams(window.location.search);
  return ["access_token", "refresh_token", "code", "token_hash", "error"].some(
    (key) => hashParams.has(key) || searchParams.has(key)
  );
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function verify() {
      // Error dari server (mis. otp_expired) tampil langsung — fragment error
      // tidak dibersihkan oleh SDK sehingga aman dibaca di sini.
      const hashParams = readHashParams();
      const urlError = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");
      if (urlError) {
        if (active) {
          setState({
            status: "error",
            message:
              decodeURIComponent(errorDescription ?? urlError) ||
              "Link verifikasi tidak valid.",
          });
        }
        return;
      }

      // getSession() menunggu initialize() yang sudah menjalankan deteksi token
      // dari URL (detectSessionInUrl), jadi hasilnya pasti urut & akurat.
      const { data } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };

      if (!active) return;

      if (data.session) {
        setState({ status: "success" });
        window.setTimeout(() => router.replace("/"), 1200);
      } else if (hadAuthTokenInUrl()) {
        setState({
          status: "error",
          message:
            "Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan daftar ulang untuk mengirim email baru.",
        });
      } else {
        setState({
          status: "error",
          message: "Link verifikasi tidak valid. Buka link dari email kamu.",
        });
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      {state.status === "loading" && (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
          <p className="text-gray-300">Memverifikasi email...</p>
        </>
      )}

      {state.status === "success" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-2xl font-bold text-gray-950">
            ✓
          </div>
          <p className="text-lg font-semibold text-gray-100">
            Email berhasil diverifikasi!
          </p>
          <p className="text-sm text-gray-400">
            Mengalihkan ke beranda...
          </p>
        </>
      )}

      {state.status === "error" && (
        <div className="w-full space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <p className="text-lg font-semibold text-red-400">
            Verifikasi gagal
          </p>
          <p className="text-sm text-gray-300">{state.message}</p>
          {isSyncConfigured() && (
            <Link
              href="/login"
              className="inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
            >
              Kembali ke Masuk / Daftar
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
