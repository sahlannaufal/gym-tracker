import { EXERCISE_CATEGORIES } from "./exercises";

export interface ExerciseMuscles {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

// Metadata statis untuk katalog latihan bawaan. Dipisahkan dari model workout
// agar data lama, dropdown, program, dan sinkronisasi tetap kompatibel.
export const EXERCISE_MUSCLE_MAP: Record<string, ExerciseMuscles> = {
  "Bench Press (Barbell)": { primaryMuscles: ["Dada"], secondaryMuscles: ["Trisep", "Bahu depan"] },
  "Incline Bench Press (Barbell)": { primaryMuscles: ["Dada atas"], secondaryMuscles: ["Trisep", "Bahu depan"] },
  "Dumbbell Chest Press": { primaryMuscles: ["Dada"], secondaryMuscles: ["Trisep", "Bahu depan"] },
  "Incline Dumbbell Press": { primaryMuscles: ["Dada atas"], secondaryMuscles: ["Trisep", "Bahu depan"] },
  "Chest Fly / Pec Deck Machine": { primaryMuscles: ["Dada"], secondaryMuscles: ["Bahu depan"] },
  "Cable Crossover": { primaryMuscles: ["Dada"], secondaryMuscles: ["Bahu depan"] },
  "Dips (Chest Focus)": { primaryMuscles: ["Dada bawah"], secondaryMuscles: ["Trisep", "Bahu depan"] },
  "Push-Up": { primaryMuscles: ["Dada"], secondaryMuscles: ["Trisep", "Bahu depan", "Core"] },

  "Lat Pulldown": { primaryMuscles: ["Lats"], secondaryMuscles: ["Biseps", "Punggung atas"] },
  "Pull-Up / Chin-Up": { primaryMuscles: ["Lats"], secondaryMuscles: ["Biseps", "Punggung atas", "Core"] },
  "Bent-Over Barbell Row": { primaryMuscles: ["Punggung atas", "Lats"], secondaryMuscles: ["Biseps", "Bahu belakang", "Core"] },
  "Dumbbell Single-Arm Row": { primaryMuscles: ["Lats", "Punggung atas"], secondaryMuscles: ["Biseps", "Bahu belakang"] },
  "Seated Cable Row": { primaryMuscles: ["Punggung atas", "Lats"], secondaryMuscles: ["Biseps", "Bahu belakang"] },
  "T-Bar Row": { primaryMuscles: ["Punggung atas", "Lats"], secondaryMuscles: ["Biseps", "Bahu belakang"] },
  "Deadlift (Conventional / Romanian)": { primaryMuscles: ["Hamstring", "Glutes"], secondaryMuscles: ["Punggung bawah", "Punggung atas", "Core"] },
  "Hyperextension / Back Extension": { primaryMuscles: ["Punggung bawah"], secondaryMuscles: ["Glutes", "Hamstring"] },

  "Barbell Back Squat": { primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstring", "Core"] },
  "Front Squat": { primaryMuscles: ["Quadriceps"], secondaryMuscles: ["Glutes", "Core", "Punggung atas"] },
  "Leg Press": { primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstring"] },
  "Romanian Deadlift (RDL)": { primaryMuscles: ["Hamstring", "Glutes"], secondaryMuscles: ["Punggung bawah", "Core"] },
  "Leg Extension": { primaryMuscles: ["Quadriceps"], secondaryMuscles: [] },
  "Lying / Seated Leg Curl": { primaryMuscles: ["Hamstring"], secondaryMuscles: ["Betis"] },
  "Bulgarian Split Squat": { primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstring", "Core"] },
  "Calf Raise (Standing / Seated)": { primaryMuscles: ["Betis"], secondaryMuscles: [] },

  "Overhead Press / Military Press": { primaryMuscles: ["Bahu depan", "Bahu samping"], secondaryMuscles: ["Trisep", "Core"] },
  "Dumbbell Shoulder Press": { primaryMuscles: ["Bahu depan", "Bahu samping"], secondaryMuscles: ["Trisep"] },
  "Lateral Raise (Dumbbell / Cable)": { primaryMuscles: ["Bahu samping"], secondaryMuscles: ["Trapezius"] },
  "Front Raise": { primaryMuscles: ["Bahu depan"], secondaryMuscles: ["Dada atas"] },
  "Rear Delt Fly": { primaryMuscles: ["Bahu belakang"], secondaryMuscles: ["Punggung atas"] },
  "Face Pull (Cable)": { primaryMuscles: ["Bahu belakang", "Punggung atas"], secondaryMuscles: ["Trapezius"] },
  "Arnold Press": { primaryMuscles: ["Bahu depan", "Bahu samping"], secondaryMuscles: ["Trisep"] },

  "Barbell Bicep Curl": { primaryMuscles: ["Biseps"], secondaryMuscles: ["Lengan bawah"] },
  "Dumbbell Bicep Curl": { primaryMuscles: ["Biseps"], secondaryMuscles: ["Lengan bawah"] },
  "Hammer Curl": { primaryMuscles: ["Brachialis", "Lengan bawah"], secondaryMuscles: ["Biseps"] },
  "Preacher Curl": { primaryMuscles: ["Biseps"], secondaryMuscles: ["Brachialis"] },
  "Incline Dumbbell Curl": { primaryMuscles: ["Biseps"], secondaryMuscles: ["Brachialis"] },
  "Tricep Pushdown (Cable / Rope)": { primaryMuscles: ["Trisep"], secondaryMuscles: [] },
  "Skull Crusher (EZ-Bar)": { primaryMuscles: ["Trisep"], secondaryMuscles: [] },
  "Overhead Dumbbell Extension": { primaryMuscles: ["Trisep"], secondaryMuscles: [] },
  "Close-Grip Bench Press": { primaryMuscles: ["Trisep"], secondaryMuscles: ["Dada", "Bahu depan"] },

  "Ab Wheel Rollout": { primaryMuscles: ["Core"], secondaryMuscles: ["Lats", "Bahu"] },
  "Cable Crunch": { primaryMuscles: ["Perut"], secondaryMuscles: ["Core"] },
  "Hanging Leg Raise": { primaryMuscles: ["Perut bawah", "Hip flexor"], secondaryMuscles: ["Core", "Lengan bawah"] },
  "Decline Sit-Up": { primaryMuscles: ["Perut"], secondaryMuscles: ["Hip flexor"] },
  "Plank / Side Plank": { primaryMuscles: ["Core"], secondaryMuscles: ["Oblique", "Bahu", "Glutes"] },
  "Russian Twist": { primaryMuscles: ["Oblique"], secondaryMuscles: ["Core", "Hip flexor"] },
};

const CATEGORY_FALLBACK: Record<string, string> = {
  Chest: "Dada",
  Back: "Punggung",
  Legs: "Kaki",
  Shoulders: "Bahu",
  Arms: "Lengan",
  Core: "Core",
};

export function getExerciseMuscles(exerciseName: string): ExerciseMuscles {
  const metadata = EXERCISE_MUSCLE_MAP[exerciseName];
  if (metadata) return metadata;

  const category = EXERCISE_CATEGORIES.find((group) =>
    group.exercises.includes(exerciseName),
  )?.category;
  return {
    primaryMuscles: [category ? CATEGORY_FALLBACK[category] : "Lainnya"],
    secondaryMuscles: [],
  };
}
