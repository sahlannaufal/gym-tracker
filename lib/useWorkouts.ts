"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteWorkout, loadWorkouts, saveWorkout } from "./storage";
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
  }, []);

  const removeWorkout = useCallback((id: string) => {
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workouts, isLoaded, addWorkout, removeWorkout };
}
