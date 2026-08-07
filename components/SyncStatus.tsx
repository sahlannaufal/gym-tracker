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

export default function SyncStatus() {
  const [status, setStatus] = useState<SyncStatusType>(getSyncStatus());

  useEffect(() => subscribeSyncStatus(setStatus), []);

  const lastSync = formatLastSync(status.lastSync);

  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-400">
      <span
        className={`h-2 w-2 rounded-full ${DOT_COLOR[status.state]}`}
        aria-hidden
      />
      {LABELS[status.state]}
      {lastSync && ` · ${lastSync}`}
    </span>
  );
}
