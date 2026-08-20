"use client";

import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import type { TrainingProgramStore, Workout } from "@/lib/types";
import { currentWeekRange, formatDateShort, todayLocalISO } from "@/lib/format";
import { getExerciseMuscles } from "@/lib/constants/exerciseMuscles";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-100">{value}</p>
    </div>
  );
}

function DetailCard({
  label,
  date,
  title,
  detail,
  badge,
}: {
  label: string;
  date?: string;
  title: string;
  detail: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          {badge && (
            <span className="rounded-md bg-lime-400/15 px-1.5 py-0.5 text-[10px] font-bold text-lime-400">
              {badge}
            </span>
          )}
        </div>
        {date && <p className="shrink-0 text-xs text-gray-500">{date}</p>}
      </div>
      <p className="mt-2 text-lg font-bold leading-snug text-gray-100 [overflow-wrap:anywhere]">{title}</p>
      <p className="mt-1 text-sm leading-5 text-gray-400">{detail}</p>
    </div>
  );
}

function TodayProgramCard({ store }: { store: TrainingProgramStore | null }) {
  const assignment = store?.schedule[todayLocalISO()];
  const program = assignment?.programId
    ? store?.programs.find((item) => item.id === assignment.programId)
    : undefined;
  const label = !assignment
    ? "Belum memilih program"
    : assignment.programId === null
      ? "Rest Day"
      : program
        ? `${program.name} · ${program.exercises.length} latihan`
        : "Program tidak ditemukan";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-lime-500/40 bg-lime-400/10 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-lime-300">Latihan Hari Ini</p>
        <p className="mt-1 text-lg font-bold text-gray-100">{label}</p>
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
  const today = todayLocalISO();
  const actualWorkouts = workouts.filter((workout) => workout.date <= today);
  const weekWorkouts = actualWorkouts.filter((w) => w.date >= monday && w.date <= sunday);
  const weekSessions = new Set(weekWorkouts.map((workout) => workout.date)).size;
  const weekTotalSets = weekWorkouts.reduce((acc, w) => acc + w.sets, 0);

  const personalBest = actualWorkouts.reduce<Workout | null>((best, w) => {
    if (!best || w.weight > best.weight) return w;
    if (w.weight === best.weight && w.reps > best.reps) return w;
    if (w.weight === best.weight && w.reps === best.reps && w.date > best.date) return w;
    return best;
  }, null);

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
  const allMuscles = [...primaryMuscles, ...secondaryMuscles].filter(
    (muscle, index, list) => list.indexOf(muscle) === index,
  );
  const visibleMuscles = allMuscles.slice(0, 3);
  const remainingMuscles = allMuscles.length - visibleMuscles.length;
  const muscleSummary = `${visibleMuscles.join(" · ")}${
    remainingMuscles > 0 ? ` · +${remainingMuscles} lainnya` : ""
  }`;
  const uniqueExercises = new Set(lastDayWorkouts.map((workout) => workout.exercise)).size;
  const lastDaySets = lastDayWorkouts.reduce((sum, workout) => sum + workout.sets, 0);

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

      <TodayProgramCard store={store} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Sesi Minggu Ini" value={weekSessions} />
        <StatCard label="Set Minggu Ini" value={weekTotalSets} />
      </div>

      {personalBest && (
        <DetailCard
          label="Personal Best"
          badge="PB"
          date={formatDateShort(personalBest.date)}
          title={personalBest.exercise}
          detail={`${personalBest.weight} kg · ${personalBest.reps} repetisi · ${personalBest.sets} set`}
        />
      )}

      {lastTrainingDate && (
        <DetailCard
          label="Terakhir Dilatih"
          date={formatDateShort(lastTrainingDate)}
          title={muscleSummary || "Lainnya"}
          detail={`${uniqueExercises} latihan · ${lastDaySets} set`}
        />
      )}
    </section>
  );
}
