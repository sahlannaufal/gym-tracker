"use client";

import { useCallback, useEffect, useState } from "react";
import { loadTrainingProgramStore, saveTrainingProgramStore } from "./storage";
import { requestSync } from "./sync";
import type { TrainingProgram, TrainingProgramStore } from "./types";

function makeId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useTrainingPrograms() {
  const [store, setStore] = useState<TrainingProgramStore | null>(null);

  useEffect(() => {
    const refresh = () => setStore(loadTrainingProgramStore());
    refresh();
    window.addEventListener("training-programs-changed", refresh);
    requestSync().then(refresh);
    return () => window.removeEventListener("training-programs-changed", refresh);
  }, []);

  const mutate = useCallback(
    (updater: (current: TrainingProgramStore, now: string) => TrainingProgramStore) => {
      const current = loadTrainingProgramStore();
      const now = new Date().toISOString();
      const next = { ...updater(current, now), updatedAt: now };
      saveTrainingProgramStore(next);
      setStore(next);
      requestSync();
    },
    [],
  );

  const addProgram = useCallback((name: string, exercises: string[]) => {
    const now = new Date().toISOString();
    const program: TrainingProgram = {
      id: makeId(), name: name.trim(), exercises, createdAt: now, updatedAt: now,
    };
    mutate((current) => ({ ...current, programs: [...current.programs, program] }));
    return program;
  }, [mutate]);

  const updateProgram = useCallback((id: string, name: string, exercises: string[]) => {
    mutate((current, now) => ({
      ...current,
      programs: current.programs.map((program) =>
        program.id === id ? { ...program, name: name.trim(), exercises, updatedAt: now } : program,
      ),
    }));
  }, [mutate]);

  const deleteProgram = useCallback((id: string) => {
    mutate((current) => ({
      ...current,
      programs: current.programs.filter((program) => program.id !== id),
      schedule: Object.fromEntries(
        Object.entries(current.schedule).filter(([, assignment]) => assignment.programId !== id),
      ),
    }));
  }, [mutate]);

  const setAssignment = useCallback((date: string, programId: string | null) => {
    mutate((current, now) => ({
      ...current,
      schedule: { ...current.schedule, [date]: { programId, updatedAt: now } },
    }));
  }, [mutate]);

  const clearAssignment = useCallback((date: string) => {
    mutate((current) => {
      const schedule = { ...current.schedule };
      delete schedule[date];
      return { ...current, schedule };
    });
  }, [mutate]);

  return { store, addProgram, updateProgram, deleteProgram, setAssignment, clearAssignment };
}
