import { EXERCISE_CATEGORIES } from "./constants/exercises";

export function getExerciseCategory(exerciseName: string): string {
  return (
    EXERCISE_CATEGORIES.find((group) =>
      group.exercises.includes(exerciseName),
    )?.category ?? "Custom"
  );
}

export function wasRecordedOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}
