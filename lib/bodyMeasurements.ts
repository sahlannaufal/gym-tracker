import type { BodyMeasurement, BodyMeasurementInput } from "./types";

const VERSION = 1;
export const BODY_MEASUREMENTS_CHANGED = "gym-tracker:body-measurements-changed";

const storageKey = (userId: string) =>
  `gym_tracker_body_measurements_v1_${userId}`;
const deleteKey = (userId: string) =>
  `gym_tracker_body_measurements_pending_delete_v1_${userId}`;

function valid(value: unknown): value is BodyMeasurement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.weightKg === "number" && item.weightKg > 0 &&
    typeof item.heightCm === "number" && item.heightCm > 0 &&
    (item.bodyFatPercentage === undefined || typeof item.bodyFatPercentage === "number") &&
    (item.muscleMassKg === undefined || typeof item.muscleMassKg === "number") &&
    typeof item.measuredAt === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export function loadBodyMeasurements(userId: string): BodyMeasurement[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null");
    if (!parsed || !Array.isArray(parsed.measurements)) return [];
    return parsed.measurements.filter(valid);
  } catch {
    return [];
  }
}

export function replaceBodyMeasurements(userId: string, measurements: BodyMeasurement[]) {
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify({ version: VERSION, measurements }),
  );
}

export function notifyBodyMeasurementsChanged(userId: string) {
  window.dispatchEvent(
    new CustomEvent(BODY_MEASUREMENTS_CHANGED, { detail: { userId } }),
  );
}

export function saveBodyMeasurement(
  userId: string,
  input: BodyMeasurementInput,
): BodyMeasurement {
  const now = new Date().toISOString();
  const measurement: BodyMeasurement = {
    ...input,
    id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  replaceBodyMeasurements(userId, [...loadBodyMeasurements(userId), measurement]);
  return measurement;
}

export function deleteBodyMeasurement(userId: string, id: string) {
  replaceBodyMeasurements(
    userId,
    loadBodyMeasurements(userId).filter((item) => item.id !== id),
  );
  const pending = loadBodyMeasurementDeletes(userId);
  if (!pending.includes(id)) {
    localStorage.setItem(deleteKey(userId), JSON.stringify([...pending, id]));
  }
}

export function loadBodyMeasurementDeletes(userId: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(deleteKey(userId)) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function removeBodyMeasurementDelete(userId: string, id: string) {
  localStorage.setItem(
    deleteKey(userId),
    JSON.stringify(loadBodyMeasurementDeletes(userId).filter((item) => item !== id)),
  );
}
