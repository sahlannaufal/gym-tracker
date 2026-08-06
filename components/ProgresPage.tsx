"use client";

import { useState } from "react";
import History from "./History";
import Progress from "./Progress";

type Tab = "riwayat" | "grafik";

export default function ProgresPage() {
  const [tab, setTab] = useState<Tab>("riwayat");

  const segClass = (active: boolean) =>
    `flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-lime-400 text-gray-950"
        : "text-gray-400 hover:text-gray-200"
    }`;

  return (
    <section className="space-y-6">
      <div className="flex rounded-xl border border-gray-800 bg-gray-900/50 p-1">
        <button
          type="button"
          onClick={() => setTab("riwayat")}
          className={segClass(tab === "riwayat")}
        >
          Riwayat
        </button>
        <button
          type="button"
          onClick={() => setTab("grafik")}
          className={segClass(tab === "grafik")}
        >
          Grafik
        </button>
      </div>

      {tab === "riwayat" ? <History /> : <Progress />}
    </section>
  );
}
