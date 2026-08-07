"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { isSyncConfigured, supabase } from "@/lib/supabase/client";
import { requestSync } from "@/lib/sync";
import SyncStatus from "./SyncStatus";

export default function AccountPanel() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    requestSync().finally(() => setBusy(false));
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Akun
        </p>
        <p className="mt-1 font-semibold text-gray-100">
          {user.email ?? "Pengguna terhubung"}
        </p>
      </div>

      <SyncStatus />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSync}
          disabled={busy}
          className="rounded-xl border border-lime-400/50 px-5 py-2.5 text-sm font-semibold text-lime-400 transition-colors hover:bg-lime-400 hover:text-gray-950 disabled:opacity-50"
        >
          {busy ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
        </button>
        <button
          onClick={handleSignOut}
          className="rounded-xl border border-red-900/60 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-950/50"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
