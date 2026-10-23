"use client";

import { useEffect, useRef, useState } from "react";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import { useWorkouts } from "@/lib/useWorkouts";
import { useCoachGoal } from "@/lib/useCoachGoal";
import { DAY_LABELS } from "@/lib/types";
import { formatDate, todayLocalISO, weekdayFromISO } from "@/lib/format";
import type { Workout, WorkoutInput } from "@/lib/types";
import FloatingRestTimer from "./FloatingRestTimer";
import ExerciseTutorialModal from "./ExerciseTutorialModal";
import TemporaryExerciseSwapSheet from "./TemporaryExerciseSwapSheet";
import type { ExerciseCatalogItem } from "@/lib/exerciseCatalog";
import type { WorkoutTrackingContext } from "@/lib/useWorkouts";
import { trackEvent } from "@/lib/analytics";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

type SetRow = {
  key: string;
  workoutId?: string;
  weight: string;
  reps: string;
};

type TemporaryExerciseSwap = {
  originalName: string;
  originalId: string | null;
  replacementName: string;
  replacementId: string;
};

const TEMPORARY_SWAP_STORAGE_KEY = "gym_tracker_coach_temporary_swaps_v1";

function ExerciseCard({
  name,
  entries,
  lastWorkout,
  date,
  onAdd,
  onUpdate,
  onDelete,
  onStartRest,
  onOpenTutorial,
  exerciseId,
  showTemporarySwap,
  isTemporarySwap,
  canTemporarySwap,
  onTemporarySwap,
}: {
  name: string;
  entries: Workout[];
  lastWorkout?: Workout;
  date: string;
  onAdd: (input: WorkoutInput, context?: WorkoutTrackingContext) => Workout;
  onUpdate: (
    id: string,
    changes: Pick<Workout, "weight" | "reps">,
  ) => Workout | null;
  onDelete: (id: string) => void;
  onStartRest: (exercise: string) => void;
  onOpenTutorial: (exercise: string, exerciseId?: string | null) => void;
  exerciseId?: string | null;
  showTemporarySwap: boolean;
  isTemporarySwap: boolean;
  canTemporarySwap: boolean;
  onTemporarySwap: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<SetRow[]>([]);
  const [error, setError] = useState("");
  const entriesKey = entries
    .map((entry) => `${entry.id}:${entry.updatedAt ?? entry.createdAt}`)
    .join("|");

  useEffect(() => {
    const savedRows = [...entries]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((entry) => ({
        key: entry.id,
        workoutId: entry.id,
        weight: String(entry.weight),
        reps: String(entry.reps),
      }));

    setRows(
      savedRows.length > 0
        ? savedRows
        : [
            {
              key: `draft-${date}-${name}`,
              weight: lastWorkout ? String(lastWorkout.weight) : "",
              reps: lastWorkout ? String(lastWorkout.reps) : "",
            },
          ],
    );
    setError("");
  }, [date, name, entriesKey, lastWorkout?.id, lastWorkout?.weight, lastWorkout?.reps]);

  const totalSets = entries.reduce((sum, workout) => sum + workout.sets, 0);

  const valuesFor = (row: SetRow) => {
    const weight = Number(row.weight);
    const reps = Number(row.reps);
    return {
      weight,
      reps,
      valid:
        Number.isFinite(weight) &&
        weight > 0 &&
        Number.isInteger(reps) &&
        reps > 0,
    };
  };

  const persistRow = (row: SetRow): Workout | null => {
    const values = valuesFor(row);
    if (!values.valid) {
      setError("Beban dan repetisi harus lebih dari 0.");
      return null;
    }

    setError("");
    if (row.workoutId) {
      return onUpdate(row.workoutId, {
        weight: values.weight,
        reps: values.reps,
      });
    }

    const saved = onAdd(
      {
        exercise: name,
        weight: values.weight,
        reps: values.reps,
        sets: 1,
        date,
      },
      {
        inputMethod: "quick_log",
        prefilledFromLastSession: Boolean(lastWorkout),
      },
    );
    setRows((current) =>
      current.map((item) =>
        item.key === row.key
          ? { ...item, key: saved.id, workoutId: saved.id }
          : item,
      ),
    );
    return saved;
  };

  const updateRow = (key: string, field: "weight" | "reps", value: string) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
    setError("");
  };

  const addRow = () => {
    const previous = rows.at(-1);
    if (!previous) return;

    const savedPrevious = persistRow(previous);
    if (!savedPrevious) return;

    const added = onAdd(
      {
        exercise: name,
        weight: savedPrevious.weight,
        reps: savedPrevious.reps,
        sets: 1,
        date,
      },
      {
        inputMethod: "quick_log",
        prefilledFromLastSession: Boolean(lastWorkout),
      },
    );
    setRows((current) => [
      ...current.map((row) =>
        row.key === previous.key
          ? { ...row, key: savedPrevious.id, workoutId: savedPrevious.id }
          : row,
      ),
      {
        key: added.id,
        workoutId: added.id,
        weight: String(added.weight),
        reps: String(added.reps),
      },
    ]);
  };

  const removeRow = (row: SetRow) => {
    if (row.workoutId) {
      if (!window.confirm(`Hapus set latihan ${name} ini?`)) return;
      onDelete(row.workoutId);
    }

    setRows((current) => {
      const remaining = current.filter((item) => item.key !== row.key);
      return remaining.length > 0
        ? remaining
        : [{ key: `draft-${Date.now()}`, weight: "", reps: "" }];
    });
  };

  return (
    <li className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <p className="truncate font-semibold text-gray-100">{name}</p>
          {isTemporarySwap && <span className="shrink-0 rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-semibold text-lime-200">Sementara</span>}
          {totalSets > 0 && (
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-xs font-medium text-lime-400">
              {totalSets}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onOpenTutorial(name, exerciseId)}
          aria-label={`Buka tutorial ${name}`}
          title={`Tutorial ${name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400 hover:bg-lime-400/20"
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
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        {showTemporarySwap && (
          <button
            type="button"
            onClick={onTemporarySwap}
            disabled={!canTemporarySwap}
            aria-label={`Ganti ${name} sementara untuk hari ini`}
            title={canTemporarySwap ? "Ganti sementara hari ini" : "Gerakan sudah dicatat hari ini"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-40 ${isTemporarySwap ? "border-lime-400/50 bg-lime-400/10 text-lime-300" : "border-gray-700 text-gray-400 hover:border-lime-400/50 hover:text-lime-300"}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={`${open ? "Tutup" : "Buka"} catatan ${name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-700 text-gray-400"
        >
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          <div className="grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <span>Set</span>
            <span>Kg</span>
            <span>Reps</span>
            <span />
          </div>

          <div className="mt-2 space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.key}
                className="grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2 rounded-xl bg-gray-950/60 p-2"
              >
                <span className="text-center font-semibold text-gray-300">
                  {index + 1}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.1"
                  value={row.weight}
                  onChange={(event) => updateRow(row.key, "weight", event.target.value)}
                  onBlur={() => persistRow(row)}
                  aria-label={`Beban set ${index + 1}`}
                  placeholder="0"
                  className="min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-center text-gray-100 focus:border-lime-400 focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={row.reps}
                  onChange={(event) => updateRow(row.key, "reps", event.target.value)}
                  onBlur={() => persistRow(row)}
                  aria-label={`Repetisi set ${index + 1}`}
                  placeholder="0"
                  className="min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-center text-gray-100 focus:border-lime-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row)}
                  aria-label={`Hapus set ${index + 1}`}
                  className="text-xl text-gray-500 transition-colors hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 w-full rounded-xl border border-dashed border-gray-700 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-lime-400/60 hover:text-lime-400"
          >
            + Tambah Set
          </button>

          <button
            type="button"
            onClick={() => onStartRest(name)}
            className="mt-2 w-full rounded-xl bg-lime-400 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            Mulai Istirahat
          </button>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <p className="mt-2 text-center text-xs text-gray-500">
            Perubahan tersimpan otomatis.
          </p>
        </div>
      )}
    </li>
  );
}

export default function TodayWorkout({
  onOpenPrograms,
}: {
  onOpenPrograms: () => void;
}) {
  const { store, setAssignment, clearAssignment } = useTrainingPrograms();
  const { goal } = useCoachGoal();
  const { workouts, addWorkout, updateWorkout, removeWorkout } = useWorkouts();
  const [date, setDate] = useState(() => todayLocalISO());
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerExercise, setTimerExercise] = useState<string>();
  const [timerRestartKey, setTimerRestartKey] = useState(0);
  const [tutorialExercise, setTutorialExercise] = useState<{ name: string; id?: string } | null>(null);
  const [temporarySwaps, setTemporarySwaps] = useState<Record<string, TemporaryExerciseSwap>>({});
  const [temporarySwapStorageReady, setTemporarySwapStorageReady] = useState(false);
  const [swapExerciseIndex, setSwapExerciseIndex] = useState<number | null>(null);
  const coachWorkoutEvents = useRef(new Set<string>());

  useEffect(() => {
    const refreshDate = () => {
      const currentDate = todayLocalISO();
      setDate((previousDate) => previousDate === currentDate ? previousDate : currentDate);
    };
    window.addEventListener("focus", refreshDate);
    const interval = window.setInterval(refreshDate, 60_000);
    return () => {
      window.removeEventListener("focus", refreshDate);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(TEMPORARY_SWAP_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) as Record<string, TemporaryExerciseSwap> : {};
      const todayPrefix = `${todayLocalISO()}::`;
      const todaysSwaps = Object.fromEntries(
        Object.entries(parsed).filter(([key, value]) =>
          key.startsWith(todayPrefix) &&
          typeof value?.originalName === "string" &&
          (typeof value?.originalId === "string" || value?.originalId === null) &&
          typeof value?.replacementName === "string" &&
          typeof value?.replacementId === "string",
        ),
      );
      setTemporarySwaps(todaysSwaps);
    } catch {
      setTemporarySwaps({});
    } finally {
      setTemporarySwapStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!temporarySwapStorageReady) return;
    const todayPrefix = `${date}::`;
    const todaysSwaps = Object.fromEntries(
      Object.entries(temporarySwaps).filter(([key]) => key.startsWith(todayPrefix)),
    );
    try {
      window.sessionStorage.setItem(TEMPORARY_SWAP_STORAGE_KEY, JSON.stringify(todaysSwaps));
    } catch {
      // Temporary substitutions remain usable in memory if session storage is unavailable.
    }
  }, [date, temporarySwaps, temporarySwapStorageReady]);

  const startRestTimer = (exercise: string) => {
    setTimerExercise(exercise);
    setTimerRestartKey((current) => current + 1);
    setTimerOpen(true);
  };

  if (!store) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  const day = weekdayFromISO(date);
  const assignment = store.schedule[date];
  const selectedProgram = assignment?.programId
    ? store.programs.find((program) => program.id === assignment.programId)
    : undefined;
  const programExercises = selectedProgram?.exercises ?? [];
  const exercises = programExercises.map((name, index) => {
    const programId = selectedProgram?.id;
    if (!programId) return name;
    const swap = temporarySwaps[`${date}::${programId}::${index}`];
    const originalId = selectedProgram?.exerciseIds?.[index] ?? null;
    return swap && swap.originalName === name && swap.originalId === originalId
      ? swap.replacementName
      : name;
  });
  const coachProgramIds = new Set(goal?.programIds ?? []);
  const selectedIsCoachProgram = Boolean(selectedProgram && coachProgramIds.has(selectedProgram.id));
  const coachPrograms = store.programs.filter((program) => coachProgramIds.has(program.id));
  const coachProgramWasUsed = (programId: string, usedDate: string) => {
    const program = coachPrograms.find((item) => item.id === programId);
    const wasScheduled = store.schedule[usedDate]?.programId === programId;
    return Boolean(program && wasScheduled && workouts.some((workout) => workout.date === usedDate));
  };
  const previousCoachUses = Object.entries(store.schedule)
    .filter(([scheduledDate, scheduled]) => scheduledDate < date && !!scheduled.programId && coachProgramIds.has(scheduled.programId) && coachProgramWasUsed(scheduled.programId, scheduledDate))
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
  const lastUsedCoachId = previousCoachUses[0]?.[1].programId ?? null;
  const lastUsedCoachIndex = goal?.programIds.findIndex((id) => id === lastUsedCoachId) ?? -1;
  const nextCoachId = coachPrograms.length
    ? goal?.programIds[((lastUsedCoachIndex + 1) % goal.programIds.length + goal.programIds.length) % goal.programIds.length]
    : undefined;
  const nextCoachProgram = coachPrograms.find((program) => program.id === nextCoachId) ?? coachPrograms[0];
  const latestUseFor = (programId: string) => Object.entries(store.schedule)
    .filter(([scheduledDate, scheduled]) => scheduledDate <= date && scheduled.programId === programId && coachProgramWasUsed(programId, scheduledDate))
    .map(([scheduledDate]) => scheduledDate)
    .sort((a, b) => b.localeCompare(a))[0];
  const entriesFor = (name: string) =>
    workouts.filter((workout) => workout.exercise === name && workout.date === date);

  const currentSwapIndex = swapExerciseIndex;
  const swapOriginalName = currentSwapIndex === null ? "" : programExercises[currentSwapIndex] ?? "";
  const swapOriginalId = currentSwapIndex === null ? null : selectedProgram?.exerciseIds?.[currentSwapIndex] ?? null;
  const activeSwapKey = currentSwapIndex === null || !selectedProgram
    ? ""
    : `${date}::${selectedProgram.id}::${currentSwapIndex}`;
  const activeSwap = activeSwapKey ? temporarySwaps[activeSwapKey] : undefined;
  const hasActiveSwap = Boolean(
    activeSwap &&
    activeSwap.originalName === swapOriginalName &&
    activeSwap.originalId === swapOriginalId,
  );
  const handleTemporarySwap = (exercise: ExerciseCatalogItem) => {
    if (currentSwapIndex === null || !selectedProgram) return;
    const key = `${date}::${selectedProgram.id}::${currentSwapIndex}`;
    setTemporarySwaps((current) => ({
      ...current,
      [key]: {
        originalName: swapOriginalName,
        originalId: swapOriginalId,
        replacementName: exercise.name,
        replacementId: exercise.id,
      },
    }));
    trackEvent("Coach Exercise Substituted", { replacement_context: "today_workout" });
    setSwapExerciseIndex(null);
  };
  const restoreProgramExercise = () => {
    if (!activeSwapKey) return;
    setTemporarySwaps((current) => {
      const next = { ...current };
      delete next[activeSwapKey];
      return next;
    });
    setSwapExerciseIndex(null);
  };

  const selectCoachProgram = (programId: string, selectionMethod: "rotation_button" | "program_picker") => {
    setAssignment(date, programId);
    trackEvent("Coach Program Selected", { selection_method: selectionMethod });
  };

  const addTodayWorkout = (input: WorkoutInput, context?: WorkoutTrackingContext) => {
    const saved = addWorkout(input, context);
    if (context?.inputMethod === "quick_log" && selectedProgram && coachProgramIds.has(selectedProgram.id)) {
      const key = `${date}:${selectedProgram.id}`;
      let alreadyTracked = coachWorkoutEvents.current.has(key);
      try {
        alreadyTracked ||= window.sessionStorage.getItem(`coach-workout-logged:${key}`) === "1";
        if (!alreadyTracked) window.sessionStorage.setItem(`coach-workout-logged:${key}`, "1");
      } catch {
        // Tracking dedupe is best-effort; workout logging must always succeed.
      }
      if (!alreadyTracked) {
        coachWorkoutEvents.current.add(key);
        trackEvent("Coach Workout Logged", { input_method: "quick_log" });
      }
    }
    return saved;
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Latihan Hari Ini</h1>
        <p className="mt-2 text-gray-400">
          {DAY_LABELS[day]}, {formatDate(date)}
        </p>
      </div>

      {coachPrograms.length > 0 && <section className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm font-semibold text-lime-200">Rotasi Program</p></div>
          <span className="shrink-0 rounded-full bg-gray-900 px-2.5 py-1 text-xs text-gray-400">{coachPrograms.length} sesi</span>
        </div>
        {nextCoachProgram && !assignment && <button type="button" onClick={() => selectCoachProgram(nextCoachProgram.id, "rotation_button")} className="mt-3 w-full rounded-xl bg-lime-400 px-4 py-2.5 text-left text-sm font-bold text-gray-950 hover:bg-lime-300">Pilih sesi berikutnya · {nextCoachProgram.name.replace("Coach · ", "")}</button>}
        {previousCoachUses[0] && <p className="mt-2 text-xs text-gray-500">Terakhir dipakai {formatDate(previousCoachUses[0][0])}: {store.programs.find((program) => program.id === previousCoachUses[0][1].programId)?.name.replace("Coach · ", "")}</p>}
        {selectedProgram && coachProgramIds.has(selectedProgram.id) && <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${coachProgramWasUsed(selectedProgram.id, date) ? "bg-lime-400/10 text-lime-200" : "bg-gray-900 text-gray-400"}`}>{coachProgramWasUsed(selectedProgram.id, date) ? <><svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>Sudah digunakan hari ini</> : "Belum digunakan hari ini"}</p>}
      </section>}

      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-400">Pilih program latihan</span>
          <select
            value={!assignment ? "" : assignment.programId ?? "__rest__"}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) clearAssignment(date);
              else if (value === "__rest__") setAssignment(date, null);
              else if (coachProgramIds.has(value)) selectCoachProgram(value, "program_picker");
              else setAssignment(date, value);
            }}
            className={inputClass}
          >
            <option value="">Belum dipilih</option>
            <option value="__rest__">Rest Day</option>
            {store.programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name} · {program.exercises.length} latihan{coachProgramIds.has(program.id) && latestUseFor(program.id) ? ` · dipakai ${latestUseFor(program.id) === date ? "hari ini" : formatDate(latestUseFor(program.id)!)}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!assignment ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">Belum ada program yang dipilih.</p>
          <p className="mt-1 text-sm text-gray-500">
            Pilih program di atas atau buat program latihan baru.
          </p>
          <button
            type="button"
            onClick={onOpenPrograms}
            className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            Kelola Program
          </button>
        </div>
      ) : assignment.programId === null ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-lg font-semibold text-gray-200">Rest Day</p>
          <p className="mt-1 text-sm text-gray-500">Tidak ada latihan yang dijadwalkan hari ini.</p>
        </div>
      ) : !selectedProgram ? (
        <div className="rounded-2xl border border-dashed border-red-900/70 p-8 text-center text-red-300">Program tidak ditemukan. Silakan pilih program lain.</div>
      ) : (
        <ul className="space-y-3">
          {exercises.map((name, index) => (
            <ExerciseCard
              key={`${selectedProgram.id}-${selectedProgram.exerciseIds?.[index] ?? name}-${index}`}
              name={name}
              entries={entriesFor(name)}
              lastWorkout={[...workouts]
                .filter((workout) => workout.exercise === name && workout.date <= date)
                .sort(
                  (a, b) =>
                    b.date.localeCompare(a.date) ||
                    b.createdAt.localeCompare(a.createdAt),
                )[0]}
              date={date}
              onAdd={addTodayWorkout}
              onUpdate={updateWorkout}
              onDelete={removeWorkout}
              onStartRest={startRestTimer}
              onOpenTutorial={(exerciseName, exerciseId) => setTutorialExercise({ name: exerciseName, id: exerciseId ?? undefined })}
              exerciseId={
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`]?.replacementId &&
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`]?.originalName === programExercises[index] &&
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`]?.originalId === (selectedProgram.exerciseIds?.[index] ?? null)
                  ? temporarySwaps[`${date}::${selectedProgram.id}::${index}`].replacementId
                  : selectedProgram.exerciseIds?.[index]
              }
              showTemporarySwap={selectedIsCoachProgram}
              isTemporarySwap={Boolean(
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`] &&
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`].originalName === programExercises[index] &&
                temporarySwaps[`${date}::${selectedProgram.id}::${index}`].originalId === (selectedProgram.exerciseIds?.[index] ?? null)
              )}
              canTemporarySwap={!workouts.some((workout) =>
                workout.date === date &&
                (workout.exercise === programExercises[index] || workout.exercise === name),
              )}
              onTemporarySwap={() => setSwapExerciseIndex(index)}
            />
          ))}
        </ul>
      )}

      {swapExerciseIndex !== null && selectedProgram && selectedIsCoachProgram && (
        <TemporaryExerciseSwapSheet
          exerciseName={swapOriginalName}
          exerciseId={swapOriginalId}
          equipmentIds={goal?.equipmentIds}
          equipmentAccess={goal?.equipmentAccess ?? "full_gym"}
          hasTemporarySwap={hasActiveSwap}
          onSelect={handleTemporarySwap}
          onViewTutorial={(exercise) => setTutorialExercise({ name: exercise.name, id: exercise.id })}
          tutorialOpen={Boolean(tutorialExercise)}
          onRestore={restoreProgramExercise}
          onClose={() => setSwapExerciseIndex(null)}
        />
      )}

      <FloatingRestTimer
        open={timerOpen}
        restartKey={timerRestartKey}
        exercise={timerExercise}
        onClose={() => setTimerOpen(false)}
      />
      <ExerciseTutorialModal
        exercise={tutorialExercise?.name}
        exerciseId={tutorialExercise?.id}
        onClose={() => setTutorialExercise(null)}
      />
    </section>
  );
}
