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

async function getUserId(): Promise<string | null> {
  if (currentUserId) return currentUserId;
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  currentUserId = data.session?.user.id ?? null;
  return currentUserId;
}

// ---------- Sync engine ----------

let inFlight = false;

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
  if (inFlight) return;
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

    replaceWorkouts([...merged.values()]);

    // 5. Routine (satu baris per user) - Pull dulu dari server sebelum upsert
    const { data: routineRow, error: routinePullErr } = await supabase
      .from("routine")
      .select("days, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (routinePullErr) throw routinePullErr;

    const localRoutine = loadRoutine();
    const hasLocalRoutine = Object.values(localRoutine.days).some((arr) => arr.length > 0);

    if (routineRow && routineRow.days) {
      // Jika server punya data, gunakan data server (atau bisa ditambahkan logic last-write-wins jika local punya timestamp)
      saveRoutine({ version: 1, days: routineRow.days as Routine["days"] });
    } else if (hasLocalRoutine) {
      // Jika server kosong tapi local ada isinya, upload ke server
      const { error: routineErr } = await supabase.from("routine").upsert({
        id: userId,
        days: localRoutine.days,
        updated_at: new Date().toISOString(),
      });
      if (routineErr) throw routineErr;
    }

    setStatus({ state: "synced", lastSync: new Date().toISOString() });
  } catch {
    setStatus({ state: "error" });
  } finally {
    inFlight = false;
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
