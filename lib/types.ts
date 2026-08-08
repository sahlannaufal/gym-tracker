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
