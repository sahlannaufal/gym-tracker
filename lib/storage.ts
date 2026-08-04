import type { Workout, WorkoutInput, WorkoutStore } from "./types";

const STORAGE_KEY = "gym_tracker_workouts_v1";
const STORE_VERSION = 1;

const EMPTY_STORE: WorkoutStore = { version: STORE_VERSION, workouts: [] };

function generateId(): string {
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isValidWorkout(value: unknown): value is Workout {
  if (typeof value !== "object" || value === null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === "string" &&
    w.id.length > 0 &&
    typeof w.exercise === "string" &&
    w.exercise.trim().length > 0 &&
    typeof w.weight === "number" &&
    w.weight > 0 &&
    typeof w.reps === "number" &&
    w.reps > 0 &&
    typeof w.sets === "number" &&
    w.sets > 0 &&
    typeof w.date === "string" &&
    typeof w.createdAt === "string"
  );
}

function normalizeStore(value: unknown): WorkoutStore {
  if (typeof value !== "object" || value === null) return EMPTY_STORE;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.workouts)) return EMPTY_STORE;
  return {
    version: STORE_VERSION,
    workouts: raw.workouts.filter(isValidWorkout),
  };
}

export function loadWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return normalizeStore(JSON.parse(raw)).workouts;
  } catch {
    return [];
  }
}

function persist(workouts: Workout[]): void {
  const store: WorkoutStore = { version: STORE_VERSION, workouts };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveWorkout(input: WorkoutInput): Workout {
  const workout: Workout = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  persist([...loadWorkouts(), workout]);
  return workout;
}

export function deleteWorkout(id: string): void {
  persist(loadWorkouts().filter((w) => w.id !== id));
}
