"use client";

import { useEffect, useState } from "react";
import TodayWorkout from "./TodayWorkout";
import RoutineEditor from "./RoutineEditor";

type View = "latihan" | "program";

export default function TodayPage({ initialView = "latihan" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

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
          onClick={() => setView("latihan")}
          className={segClass(view === "latihan")}
        >
          Latihan
        </button>
        <button
          type="button"
          onClick={() => setView("program")}
          className={segClass(view === "program")}
        >
          Program
        </button>
      </div>

      {view === "latihan" ? (
        <TodayWorkout onOpenPrograms={() => setView("program")} />
      ) : (
        <RoutineEditor />
      )}
    </section>
  );
}
