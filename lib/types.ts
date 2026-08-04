export interface Workout {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  createdAt: string;
}

export type WorkoutInput = Omit<Workout, "id" | "createdAt">;

export interface WorkoutStore {
  version: number;
  workouts: Workout[];
}
