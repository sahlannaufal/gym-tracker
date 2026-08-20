"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";
import { requestSync } from "@/lib/sync";
import SyncStatus from "./SyncStatus";
import BodyCompositionPanel from "./BodyCompositionPanel";
import { resetMixpanel, trackEvent } from "@/lib/analytics";

export default function AccountPanel() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [syncBusy, setSyncBusy] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!logoutOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !logoutBusy) setLogoutOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [logoutBusy, logoutOpen]);

  if (!configured) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-gray-300">Sinkronisasi belum dikonfigurasi.</p>
        <p className="mt-1 text-sm text-gray-500">
          Isi variabel Supabase pada `.env.local` untuk mengaktifkan akun &
          sinkronisasi.
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <p className="text-gray-300">
          Kamu belum masuk. Dengan masuk, data tersinkronisasi lintas perangkat.
        </p>
        <p className="text-sm text-gray-500">
          Tanpa masuk app tetap berfungsi penuh, data hanya tersimpan di
          perangkat ini.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
        >
          Masuk / Daftar
        </Link>
      </div>
    );
  }

  const handleSync = () => {
    setSyncBusy(true);
    requestSync().finally(() => setSyncBusy(false));
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setLogoutBusy(true);
    setLogoutError("");
    const { error } = await supabase.auth.signOut();
    if (!error) {
      trackEvent("Logout Completed");
      resetMixpanel();
      setLogoutOpen(false);
      router.replace("/login");
    } else {
      setLogoutError("Gagal keluar. Periksa koneksi lalu coba lagi.");
      setLogoutBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Akun
          </p>
          <p className="mt-1 truncate font-semibold text-gray-100">
            {user.email ?? "Pengguna terhubung"}
          </p>
        </div>

        <SyncStatus onSync={handleSync} disabled={syncBusy} />
      </div>

      <BodyCompositionPanel userId={user.id} />

      <button
        type="button"
        onClick={() => {
          setLogoutError("");
          setLogoutOpen(true);
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/50 px-5 py-4 text-left text-sm font-semibold text-red-400 transition-colors hover:border-red-900/70 hover:bg-red-950/20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <span>Keluar dari akun</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        </svg>
      </button>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !logoutBusy) {
              setLogoutOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
            </div>
            <h2 id="logout-title" className="mt-4 text-lg font-bold text-gray-100">
              Keluar dari akun?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Data yang sudah tersinkronisasi tetap tersimpan. Data lokal pada perangkat ini tidak akan dihapus.
            </p>
            {logoutError && <p className="mt-3 text-sm text-red-400">{logoutError}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={logoutBusy}
                className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={logoutBusy}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:opacity-50"
              >
                {logoutBusy ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
