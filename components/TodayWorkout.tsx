"use client";

import { useEffect, useState } from "react";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import { useWorkouts } from "@/lib/useWorkouts";
import { DAY_LABELS } from "@/lib/types";
import { formatDate, todayLocalISO, weekdayFromISO } from "@/lib/format";
import type { Workout, WorkoutInput } from "@/lib/types";
import FloatingRestTimer from "./FloatingRestTimer";
import type { WorkoutTrackingContext } from "@/lib/useWorkouts";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

type SetRow = {
  key: string;
  workoutId?: string;
  weight: string;
  reps: string;
};

function ExerciseCard({
  name,
  entries,
  lastWorkout,
  date,
  onAdd,
  onUpdate,
  onDelete,
  onStartRest,
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
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-100">{name}</p>
          {totalSets > 0 && (
            <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-xs font-medium text-lime-400">
              {totalSets}
            </span>
          )}
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-700 text-gray-400 transition-transform ${
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
        </span>
      </button>

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
  const { workouts, addWorkout, updateWorkout, removeWorkout } = useWorkouts();
  const [date, setDate] = useState(todayLocalISO());
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerExercise, setTimerExercise] = useState<string>();
  const [timerRestartKey, setTimerRestartKey] = useState(0);

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
  const exercises = selectedProgram?.exercises ?? [];
  const entriesFor = (name: string) =>
    workouts.filter((workout) => workout.exercise === name && workout.date === date);

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
          onChange={(event) => setDate(event.target.value || todayLocalISO())}
          className={inputClass}
        />
      </label>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-400">Program untuk tanggal ini</span>
          <select
            value={!assignment ? "" : assignment.programId ?? "__rest__"}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) clearAssignment(date);
              else setAssignment(date, value === "__rest__" ? null : value);
            }}
            className={inputClass}
          >
            <option value="">Belum dipilih</option>
            <option value="__rest__">Rest Day</option>
            {store.programs.map((program) => (
              <option key={program.id} value={program.id}>{program.name}</option>
            ))}
          </select>
        </label>
        {selectedProgram && (
          <p className="mt-2 text-sm text-lime-400">{selectedProgram.name} · {selectedProgram.exercises.length} latihan</p>
        )}
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
          <p className="mt-1 text-sm text-gray-500">Tidak ada latihan yang dijadwalkan pada tanggal ini.</p>
        </div>
      ) : !selectedProgram ? (
        <div className="rounded-2xl border border-dashed border-red-900/70 p-8 text-center text-red-300">Program tidak ditemukan. Silakan pilih program lain.</div>
      ) : (
        <ul className="space-y-3">
          {exercises.map((name) => (
            <ExerciseCard
              key={name}
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
              onAdd={addWorkout}
              onUpdate={updateWorkout}
              onDelete={removeWorkout}
              onStartRest={startRestTimer}
            />
          ))}
        </ul>
      )}

      <FloatingRestTimer
        open={timerOpen}
        restartKey={timerRestartKey}
        exercise={timerExercise}
        onClose={() => setTimerOpen(false)}
      />
    </section>
  );
}
