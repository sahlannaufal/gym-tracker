export interface Workout {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export type WorkoutInput = Omit<Workout, "id" | "createdAt">;

export interface WorkoutStore {
  version: number;
  workouts: Workout[];
}

export const WEEKDAYS = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const DAY_LABELS: Record<Weekday, string> = {
  minggu: "Minggu",
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
};

export const DAY_ORDER: Weekday[] = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
];

export interface Routine {
  version: number;
  days: Record<Weekday, string[]>;
  updatedAt?: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  exercises: string[];
  /** Catalog IDs parallel to exercises for Coach generated programs. */
  exerciseIds?: Array<string | null>;
  /** Status versi program Coach; program manual tidak memiliki status ini. */
  coachStatus?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ProgramAssignment {
  programId: string | null;
  updatedAt: string;
}

export interface TrainingProgramStore {
  version: number;
  programs: TrainingProgram[];
  schedule: Record<string, ProgramAssignment>;
  updatedAt?: string;
}

export interface BodyMeasurement {
  id: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CoachGoalType = "build_muscle" | "lose_fat" | "build_strength" | "general_fitness";
export type CoachTrainingExperience = "beginner" | "intermediate" | "advanced";
export type CoachEquipmentAccess = "full_gym" | "limited_gym" | "home_gym" | "bodyweight";
export type CoachMuscleFocus = "full_body" | "chest" | "back" | "shoulders" | "arms" | "core" | "legs";

// Iterasi pertama hanya mendukung satu goal aktif agar arahan Coach tetap
// sederhana untuk pemula. Target/program dapat diperbarui tanpa membuat goal
// baru.
export interface CoachGoal {
  version: 1;
  type: CoachGoalType;
  focus: CoachMuscleFocus;
  /** Nol priority berarti program seimbang/full body; dipertahankan terpisah dari legacy focus. */
  focuses?: CoachMuscleFocus[];
  weeklySessionTarget: number;
  sessionDurationMinutes: 30 | 45 | 60;
  // programId dipertahankan untuk migrasi goal Coach versi awal.
  programId: string | null;
  programIds: string[];
  trainingExperience: CoachTrainingExperience;
  equipmentAccess: CoachEquipmentAccess;
  /** Peralatan spesifik yang tersedia; opsional untuk data Coach lama. */
  equipmentIds?: CoachEquipmentId[];
  startedAt: string;
  updatedAt: string;
}

export type CoachEquipmentId =
  | "dumbbells" | "barbell" | "bench" | "bands" | "pullup_bar"
  | "cable_machine" | "machines" | "kettlebell" | "bodyweight";

export type CoachCheckIn = {
  id: string;
  weekStart: string;
  completedSessions: number;
  difficulty: "easy" | "right" | "hard";
  recovery: "low" | "okay" | "good";
  scheduleFit: "no" | "partly" | "yes";
  equipmentIssues: boolean;
  note?: string;
  createdAt: string;
};

export interface CustomExercise {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomExerciseStore {
  version: 1;
  exercises: CustomExercise[];
  updatedAt?: string;
}

export type BodyMeasurementInput = Omit<
  BodyMeasurement,
  "id" | "createdAt" | "updatedAt"
>;
