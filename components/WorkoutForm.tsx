"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkouts } from "@/lib/useWorkouts";
import { useCustomExercises } from "@/lib/useCustomExercises";
import { todayLocalISO } from "@/lib/format";
import {
  CUSTOM_EXERCISE_VALUE,
} from "@/lib/constants/exercises";
import FloatingRestTimer from "./FloatingRestTimer";
import ExerciseCatalogPicker from "./ExerciseCatalogPicker";
import ExerciseTutorialModal from "./ExerciseTutorialModal";

interface FormValues {
  exerciseSelect: string;
  customExercise: string;
  weight: string;
  reps: string;
  sets: string;
  date: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  exerciseSelect: "",
  customExercise: "",
  weight: "",
  reps: "",
  sets: "",
  date: todayLocalISO(),
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.exerciseSelect) {
    errors.exerciseSelect = "Pilih latihan terlebih dahulu";
  } else if (
    values.exerciseSelect === CUSTOM_EXERCISE_VALUE &&
    !values.customExercise.trim()
  ) {
    errors.customExercise = "Nama latihan wajib diisi";
  }

  const weight = Number(values.weight);
  if (!values.weight || !Number.isFinite(weight) || weight <= 0) {
    errors.weight = "Beban harus lebih dari 0 (kg)";
  }

  const reps = Number(values.reps);
  if (!values.reps || !Number.isInteger(reps) || reps <= 0) {
    errors.reps = "Repetisi harus bilangan bulat lebih dari 0";
  }

  const sets = Number(values.sets);
  if (!values.sets || !Number.isInteger(sets) || sets <= 0) {
    errors.sets = "Set harus bilangan bulat lebih dari 0";
  }

  if (!values.date) {
    errors.date = "Tanggal wajib diisi";
  }

  return errors;
}

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function WorkoutForm({
  initialExercise,
}: {
  initialExercise?: string;
}) {
  const router = useRouter();
  const { workouts, isLoaded, addWorkout } = useWorkouts();
  const { customExercises, addCustomExercise } = useCustomExercises();
  const [values, setValues] = useState<FormValues>(() => {
    if (!initialExercise) return initialValues;
    return { ...initialValues, exerciseSelect: initialExercise };
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerExercise, setTimerExercise] = useState<string>();
  const [timerRestartKey, setTimerRestartKey] = useState(0);
  const [saveNotice, setSaveNotice] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [tutorialExercise, setTutorialExercise] = useState<string>();
  const noticeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !initialExercise) return;
    if (values.weight !== "" || values.reps !== "" || values.sets !== "") {
      return;
    }
    const last = workouts
      .filter((w) => w.exercise === initialExercise)
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.createdAt.localeCompare(a.createdAt)
      )[0];
    if (!last) return;
    setValues((prev) => ({
      ...prev,
      weight: String(last.weight),
      reps: String(last.reps),
      sets: String(last.sets),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const setValue = (key: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const selectExercise = (exercise: string) => {
    setValues((prev) => ({ ...prev, exerciseSelect: exercise, customExercise: "" }));
    setExercisePickerOpen(false);
    setCustomOpen(false);
    if (errors.exerciseSelect || errors.customExercise) {
      setErrors((prev) => ({ ...prev, exerciseSelect: undefined, customExercise: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const exercise =
      values.exerciseSelect === CUSTOM_EXERCISE_VALUE
        ? values.customExercise.trim()
        : values.exerciseSelect;
    if (values.exerciseSelect === CUSTOM_EXERCISE_VALUE) addCustomExercise(exercise);
    addWorkout(
      {
        exercise,
        weight: Number(values.weight),
        reps: Number(values.reps),
        sets: Number(values.sets),
        date: values.date,
      },
      { inputMethod: "manual_form" },
    );
    setTimerExercise(exercise);
    setTimerRestartKey((current) => current + 1);
    setTimerOpen(true);
    setSaveNotice(true);
    if (noticeTimeoutRef.current !== null) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setSaveNotice(false);
      noticeTimeoutRef.current = null;
    }, 2500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-5"
    >
      <Field
        label="Nama Latihan"
        htmlFor="exerciseSelect"
        error={errors.exerciseSelect ?? errors.customExercise}
      >
        <button
          id="exerciseSelect"
          type="button"
          onClick={() => setExercisePickerOpen((open) => !open)}
          aria-expanded={exercisePickerOpen}
          className={`${inputClass} flex items-center justify-between text-left`}
          autoFocus={!initialExercise}
        >
          <span className={values.exerciseSelect ? "truncate text-gray-100" : "text-gray-400"}>
            {values.exerciseSelect === CUSTOM_EXERCISE_VALUE
              ? values.customExercise || "Nama latihan custom"
              : values.exerciseSelect || "Tambah latihan..."}
          </span>
          <svg className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${exercisePickerOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {exercisePickerOpen && (
          <div className="mt-2 rounded-xl border border-gray-700 bg-gray-950 p-2 shadow-xl">
            <ExerciseCatalogPicker
              selected={values.exerciseSelect && values.exerciseSelect !== CUSTOM_EXERCISE_VALUE ? [values.exerciseSelect] : []}
              customExercises={customExercises.map((item) => item.name)}
              onAdd={selectExercise}
              onTutorial={setTutorialExercise}
              onCustom={() => {
                setValues((prev) => ({ ...prev, exerciseSelect: CUSTOM_EXERCISE_VALUE, customExercise: "" }));
                setCustomOpen(true);
                setExercisePickerOpen(false);
              }}
            />
          </div>
        )}
        {customOpen && (
          <div className="mt-2 flex gap-2">
            <input id="customExercise" type="text" value={values.customExercise} onChange={setValue("customExercise")} placeholder="Nama latihan custom" className={inputClass} autoFocus />
            <button type="button" onClick={() => { const name = values.customExercise.trim(); if (name) { addCustomExercise(name); selectExercise(name); } }} className="rounded-xl bg-gray-700 px-4 font-semibold hover:bg-gray-600">Tambah</button>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Beban (kg)" htmlFor="weight" error={errors.weight}>
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={values.weight}
            onChange={setValue("weight")}
            placeholder="60"
            className={inputClass}
            autoFocus={Boolean(initialExercise)}
          />
        </Field>

        <Field label="Repetisi" htmlFor="reps" error={errors.reps}>
          <input
            id="reps"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.reps}
            onChange={setValue("reps")}
            placeholder="8"
            className={inputClass}
          />
        </Field>

        <Field label="Set" htmlFor="sets" error={errors.sets}>
          <input
            id="sets"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.sets}
            onChange={setValue("sets")}
            placeholder="3"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tanggal" htmlFor="date" error={errors.date}>
        <input
          id="date"
          type="date"
          value={values.date}
          onChange={setValue("date")}
          className={inputClass}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
        >
          Batal
        </button>
      </div>

      {saveNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-[60] -translate-x-1/2 rounded-full border border-lime-400/40 bg-gray-900/95 px-4 py-2 text-sm font-semibold text-lime-400 shadow-lg shadow-black/40 backdrop-blur"
        >
          ✓ Data tersimpan
        </div>
      )}

      <FloatingRestTimer
        open={timerOpen}
        restartKey={timerRestartKey}
        exercise={timerExercise}
        onClose={() => setTimerOpen(false)}
      />
      <ExerciseTutorialModal exercise={tutorialExercise} onClose={() => setTutorialExercise(undefined)} />
    </form>
  );
}
