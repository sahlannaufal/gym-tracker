"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteWorkout,
  loadWorkouts,
  saveWorkout,
  updateWorkout as updateStoredWorkout,
} from "./storage";
import { requestSync } from "./sync";
import type { Workout, WorkoutInput } from "./types";

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWorkouts(loadWorkouts());
    setIsLoaded(true);
  }, []);

  const addWorkout = useCallback((input: WorkoutInput) => {
    const workout = saveWorkout(input);
    setWorkouts((prev) => [...prev, workout]);
    requestSync();
    return workout;
  }, []);

  const updateWorkout = useCallback(
    (id: string, changes: Pick<Workout, "weight" | "reps">) => {
      const updated = updateStoredWorkout(id, changes);
      if (!updated) return null;
      setWorkouts((prev) =>
        prev.map((workout) => (workout.id === id ? updated : workout)),
      );
      requestSync();
      return updated;
    },
    [],
  );

  const removeWorkout = useCallback((id: string) => {
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    requestSync();
  }, []);

  return { workouts, isLoaded, addWorkout, updateWorkout, removeWorkout };
}
