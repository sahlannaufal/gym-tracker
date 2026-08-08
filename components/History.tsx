"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { formatDate } from "@/lib/format";

export default function History() {
  const { workouts, isLoaded, removeWorkout } = useWorkouts();
  const [filter, setFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const exercises = [...new Set(workouts.map((w) => w.exercise))].sort();
  const invalidRange = dateFrom !== "" && dateTo !== "" && dateFrom > dateTo;

  const visible = workouts.filter((w) => {
    if (filter !== "all" && w.exercise !== filter) return false;
    if (dateFrom && w.date < dateFrom) return false;
    if (dateTo && w.date > dateTo) return false;
    return true;
  });

  const sorted = [...visible].sort(
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

  const selectClass =
    "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
    "focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

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

      <div className="space-y-3">
        <div className="max-w-xs">
          <label
            htmlFor="exerciseFilter"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Pilih Latihan
          </label>
          <select
            id="exerciseFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Semua Latihan</option>
            {exercises.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-0 sm:max-w-md">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">
              Dari Tanggal
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${selectClass} min-w-0`}
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">
              Sampai Tanggal
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${selectClass} min-w-0`}
            />
          </label>
        </div>

        {invalidRange && (
          <p className="text-sm text-red-400">
            Rentang tanggal tidak valid (Dari lebih baru dari Sampai).
          </p>
        )}
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-gray-500">
          Tidak ada entri untuk filter ini.
        </p>
      )}

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
