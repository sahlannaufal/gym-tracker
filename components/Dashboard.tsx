"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { useRoutine } from "@/lib/useRoutine";
import { WEEKDAYS } from "@/lib/types";
import type { Workout } from "@/lib/types";
import { currentWeekRange, formatDate } from "@/lib/format";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-bold text-gray-100">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { workouts, isLoaded } = useWorkouts();
  const { routine } = useRoutine();

  if (!isLoaded) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  if (workouts.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">
            Belum ada latihan tercatat.
          </p>
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

  const { monday, sunday } = currentWeekRange();
  const weekWorkouts = workouts.filter((w) => w.date >= monday && w.date <= sunday);
  const weekTotalSets = weekWorkouts.reduce((acc, w) => acc + w.sets, 0);

  const volumeByExercise = workouts.reduce<Record<string, number>>(
    (acc, w) => {
      const volume = w.weight * w.sets * w.reps;
      acc[w.exercise] = (acc[w.exercise] ?? 0) + volume;
      return acc;
    },
    {}
  );
  const [topExercise] = Object.entries(volumeByExercise).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const topMax = workouts.reduce<Workout | null>((best, w) => {
    if (w.exercise !== topExercise) return best;
    if (!best || w.weight > best.weight) return w;
    if (w.weight === best.weight && w.reps > best.reps) return w;
    return best;
  }, null);

  const lastWorkout = [...workouts].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  )[0];

  const todayCount = routine
    ? (routine.days[WEEKDAYS[new Date().getDay()]] ?? []).length
    : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-400">Ringkasan latihan kamu</p>
        </div>
        <Link
          href="/workout/new"
          className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300"
        >
          + Tambah Latihan
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-lime-500/40 bg-lime-400/10 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-lime-300">
            Latihan Hari Ini
          </p>
          <p className="mt-1 text-lg font-bold text-gray-100">
            {todayCount === 0 ? "Belum ada rutin" : `${todayCount} latihan`}
          </p>
        </div>
        <Link
          href={todayCount > 0 ? "/today" : "/today?view=rutin"}
          className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300"
        >
          {todayCount > 0 ? "Isi Sekarang" : "Set Latihan Harian"}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Workout"
          value={weekWorkouts.length}
          sub="Minggu ini"
        />
        <StatCard label="Total Set" value={weekTotalSets} sub="Minggu ini" />
        <StatCard
          label="Latihan Terbanyak"
          value={topExercise}
          sub={topMax ? `${topMax.weight} kg × ${topMax.reps} rep` : undefined}
        />
        <StatCard
          label="Workout Terakhir"
          value={lastWorkout.exercise}
          sub={`${lastWorkout.weight} kg - ${formatDate(lastWorkout.date)}`}
        />
      </div>
    </section>
  );
}
