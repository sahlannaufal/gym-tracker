import { WEEKDAYS } from "./types";
import type {
  Routine,
  Weekday,
  Workout,
  WorkoutInput,
  WorkoutStore,
} from "./types";

const STORAGE_KEY = "gym_tracker_workouts_v1";
const STORE_VERSION = 1;
const PENDING_DELETE_KEY = "gym_tracker_pending_delete_v1";

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
  const now = new Date().toISOString();
  const workout: Workout = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  persist([...loadWorkouts(), workout]);
  return workout;
}

export function deleteWorkout(id: string): void {
  persist(loadWorkouts().filter((w) => w.id !== id));
  addPendingDelete(id);
}

// Seluruh list diganti (dipakai hasil pull/merge sinkronisasi).
export function replaceWorkouts(workouts: Workout[]): void {
  persist(workouts);
}

// --- Antrian delete saat offline (tombstone untuk sinkronisasi) ---

export function loadPendingDeletes(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_DELETE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function persistPendingDeletes(ids: string[]): void {
  try {
    localStorage.setItem(PENDING_DELETE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage penuh/tidak tersedia — abaikan */
  }
}

export function addPendingDelete(id: string): void {
  const list = loadPendingDeletes();
  if (!list.includes(id)) persistPendingDeletes([...list, id]);
}

export function removePendingDelete(id: string): void {
  persistPendingDeletes(loadPendingDeletes().filter((x) => x !== id));
}

const ROUTINE_KEY = "gym_tracker_routine_v1";
const ROUTINE_VERSION = 1;

function emptyRoutine(): Routine {
  return {
    version: ROUTINE_VERSION,
    days: {
      minggu: [],
      senin: [],
      selasa: [],
      rabu: [],
      kamis: [],
      jumat: [],
      sabtu: [],
    },
  };
}

function normalizeRoutine(value: unknown): Routine {
  if (typeof value !== "object" || value === null) return emptyRoutine();
  const raw = value as Record<string, unknown>;
  if (typeof raw.days !== "object" || raw.days === null) return emptyRoutine();
  const daysRaw = raw.days as Record<string, unknown>;
  const days = {} as Record<Weekday, string[]>;
  for (const day of WEEKDAYS) {
    const list = daysRaw[day];
    days[day] = Array.isArray(list)
      ? list.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0
        )
      : [];
  }
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt.length > 0
      ? raw.updatedAt
      : undefined;
  return { version: ROUTINE_VERSION, days, updatedAt };
}

export function loadRoutine(): Routine {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return emptyRoutine();
    return normalizeRoutine(JSON.parse(raw));
  } catch {
    return emptyRoutine();
  }
}

export function saveRoutine(routine: Routine): void {
  const payload: Record<string, unknown> = {
    version: ROUTINE_VERSION,
    days: routine.days,
  };
  if (routine.updatedAt) payload.updatedAt = routine.updatedAt;
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(payload));
}

export function getDayExercises(day: Weekday, routine: Routine): string[] {
  return routine.days[day] ?? [];
}
