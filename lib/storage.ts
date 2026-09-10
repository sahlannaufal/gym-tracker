import { DAY_LABELS, DAY_ORDER, WEEKDAYS } from "./types";
import type {
  ProgramAssignment,
  Routine,
  TrainingProgram,
  TrainingProgramStore,
  Weekday,
  Workout,
  WorkoutInput,
  WorkoutStore,
} from "./types";

const STORAGE_KEY = "gym_tracker_workouts_v1";
const STORE_VERSION = 1;
const PENDING_DELETE_KEY = "gym_tracker_pending_delete_v1";
const STORAGE_MIGRATION_OWNER_KEY = "gym_tracker_user_storage_owner_v1";

let activeStorageUserId: string | null = null;

function userStorageKey(baseKey: string, userId = activeStorageUserId): string | null {
  return userId ? `${baseKey}_${userId}` : null;
}

/**
 * Mengaktifkan namespace cache milik user. Data versi lama yang masih global
 * diklaim satu kali oleh user pertama agar upgrade tidak menghilangkan data.
 */
export function setStorageUser(userId: string | null): void {
  activeStorageUserId = userId;
  if (!userId || typeof window === "undefined") return;

  try {
    const migrationOwner = localStorage.getItem(STORAGE_MIGRATION_OWNER_KEY);
    if (!migrationOwner) {
      const migratedLegacyKeys: string[] = [];
      for (const baseKey of [
        STORAGE_KEY,
        PENDING_DELETE_KEY,
        ROUTINE_KEY,
        TRAINING_PROGRAM_KEY,
      ]) {
        const legacyValue = localStorage.getItem(baseKey);
        const scopedKey = userStorageKey(baseKey, userId);
        if (legacyValue !== null && scopedKey && localStorage.getItem(scopedKey) === null) {
          localStorage.setItem(scopedKey, legacyValue);
        }
        if (legacyValue !== null) migratedLegacyKeys.push(baseKey);
      }
      // Tandai kepemilikan hanya setelah semua salinan berhasil ditulis.
      localStorage.setItem(STORAGE_MIGRATION_OWNER_KEY, userId);
      migratedLegacyKeys.forEach((baseKey) => localStorage.removeItem(baseKey));
    }
  } catch {
    // Cache cloud tetap dapat dipulihkan bila LocalStorage tidak tersedia.
  }

  window.dispatchEvent(new Event("workouts-changed"));
  window.dispatchEvent(new Event("training-programs-changed"));
}

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

export function loadWorkouts(userId?: string): Workout[] {
  try {
    const key = userStorageKey(STORAGE_KEY, userId);
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return normalizeStore(JSON.parse(raw)).workouts;
  } catch {
    return [];
  }
}

function persist(workouts: Workout[], userId?: string): void {
  const key = userStorageKey(STORAGE_KEY, userId);
  if (!key) return;
  const store: WorkoutStore = { version: STORE_VERSION, workouts };
  localStorage.setItem(key, JSON.stringify(store));
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

export function updateWorkout(
  id: string,
  changes: Pick<Workout, "weight" | "reps">,
): Workout | null {
  const workouts = loadWorkouts();
  const current = workouts.find((workout) => workout.id === id);
  if (!current) return null;

  const updated: Workout = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
  persist(workouts.map((workout) => (workout.id === id ? updated : workout)));
  return updated;
}

export function deleteWorkout(id: string): void {
  persist(loadWorkouts().filter((w) => w.id !== id));
  addPendingDelete(id);
}

// Seluruh list diganti (dipakai hasil pull/merge sinkronisasi).
export function replaceWorkouts(workouts: Workout[], userId?: string): void {
  persist(workouts, userId);
}

// --- Antrian delete saat offline (tombstone untuk sinkronisasi) ---

export function loadPendingDeletes(userId?: string): string[] {
  try {
    const key = userStorageKey(PENDING_DELETE_KEY, userId);
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function persistPendingDeletes(ids: string[], userId?: string): void {
  try {
    const key = userStorageKey(PENDING_DELETE_KEY, userId);
    if (key) localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* localStorage penuh/tidak tersedia — abaikan */
  }
}

export function addPendingDelete(id: string): void {
  const list = loadPendingDeletes();
  if (!list.includes(id)) persistPendingDeletes([...list, id]);
}

export function removePendingDelete(id: string, userId?: string): void {
  persistPendingDeletes(loadPendingDeletes(userId).filter((x) => x !== id), userId);
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

export function loadRoutine(userId?: string): Routine {
  try {
    const key = userStorageKey(ROUTINE_KEY, userId);
    if (!key) return emptyRoutine();
    const raw = localStorage.getItem(key);
    if (!raw) return emptyRoutine();
    return normalizeRoutine(JSON.parse(raw));
  } catch {
    return emptyRoutine();
  }
}

export function saveRoutine(routine: Routine): void {
  const key = userStorageKey(ROUTINE_KEY);
  if (!key) return;
  const payload: Record<string, unknown> = {
    version: ROUTINE_VERSION,
    days: routine.days,
  };
  if (routine.updatedAt) payload.updatedAt = routine.updatedAt;
  localStorage.setItem(key, JSON.stringify(payload));
}

export function getDayExercises(day: Weekday, routine: Routine): string[] {
  return routine.days[day] ?? [];
}

// --- Program latihan reusable + pilihan program per tanggal ---

const TRAINING_PROGRAM_KEY = "gym_tracker_training_programs_v1";
const TRAINING_PROGRAM_VERSION = 1;

function emptyTrainingProgramStore(): TrainingProgramStore {
  return { version: TRAINING_PROGRAM_VERSION, programs: [], schedule: {} };
}

function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeTrainingProgram(value: unknown): TrainingProgram | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== "string" ||
    !raw.id ||
    typeof raw.name !== "string" ||
    !raw.name.trim() ||
    !Array.isArray(raw.exercises) ||
    typeof raw.createdAt !== "string" ||
    typeof raw.updatedAt !== "string"
  ) return null;

  return {
    id: raw.id,
    name: raw.name.trim(),
    exercises: raw.exercises.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    ),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeTrainingProgramStore(value: unknown): TrainingProgramStore {
  if (typeof value !== "object" || value === null) return emptyTrainingProgramStore();
  const raw = value as Record<string, unknown>;
  const programs = Array.isArray(raw.programs)
    ? raw.programs.map(normalizeTrainingProgram).filter((item): item is TrainingProgram => !!item)
    : [];
  const validIds = new Set(programs.map((program) => program.id));
  const schedule: Record<string, ProgramAssignment> = {};
  if (typeof raw.schedule === "object" && raw.schedule !== null) {
    for (const [date, value] of Object.entries(raw.schedule as Record<string, unknown>)) {
      if (!isISODate(date) || typeof value !== "object" || value === null) continue;
      const assignment = value as Record<string, unknown>;
      const programId = assignment.programId;
      if (
        (programId === null || (typeof programId === "string" && validIds.has(programId))) &&
        typeof assignment.updatedAt === "string"
      ) {
        schedule[date] = { programId, updatedAt: assignment.updatedAt };
      }
    }
  }
  return {
    version: TRAINING_PROGRAM_VERSION,
    programs,
    schedule,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

function migrateLegacyRoutine(userId?: string): TrainingProgramStore {
  const routine = loadRoutine(userId);
  const now = new Date().toISOString();
  const programs = DAY_ORDER.flatMap((day) => {
    const exercises = routine.days[day] ?? [];
    return exercises.length > 0
      ? [{
          id: `legacy_${day}`,
          name: `Rutin ${DAY_LABELS[day]}`,
          exercises,
          createdAt: routine.updatedAt ?? now,
          updatedAt: routine.updatedAt ?? now,
        }]
      : [];
  });
  return {
    version: TRAINING_PROGRAM_VERSION,
    programs,
    schedule: {},
    updatedAt: programs.length > 0 ? now : undefined,
  };
}

export function loadTrainingProgramStore(userId?: string): TrainingProgramStore {
  try {
    const key = userStorageKey(TRAINING_PROGRAM_KEY, userId);
    if (!key) return emptyTrainingProgramStore();
    const raw = localStorage.getItem(key);
    if (raw) return normalizeTrainingProgramStore(JSON.parse(raw));
    const migrated = migrateLegacyRoutine(userId);
    localStorage.setItem(key, JSON.stringify(migrated));
    return migrated;
  } catch {
    return emptyTrainingProgramStore();
  }
}

export function saveTrainingProgramStore(store: TrainingProgramStore, userId?: string): void {
  const key = userStorageKey(TRAINING_PROGRAM_KEY, userId);
  if (!key) return;
  localStorage.setItem(
    key,
    JSON.stringify({ ...store, version: TRAINING_PROGRAM_VERSION }),
  );
  window.dispatchEvent(new Event("training-programs-changed"));
}

// --- Preferensi floating rest timer ---

const REST_SECONDS_KEY = "gym_tracker_rest_seconds_v1";
const REST_MUTED_KEY = "gym_tracker_rest_muted_v1";
export const DEFAULT_REST_SECONDS = 60;
const MIN_REST_SECONDS = 1;
const MAX_REST_SECONDS = 3600;

export function loadRestSeconds(): number {
  try {
    const raw = localStorage.getItem(REST_SECONDS_KEY);
    if (raw === null) return DEFAULT_REST_SECONDS;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
      return DEFAULT_REST_SECONDS;
    }
    return Math.min(MAX_REST_SECONDS, Math.max(MIN_REST_SECONDS, Math.round(parsed)));
  } catch {
    return DEFAULT_REST_SECONDS;
  }
}

export function saveRestSeconds(seconds: number): void {
  const clamped = Math.min(MAX_REST_SECONDS, Math.max(MIN_REST_SECONDS, Math.round(seconds)));
  try {
    localStorage.setItem(REST_SECONDS_KEY, JSON.stringify(clamped));
  } catch {
    /* localStorage tidak tersedia — abaikan */
  }
}

export function loadRestMuted(): boolean {
  try {
    const raw = localStorage.getItem(REST_MUTED_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
}

export function saveRestMuted(muted: boolean): void {
  try {
    localStorage.setItem(REST_MUTED_KEY, JSON.stringify(muted));
  } catch {
    /* localStorage tidak tersedia — abaikan */
  }
}
