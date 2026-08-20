"use client";

import { useEffect, useState } from "react";
import {
  getSyncStatus,
  subscribeSyncStatus,
  type SyncStatus as SyncStatusType,
} from "@/lib/sync";

const LABELS: Record<SyncStatusType["state"], string> = {
  unconfigured: "Sinkronisasi belum diatur",
  idle: "Belum tersinkron",
  syncing: "Menyinkronkan...",
  synced: "Tersinkron",
  error: "Sinkron gagal",
};

const DOT_COLOR: Record<SyncStatusType["state"], string> = {
  unconfigured: "bg-gray-500",
  idle: "bg-amber-400",
  syncing: "bg-sky-400",
  synced: "bg-lime-400",
  error: "bg-red-400",
};

function formatLastSync(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso);
  return `${t.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })} ${t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function SyncStatus({
  onSync,
  disabled = false,
}: {
  onSync: () => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<SyncStatusType>(getSyncStatus());

  useEffect(() => subscribeSyncStatus(setStatus), []);

  const lastSync = formatLastSync(status.lastSync);

  const syncing = status.state === "syncing";

  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-800 pt-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Status sinkronisasi
        </p>
        <p
          className="mt-1 flex items-center gap-2 truncate text-sm text-gray-300"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[status.state]}`}
            aria-hidden
          />
          <span className="truncate">
            {LABELS[status.state]}
            {lastSync && ` · ${lastSync}`}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onSync}
        disabled={disabled || syncing}
        aria-label={syncing ? "Sedang menyinkronkan" : "Sinkronkan sekarang"}
        title={syncing ? "Sedang menyinkronkan" : "Sinkronkan sekarang"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-700 text-gray-300 transition-colors hover:border-lime-400/60 hover:bg-lime-400/10 hover:text-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`}
          aria-hidden
        >
          <path d="M20 7h-5V2" />
          <path d="M4 17h5v5" />
          <path d="M5.1 9a8 8 0 0 1 13.2-3L20 7" />
          <path d="M18.9 15a8 8 0 0 1-13.2 3L4 17" />
        </svg>
      </button>
    </div>
  );
}
