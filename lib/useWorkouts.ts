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
import { trackEvent } from "./analytics";
import { getExerciseCategory, wasRecordedOffline } from "./analyticsHelpers";

export type WorkoutTrackingContext = {
  inputMethod?: "manual_form" | "quick_log";
  prefilledFromLastSession?: boolean;
};

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWorkouts(loadWorkouts());
    setIsLoaded(true);
  }, []);

  const addWorkout = useCallback((input: WorkoutInput, context: WorkoutTrackingContext = {}) => {
    const workout = saveWorkout(input);
    setWorkouts((prev) => [...prev, workout]);
    trackEvent("Workout Logged", {
      workout_id: workout.id,
      exercise_name: workout.exercise,
      exercise_category: getExerciseCategory(workout.exercise),
      weight_kg: workout.weight,
      reps: workout.reps,
      sets: workout.sets,
      workout_date: workout.date,
      input_method: context.inputMethod ?? "manual_form",
      recorded_offline: wasRecordedOffline(),
    });
    if (context.inputMethod === "quick_log") {
      trackEvent("Quick Log Used", {
        exercise_name: workout.exercise,
        prefilled_from_last_session: context.prefilledFromLastSession ?? false,
      });
    }
    requestSync();
    return workout;
  }, []);

  const updateWorkout = useCallback(
    (id: string, changes: Pick<Workout, "weight" | "reps">) => {
      const previous = loadWorkouts().find((workout) => workout.id === id);
      const updated = updateStoredWorkout(id, changes);
      if (!updated) return null;
      setWorkouts((prev) =>
        prev.map((workout) => (workout.id === id ? updated : workout)),
      );
      const updatedFields = (["weight", "reps"] as const).filter(
        (field) => previous?.[field] !== updated[field],
      );
      if (updatedFields.length > 0) {
        trackEvent("Workout Updated", {
          workout_id: updated.id,
          exercise_name: updated.exercise,
          updated_fields: updatedFields,
          recorded_offline: wasRecordedOffline(),
        });
      }
      requestSync();
      return updated;
    },
    [],
  );

  const removeWorkout = useCallback((id: string) => {
    const workout = loadWorkouts().find((item) => item.id === id);
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    if (workout) {
      trackEvent("Workout Deleted", {
        workout_id: workout.id,
        exercise_name: workout.exercise,
      });
    }
    requestSync();
  }, []);

  return { workouts, isLoaded, addWorkout, updateWorkout, removeWorkout };
}
