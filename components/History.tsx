"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { formatDate } from "@/lib/format";

export default function History() {
  const { workouts, isLoaded, removeWorkout } = useWorkouts();

  if (!isLoaded) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  if (workouts.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Histori Latihan</h1>
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">Belum ada latihan tercatat.</p>
          <p className="mt-1 text-sm text-gray-500">
            Yuk catat latihan pertamamu sekarang.
          </p>
          <Link
            href="/workout/new"
            className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            + Tambah Latihan
          </Link>
        </div>
      </section>
    );
  }

  const sorted = [...workouts].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

  const groups = new Map<string, typeof sorted>();
  for (const workout of sorted) {
    const list = groups.get(workout.date) ?? [];
    list.push(workout);
    groups.set(workout.date, list);
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus entri latihan ini?")) {
      removeWorkout(id);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Histori Latihan</h1>
          <p className="text-sm text-gray-400">{sorted.length} entri</p>
        </div>
        <Link
          href="/workout/new"
          className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300"
        >
          + Tambah
        </Link>
      </div>

      {[...groups.entries()].map(([date, entries]) => (
        <div key={date}>
          <h2 className="mb-2 text-sm font-semibold text-gray-500">
            {formatDate(date)}
          </h2>
          <ul className="space-y-2">
            {entries.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-100">{w.exercise}</p>
                  <p className="text-sm text-gray-400">
                    {w.weight} kg x {w.reps} rep x {w.sets} set
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="shrink-0 rounded-lg border border-red-900/60 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
