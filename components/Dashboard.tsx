"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import type { TrainingProgramStore } from "@/lib/types";
import { currentWeekRange, formatDateShort, todayLocalISO } from "@/lib/format";
import { getExerciseMuscles } from "@/lib/constants/exerciseMuscles";
import ActivityHeatmap from "./ActivityHeatmap";
import MuscleBodyMap from "./MuscleBodyMap";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-100">{value}</p>
    </div>
  );
}

function LastTrainedCard({
  date,
  primaryMuscles,
  secondaryMuscles,
}: {
  date: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Terakhir Dilatih
        </p>
        <p className="shrink-0 text-xs text-gray-500">{date}</p>
      </div>

      <MuscleBodyMap
        primaryMuscles={primaryMuscles}
        secondaryMuscles={secondaryMuscles}
      />

      <div className="mt-4">
        <p className="text-xs text-gray-500">Otot utama</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {primaryMuscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-400 ring-1 ring-inset ring-lime-400/25"
            >
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {secondaryMuscles.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500">Otot pendukung</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {secondaryMuscles.map((muscle) => (
              <span
                key={muscle}
                className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-700"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TodayProgramCard({ store }: { store: TrainingProgramStore | null }) {
  const assignment = store?.schedule[todayLocalISO()];
  const program = assignment?.programId
    ? store?.programs.find((item) => item.id === assignment.programId)
    : undefined;
  const label = !assignment
    ? null
    : assignment.programId === null
      ? "Rest Day"
      : program
        ? program.name
        : "Program tidak ditemukan";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-lime-500/40 bg-lime-400/10 p-5">
      <div className="flex min-w-0 items-center gap-2">
        <p className="shrink-0 text-sm font-semibold text-lime-300">Latihan Hari Ini</p>
        {label && (
          <>
            <span className="text-gray-600">·</span>
            <p className="truncate text-sm font-bold text-gray-100">{label}</p>
          </>
        )}
      </div>
      <Link href="/today" className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300">
        {assignment ? "Buka" : "Pilih Program"}
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { workouts, isLoaded } = useWorkouts();
  const { store } = useTrainingPrograms();

  if (!isLoaded) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  if (workouts.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <TodayProgramCard store={store} />
        <ActivityHeatmap workouts={workouts} />
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">
            Belum ada latihan tercatat.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Yuk catat latihan pertamamu sekarang.
          </p>
        </div>
      </section>
    );
  }

  const { monday, sunday } = currentWeekRange();
  const today = todayLocalISO();
  const actualWorkouts = workouts.filter((workout) => workout.date <= today);
  const weekWorkouts = actualWorkouts.filter((w) => w.date >= monday && w.date <= sunday);
  const weekSessions = new Set(weekWorkouts.map((workout) => workout.date)).size;
  const weekTotalSets = weekWorkouts.reduce((acc, w) => acc + w.sets, 0);

  const lastTrainingDate = actualWorkouts.reduce(
    (latest, workout) => (workout.date > latest ? workout.date : latest),
    "",
  );
  const lastDayWorkouts = actualWorkouts.filter(
    (workout) => workout.date === lastTrainingDate,
  );
  const primaryMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();
  for (const workout of lastDayWorkouts) {
    const metadata = getExerciseMuscles(workout.exercise);
    metadata.primaryMuscles.forEach((muscle) => primaryMuscles.add(muscle));
    metadata.secondaryMuscles.forEach((muscle) => {
      if (!primaryMuscles.has(muscle)) secondaryMuscles.add(muscle);
    });
  }
  const primaryMuscleList = [...primaryMuscles];
  const secondaryMuscleList = [...secondaryMuscles].filter(
    (muscle) => !primaryMuscles.has(muscle),
  );
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <TodayProgramCard store={store} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Sesi Minggu Ini" value={weekSessions} />
        <StatCard label="Set Minggu Ini" value={weekTotalSets} />
      </div>

      <ActivityHeatmap workouts={actualWorkouts} />

      {lastTrainingDate && (
        <LastTrainedCard
          date={formatDateShort(lastTrainingDate)}
          primaryMuscles={primaryMuscleList.length > 0 ? primaryMuscleList : ["Lainnya"]}
          secondaryMuscles={secondaryMuscleList}
        />
      )}
    </section>
  );
}
