import { isSyncConfigured, supabase } from "./supabase/client";
import {
  loadPendingDeletes,
  loadCoachGoal,
  loadCustomExerciseStore,
  loadTrainingProgramStore,
  loadWorkouts,
  removePendingDelete,
  replaceWorkouts,
  saveTrainingProgramStore,
  saveCoachGoal,
  saveCustomExerciseStore,
  setStorageUser,
} from "./storage";
import type { CoachGoal, CustomExerciseStore, TrainingProgramStore, Workout } from "./types";
import type { BodyMeasurement } from "./types";
import {
  loadBodyMeasurementDeletes,
  loadBodyMeasurements,
  notifyBodyMeasurementsChanged,
  removeBodyMeasurementDelete,
  replaceBodyMeasurements,
} from "./bodyMeasurements";
import { trackEvent } from "./analytics";

// ---------- Status sinkronisasi (pub-sub ringan untuk UI) ----------

export type SyncState =
  | "unconfigured"
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export type SyncTarget =
  | "workouts"
  | "programs"
  | "coach_goal"
  | "custom_exercises"
  | "body_measurements";

export interface SyncFailure {
  target: SyncTarget;
  code?: string;
  message: string;
  detail?: string;
}

export interface SyncStatus {
  state: SyncState;
  lastSync?: string;
  failure?: SyncFailure;
}

export const SYNC_TARGET_LABEL: Record<SyncTarget, string> = {
  workouts: "riwayat latihan",
  programs: "program dan jadwal",
  coach_goal: "profil Coach",
  custom_exercises: "latihan custom",
  body_measurements: "pengukuran tubuh",
};

const PAGE_SIZE = 500;

let status: SyncStatus = {
  state: isSyncConfigured() ? "idle" : "unconfigured",
};
const listeners = new Set<(s: SyncStatus) => void>();

function setStatus(next: SyncStatus) {
  status = next;
  listeners.forEach((cb) => cb(next));
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ---------- Helpers ----------

let currentUserId: string | null = null;

export function setSyncUser(id: string | null): void {
  const changed = currentUserId !== id;
  currentUserId = id;
  setStorageUser(id);
  if (changed) setStatus({ state: isSyncConfigured() ? "idle" : "unconfigured" });
}

type WorkoutRow = {
  id: string;
  user_id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  created_at: string;
  updated_at: string;
};

function toRow(w: Workout, userId: string): WorkoutRow {
  return {
    id: w.id,
    user_id: userId,
    exercise: w.exercise,
    weight: w.weight,
    reps: w.reps,
    sets: w.sets,
    date: w.date,
    created_at: w.createdAt,
    updated_at: w.updatedAt ?? w.createdAt,
  };
}

function fromRow(r: WorkoutRow): Workout {
  return {
    id: r.id,
    exercise: r.exercise,
    weight: r.weight,
    reps: r.reps,
    sets: r.sets,
    date: r.date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

type BodyMeasurementRow = {
  id: string;
  user_id: string;
  weight_kg: number;
  height_cm: number;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  measured_at: string;
  created_at: string;
  updated_at: string;
};

function bodyMeasurementToRow(
  item: BodyMeasurement,
  userId: string,
): BodyMeasurementRow {
  return {
    id: item.id,
    user_id: userId,
    weight_kg: item.weightKg,
    height_cm: item.heightCm,
    body_fat_percentage: item.bodyFatPercentage ?? null,
    muscle_mass_kg: item.muscleMassKg ?? null,
    measured_at: item.measuredAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function bodyMeasurementFromRow(row: BodyMeasurementRow): BodyMeasurement {
  return {
    id: row.id,
    weightKg: row.weight_kg,
    heightCm: row.height_cm,
    bodyFatPercentage: row.body_fat_percentage ?? undefined,
    muscleMassKg: row.muscle_mass_kg ?? undefined,
    measuredAt: row.measured_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Supabase dapat mengembalikan DELETE tanpa error tetapi tanpa baris terdampak
 * (misalnya ketika RLS menolak target). Verifikasi keberadaan baris sebelum
 * menghapus tombstone lokal agar data server tidak dapat muncul kembali.
 */
async function deleteBodyMeasurementFromCloud(
  id: string,
  userId: string,
): Promise<boolean> {
  if (!supabase) return false;

  const { error: deleteError } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  const { data: remaining, error: verifyError } = await supabase
    .from("body_measurements")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (verifyError) throw verifyError;

  return remaining === null;
}

async function deleteWorkoutFromCloud(id: string, userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error: deleteError } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  const { data: remaining, error: verifyError } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (verifyError) throw verifyError;

  return remaining === null;
}

function describeSyncFailure(target: SyncTarget, error: unknown): SyncFailure {
  const value = typeof error === "object" && error !== null
    ? error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown; status?: unknown }
    : {};
  const code = typeof value.code === "string" ? value.code : undefined;
  const parts = [value.message, value.details, value.hint]
    .filter((part): part is string => typeof part === "string" && part.length > 0);
  if (typeof value.status === "number" || typeof value.status === "string") {
    parts.push(`HTTP ${value.status}`);
  }
  let detail = parts.join(" | ");
  if (!detail) {
    if (error instanceof Error) {
      detail = error.message || error.name;
    } else if (typeof error === "string") {
      detail = error;
    } else {
      try {
        detail = JSON.stringify(error) ?? String(error);
      } catch {
        detail = String(error);
      }
    }
  }
  const normalized = detail.toLowerCase();
  let message = `Sinkronisasi ${SYNC_TARGET_LABEL[target]} gagal. Data lokal tetap tersimpan; coba lagi.`;

  if (code === "42501" || code === "PGRST301" || normalized.includes("jwt")) {
    message = `Akses ke ${SYNC_TARGET_LABEL[target]} ditolak. Masuk kembali dan periksa kebijakan akses Supabase.`;
  } else if (code === "PGRST205" && target === "coach_goal") {
    message = "Supabase API belum mengenali tabel coach_goals. Pastikan migration 0004 berjalan pada project yang dipakai aplikasi, lalu muat ulang schema cache.";
  } else if (
    code === "42P01" || code === "42703" || code === "PGRST204" || code === "PGRST205" ||
    normalized.includes("schema cache") || normalized.includes("does not exist")
  ) {
    message = `Skema ${SYNC_TARGET_LABEL[target]} belum tersedia di Supabase. Periksa migrasi database.`;
  } else if (
    normalized.includes("failed to fetch") || normalized.includes("network") || normalized.includes("timeout")
  ) {
    message = `Koneksi terputus saat menyinkronkan ${SYNC_TARGET_LABEL[target]}. Data lokal tetap tersimpan.`;
  }

  return { target, code, message, detail };
}

async function getUserId(): Promise<string | null> {
  if (currentUserId) return currentUserId;
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  currentUserId = data.session?.user.id ?? null;
  return currentUserId;
}

// ---------- Sync engine ----------

let inFlight = false;
let rerunRequested = false;
let rerunUserId: string | null = null;
let activeSyncPromise: Promise<void> | null = null;

/**
 * Sinkronisasi penuh dua arah (offline-first, last-write-wins by updated_at).
 * - Antrian delete offline diproses dulu (tombstone).
 * - Workout lokal yang lebih baru / belum ada di server di-upload (upsert).
 * - Kemudian pull server, merge, dan tulis kembali ke LocalStorage.
 */
export async function syncAll(userId: string): Promise<void> {
  if (!supabase) {
    setStatus({ state: "unconfigured" });
    return;
  }
  if (inFlight) {
    // Ada perubahan baru selama sync berjalan -> jalankan sekali lagi setelah selesai.
    rerunRequested = true;
    rerunUserId = userId;
    await activeSyncPromise;
    return;
  }
  inFlight = true;
  activeSyncPromise = (async () => {
  const syncStartedAt = Date.now();
  let syncedWorkoutCount = 0;
  let syncTarget: SyncTarget = "workouts";
  setStatus({ state: "syncing" });
  try {
    // 1. Proses hapus yang tertunda saat offline
    for (const id of loadPendingDeletes(userId)) {
      const deleted = await deleteWorkoutFromCloud(id, userId);
      if (!deleted) throw new Error(`Penghapusan workout ${id} belum terkonfirmasi.`);
      removePendingDelete(id, userId);
      syncedWorkoutCount += 1;
    }
    const pending = new Set(loadPendingDeletes(userId));

    // 2. Pull server
    const serverRows: WorkoutRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      const page = (data ?? []) as WorkoutRow[];
      serverRows.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    // 3. Merge last-write-wins
    const local = loadWorkouts(userId);
    const serverMap = new Map(serverRows.map((r) => [r.id, r]));
    const merged = new Map<string, Workout>();
    const toUpsert: Workout[] = [];

    for (const w of local) {
      if (pending.has(w.id)) continue; // tombstone, tunggu delete berhasil
      const s = serverMap.get(w.id);
      const wUpdated = w.updatedAt ?? w.createdAt;
      if (!s) {
        merged.set(w.id, w);
        toUpsert.push(w);
      } else if (wUpdated > s.updated_at) {
        merged.set(w.id, w);
        toUpsert.push(w);
      } else {
        merged.set(w.id, fromRow(s));
      }
      serverMap.delete(w.id);
    }
    for (const s of serverMap.values()) {
      if (!pending.has(s.id)) merged.set(s.id, fromRow(s));
    }

    // 4. Upload yang lebih baru
    for (const w of toUpsert) {
      const { error: upErr } = await supabase
        .from("workouts")
        .upsert(toRow(w, userId));
      if (upErr) throw upErr;
      syncedWorkoutCount += 1;
    }

    // Jangan timpa LocalStorage dengan snapshot basi: baca ulang state &
    // tombstone terbaru. Item yang disimpan selama sync dipertahankan; item
    // yang dihapus selama sync (tombstone baru belum diproses) dibuang dari
    // hasil merge agar tidak tertulis kembali (dan tidak ter-upload ulang).
    const latestLocal = loadWorkouts(userId);
    const latestPending = new Set(loadPendingDeletes(userId));
    for (const id of [...merged.keys()]) {
      if (latestPending.has(id)) merged.delete(id);
    }
    for (const w of latestLocal) {
      if (!merged.has(w.id) && !latestPending.has(w.id)) {
        merged.set(w.id, w);
      }
    }
    replaceWorkouts([...merged.values()], userId);

    // 5. Program latihan + pilihan per tanggal (satu dokumen per user).
    syncTarget = "programs";
    const { data: routineRow, error: routinePullErr } = await supabase
      .from("routine")
      .select("programs, schedule, program_updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (routinePullErr) throw routinePullErr;

    const localPrograms = loadTrainingProgramStore(userId);
    const localHasContent = localPrograms.programs.length > 0 || Object.keys(localPrograms.schedule).length > 0;
    const localHasSnapshot = localHasContent || Boolean(localPrograms.updatedAt);
    const serverPrograms = (routineRow?.programs ?? []) as TrainingProgramStore["programs"];
    const serverSchedule = (routineRow?.schedule ?? {}) as TrainingProgramStore["schedule"];
    const serverHasContent = serverPrograms.length > 0 || Object.keys(serverSchedule).length > 0;
    const serverUpdatedAt = routineRow?.program_updated_at as string | undefined;
    const serverHasSnapshot = serverHasContent || Boolean(serverUpdatedAt);

    // Local lebih baru / belum ada di server -> upload
    const localUpdatedAt = localPrograms.updatedAt;
    const localIsNewer =
      !!localUpdatedAt &&
      (!serverUpdatedAt || localUpdatedAt > serverUpdatedAt);

    if (localHasSnapshot && (!serverHasSnapshot || localIsNewer)) {
      const { error: routineErr } = await supabase.from("routine").upsert({
        id: userId,
        programs: localPrograms.programs,
        schedule: localPrograms.schedule,
        program_updated_at: localUpdatedAt ?? new Date().toISOString(),
      });
      if (routineErr) throw routineErr;
    } else if (serverHasSnapshot) {
      // Server lebih baru -> tarik ke lokal (ikut sertakan timestamp server)
      saveTrainingProgramStore({
        version: 1,
        programs: serverPrograms,
        schedule: serverSchedule,
        updatedAt: serverUpdatedAt,
      }, userId);
    }

    // 6. Goal Coach — satu dokumen per user, last-write-wins by updated_at.
    syncTarget = "coach_goal";
    const { data: coachRow, error: coachPullError } = await supabase
      .from("coach_goals")
      .select("goal, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (coachPullError) throw coachPullError;

    const localGoal = loadCoachGoal(userId);
    const serverGoal = coachRow?.goal as CoachGoal | undefined;
    const serverGoalUpdatedAt = coachRow?.updated_at as string | undefined;
    if (localGoal && (!serverGoalUpdatedAt || localGoal.updatedAt > serverGoalUpdatedAt)) {
      const { error: coachUpsertError } = await supabase.from("coach_goals").upsert({
        user_id: userId,
        goal: localGoal,
        updated_at: localGoal.updatedAt,
      });
      if (coachUpsertError) throw coachUpsertError;
    } else if (serverGoal && serverGoalUpdatedAt) {
      // Timestamp DB adalah sumber konflik; salin ke payload agar mutasi lokal
      // berikutnya selalu memiliki updatedAt yang dapat dibandingkan.
      saveCoachGoal({ ...serverGoal, updatedAt: serverGoalUpdatedAt }, userId);
    }

    // 7. Daftar latihan custom — satu dokumen per user, last-write-wins.
    syncTarget = "custom_exercises";
    const { data: customLibraryRow, error: customLibraryError } = await supabase
      .from("custom_exercise_libraries")
      .select("exercises, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (customLibraryError) throw customLibraryError;

    const localCustomStore = loadCustomExerciseStore(userId);
    const serverCustomUpdatedAt = customLibraryRow?.updated_at as string | undefined;
    const serverCustomExercises = (customLibraryRow?.exercises ?? []) as CustomExerciseStore["exercises"];
    const localCustomHasSnapshot = localCustomStore.exercises.length > 0 || Boolean(localCustomStore.updatedAt);
    const localCustomIsNewer =
      localCustomHasSnapshot &&
      (!serverCustomUpdatedAt || (!!localCustomStore.updatedAt && localCustomStore.updatedAt > serverCustomUpdatedAt));
    if (localCustomIsNewer) {
      const { error: customUpsertError } = await supabase.from("custom_exercise_libraries").upsert({
        user_id: userId,
        exercises: localCustomStore.exercises,
        updated_at: localCustomStore.updatedAt ?? new Date().toISOString(),
      });
      if (customUpsertError) throw customUpsertError;
    } else if (serverCustomUpdatedAt) {
      saveCustomExerciseStore({
        version: 1,
        exercises: serverCustomExercises,
        updatedAt: serverCustomUpdatedAt,
      }, userId);
    }

    // 8. Riwayat komposisi tubuh — cache lokal dipisahkan per user.
    syncTarget = "body_measurements";
    for (const id of loadBodyMeasurementDeletes(userId)) {
      const deleted = await deleteBodyMeasurementFromCloud(id, userId);
      if (!deleted) {
        throw new Error(`Pengukuran ${id} masih ada setelah proses hapus.`);
      }
      removeBodyMeasurementDelete(userId, id);
    }
    const bodyPending = new Set(loadBodyMeasurementDeletes(userId));
    const bodyData: BodyMeasurementRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", userId)
        .order("measured_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      const page = (data ?? []) as BodyMeasurementRow[];
      bodyData.push(...page);
      if (page.length < PAGE_SIZE) break;
    }

    const bodyServerMap = new Map(
      ((bodyData ?? []) as BodyMeasurementRow[]).map((row) => [row.id, row]),
    );
    const bodyMerged = new Map<string, BodyMeasurement>();
    const bodyUpserts: BodyMeasurement[] = [];
    for (const localItem of loadBodyMeasurements(userId)) {
      if (bodyPending.has(localItem.id)) continue;
      const serverItem = bodyServerMap.get(localItem.id);
      if (!serverItem || localItem.updatedAt > serverItem.updated_at) {
        bodyMerged.set(localItem.id, localItem);
        bodyUpserts.push(localItem);
      } else {
        bodyMerged.set(localItem.id, bodyMeasurementFromRow(serverItem));
      }
      bodyServerMap.delete(localItem.id);
    }
    for (const serverItem of bodyServerMap.values()) {
      if (!bodyPending.has(serverItem.id)) {
        bodyMerged.set(serverItem.id, bodyMeasurementFromRow(serverItem));
      }
    }
    for (const item of bodyUpserts) {
      const { error: upsertError } = await supabase
        .from("body_measurements")
        .upsert(bodyMeasurementToRow(item, userId));
      if (upsertError) throw upsertError;
    }

    // Pertahankan mutasi lokal yang terjadi ketika request sedang berjalan.
    const latestBodyPending = new Set(loadBodyMeasurementDeletes(userId));
    for (const id of [...bodyMerged.keys()]) {
      if (latestBodyPending.has(id)) bodyMerged.delete(id);
    }
    for (const item of loadBodyMeasurements(userId)) {
      if (!bodyMerged.has(item.id) && !latestBodyPending.has(item.id)) {
        bodyMerged.set(item.id, item);
      }
    }
    replaceBodyMeasurements(userId, [...bodyMerged.values()]);
    notifyBodyMeasurementsChanged(userId);

    setStatus({ state: "synced", lastSync: new Date().toISOString() });
    if (syncedWorkoutCount > 0) {
      trackEvent("Workout Sync Completed", {
        synced_workout_count: syncedWorkoutCount,
        sync_duration_ms: Date.now() - syncStartedAt,
      });
    }
  } catch (error) {
    const failure = describeSyncFailure(syncTarget, error);
    // Keep this as a warning: console.error is surfaced as a Next dev overlay
    // error and can hide the actual Supabase failure behind an empty object.
    console.warn(`[sync] Synchronization failed: ${JSON.stringify(failure)}`);
    setStatus({ state: "error", lastSync: status.lastSync, failure });
  } finally {
    inFlight = false;
    activeSyncPromise = null;
    // Jika ada permintaan sync baru selama proses berjalan, jalankan ulang
    if (rerunRequested) {
      rerunRequested = false;
      const nextUserId = rerunUserId ?? userId;
      rerunUserId = null;
      setStatus({ state: "syncing" });
      await syncAll(nextUserId);
    }
  }
  })();
  await activeSyncPromise;
}

/**
 * Panggil aman dari mana saja: hanya jalan jika dikonfigurasi, online, dan ada user.
 */
export async function requestSync(): Promise<void> {
  if (!isSyncConfigured()) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    setStatus({ state: "offline", lastSync: status.lastSync });
    return;
  }
  const userId = await getUserId();
  if (!userId) return;
  try {
    await syncAll(userId);
  } catch {
    // syncAll sudah menangani status error
  }
}
