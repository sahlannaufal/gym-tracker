import { isSyncConfigured, supabase } from "./supabase/client";
import {
  loadPendingDeletes,
  loadRoutine,
  loadWorkouts,
  removePendingDelete,
  replaceWorkouts,
  saveRoutine,
} from "./storage";
import type { Routine, Workout } from "./types";
import type { BodyMeasurement } from "./types";
import {
  loadBodyMeasurementDeletes,
  loadBodyMeasurements,
  notifyBodyMeasurementsChanged,
  removeBodyMeasurementDelete,
  replaceBodyMeasurements,
} from "./bodyMeasurements";

// ---------- Status sinkronisasi (pub-sub ringan untuk UI) ----------

export type SyncState =
  | "unconfigured"
  | "idle"
  | "syncing"
  | "synced"
  | "error";

export interface SyncStatus {
  state: SyncState;
  lastSync?: string;
}

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
  currentUserId = id;
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
    return;
  }
  inFlight = true;
  setStatus({ state: "syncing" });
  try {
    // 1. Proses hapus yang tertunda saat offline
    for (const id of loadPendingDeletes()) {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (!error) removePendingDelete(id);
    }
    const pending = new Set(loadPendingDeletes());

    // 2. Pull server
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    const serverRows = (data ?? []) as WorkoutRow[];

    // 3. Merge last-write-wins
    const local = loadWorkouts();
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
    }

    // Jangan timpa LocalStorage dengan snapshot basi: baca ulang state &
    // tombstone terbaru. Item yang disimpan selama sync dipertahankan; item
    // yang dihapus selama sync (tombstone baru belum diproses) dibuang dari
    // hasil merge agar tidak tertulis kembali (dan tidak ter-upload ulang).
    const latestLocal = loadWorkouts();
    const latestPending = new Set(loadPendingDeletes());
    for (const id of [...merged.keys()]) {
      if (latestPending.has(id)) merged.delete(id);
    }
    for (const w of latestLocal) {
      if (!merged.has(w.id) && !latestPending.has(w.id)) {
        merged.set(w.id, w);
      }
    }
    replaceWorkouts([...merged.values()]);

    // 5. Routine (satu baris per user) - last-write-wins by updated_at
    const { data: routineRow, error: routinePullErr } = await supabase
      .from("routine")
      .select("days, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (routinePullErr) throw routinePullErr;

    const localRoutine = loadRoutine();
    const localHasContent = Object.values(localRoutine.days).some(
      (arr) => arr.length > 0
    );
    const serverDays = (routineRow?.days ?? {}) as Routine["days"];
    const serverHasContent = Object.values(serverDays).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    const serverUpdatedAt = routineRow?.updated_at as string | undefined;

    // Local lebih baru / belum ada di server -> upload
    const localUpdatedAt = localRoutine.updatedAt;
    const localIsNewer =
      !!localUpdatedAt &&
      (!serverUpdatedAt || localUpdatedAt > serverUpdatedAt);

    if (localHasContent && (!serverHasContent || localIsNewer)) {
      const { error: routineErr } = await supabase.from("routine").upsert({
        id: userId,
        days: localRoutine.days,
        updated_at: localUpdatedAt ?? new Date().toISOString(),
      });
      if (routineErr) throw routineErr;
    } else if (serverHasContent) {
      // Server lebih baru -> tarik ke lokal (ikut sertakan timestamp server)
      saveRoutine({ version: 1, days: serverDays, updatedAt: serverUpdatedAt });
    }

    // 6. Riwayat komposisi tubuh — cache lokal dipisahkan per user.
    for (const id of loadBodyMeasurementDeletes(userId)) {
      const { error: deleteError } = await supabase
        .from("body_measurements")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (!deleteError) removeBodyMeasurementDelete(userId, id);
    }
    const bodyPending = new Set(loadBodyMeasurementDeletes(userId));
    const { data: bodyData, error: bodyError } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId);
    if (bodyError) throw bodyError;

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
  } catch {
    setStatus({ state: "error" });
  } finally {
    inFlight = false;
    // Jika ada permintaan sync baru selama proses berjalan, jalankan ulang
    if (rerunRequested) {
      rerunRequested = false;
      setStatus({ state: "syncing" });
      void syncAll(userId).catch(() => undefined);
    }
  }
}

/**
 * Panggil aman dari mana saja: hanya jalan jika dikonfigurasi, online, dan ada user.
 */
export async function requestSync(): Promise<void> {
  if (!isSyncConfigured()) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const userId = await getUserId();
  if (!userId) return;
  try {
    await syncAll(userId);
  } catch {
    // syncAll sudah menangani status error
  }
}
