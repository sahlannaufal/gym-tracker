"use client";

import { useState } from "react";
import Link from "next/link";
import { useRoutine } from "@/lib/useRoutine";
import { useWorkouts } from "@/lib/useWorkouts";
import { DAY_LABELS } from "@/lib/types";
import { formatDate, todayLocalISO, weekdayFromISO } from "@/lib/format";
import type { Workout } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ExerciseCard({
  name,
  entries,
  onDelete,
}: {
  name: string;
  entries: Workout[];
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const totalSets = entries.reduce((sum, w) => sum + w.sets, 0);

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus entri latihan ini?")) {
      onDelete(id);
    }
  };

  return (
    <li className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-100">{name}</p>
          {totalSets > 0 && (
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-xs font-medium text-lime-400">
              {totalSets}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/workout/new?exercise=${encodeURIComponent(name)}`}
            className="rounded-xl border border-lime-400/50 px-3 py-2 text-sm font-semibold text-lime-400 transition-colors hover:bg-lime-400 hover:text-gray-950"
          >
            Catat Latihan
          </Link>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={`Riwayat ${name}`}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white ${
              open ? "rotate-180" : ""
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada catatan latihan untuk hari ini.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {[...entries]
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-gray-950/60 px-3 py-2 text-sm"
                  >
                    <p className="text-gray-300">
                      <span className="mr-2 text-xs text-gray-500">
                        {formatTime(w.createdAt)}
                      </span>
                      {w.weight} kg × {w.reps} rep × {w.sets} set
                    </p>
                    <button
                      onClick={() => handleDelete(w.id)}
                      aria-label={`Hapus entri ${name}`}
                      className="shrink-0 text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export default function TodayWorkout({
  onOpenRoutine,
}: {
  onOpenRoutine: () => void;
}) {
  const { routine } = useRoutine();
  const { workouts, removeWorkout } = useWorkouts();
  const [date, setDate] = useState(todayLocalISO());
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!routine) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  const day = weekdayFromISO(date);
  const exercises = routine.days[day] ?? [];

  const entriesFor = (name: string) =>
    workouts.filter((w) => w.exercise === name && w.date === date);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Latihan Hari Ini</h1>
        <p className="mt-2 text-gray-400">
          {DAY_LABELS[day]}, {formatDate(date)}
        </p>
      </div>

      <label className="block max-w-xs">
        <span className="mb-1 block text-sm text-gray-400">Pilih Tanggal</span>
        <input
          type="date"
          value={date}
          max={todayLocalISO()}
          onChange={(e) => {
            setDate(e.target.value || todayLocalISO());
            setExpanded(null);
          }}
          className={inputClass}
        />
      </label>

      {exercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">
            Belum ada rutin untuk {DAY_LABELS[day]}.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Atur jadwal mingguanmu supaya konsisten.
          </p>
          <button
            type="button"
            onClick={onOpenRoutine}
            className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            Set Latihan Harian
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {exercises.map((name) => (
            <ExerciseCard
              key={name}
              name={name}
              entries={entriesFor(name)}
              onDelete={removeWorkout}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
