"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCustomExerciseStore, saveCustomExerciseStore } from "./storage";
import { requestSync } from "./sync";
import type { CustomExercise } from "./types";

function makeId(): string {
  return `ce_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);

  useEffect(() => {
    const refresh = () => setCustomExercises(loadCustomExerciseStore().exercises);
    refresh();
    window.addEventListener("custom-exercises-changed", refresh);
    requestSync().then(refresh);
    return () => window.removeEventListener("custom-exercises-changed", refresh);
  }, []);

  const addCustomExercise = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const current = loadCustomExerciseStore();
    const existing = current.exercises.find(
      (item) => item.name.localeCompare(trimmed, "id", { sensitivity: "accent" }) === 0,
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const exercise: CustomExercise = { id: makeId(), name: trimmed, createdAt: now, updatedAt: now };
    const next = { version: 1 as const, exercises: [...current.exercises, exercise], updatedAt: now };
    saveCustomExerciseStore(next);
    setCustomExercises(next.exercises);
    requestSync();
    return exercise;
  }, []);

  return { customExercises, addCustomExercise };
}
