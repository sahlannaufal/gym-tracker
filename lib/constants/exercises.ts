export interface ExerciseCategory {
  category: string;
  exercises: string[];
}

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  {
    category: "Chest",
    exercises: [
      "Bench Press (Barbell)",
      "Incline Bench Press (Barbell)",
      "Dumbbell Chest Press",
      "Incline Dumbbell Press",
      "Chest Fly / Pec Deck Machine",
      "Cable Crossover",
      "Dips (Chest Focus)",
      "Push-Up",
    ],
  },
  {
    category: "Back",
    exercises: [
      "Lat Pulldown",
      "Pull-Up / Chin-Up",
      "Bent-Over Barbell Row",
      "Dumbbell Single-Arm Row",
      "Seated Cable Row",
      "T-Bar Row",
      "Deadlift (Conventional / Romanian)",
      "Hyperextension / Back Extension",
    ],
  },
  {
    category: "Legs",
    exercises: [
      "Barbell Back Squat",
      "Front Squat",
      "Leg Press",
      "Romanian Deadlift (RDL)",
      "Leg Extension",
      "Lying / Seated Leg Curl",
      "Bulgarian Split Squat",
      "Calf Raise (Standing / Seated)",
    ],
  },
  {
    category: "Shoulders",
    exercises: [
      "Overhead Press / Military Press",
      "Dumbbell Shoulder Press",
      "Lateral Raise (Dumbbell / Cable)",
      "Front Raise",
      "Rear Delt Fly",
      "Face Pull (Cable)",
      "Arnold Press",
    ],
  },
  {
    category: "Arms",
    exercises: [
      "Barbell Bicep Curl",
      "Dumbbell Bicep Curl",
      "Hammer Curl",
      "Preacher Curl",
      "Incline Dumbbell Curl",
      "Tricep Pushdown (Cable / Rope)",
      "Skull Crusher (EZ-Bar)",
      "Overhead Dumbbell Extension",
      "Close-Grip Bench Press",
    ],
  },
  {
    category: "Core",
    exercises: [
      "Ab Wheel Rollout",
      "Cable Crunch",
      "Hanging Leg Raise",
      "Decline Sit-Up",
      "Plank / Side Plank",
      "Russian Twist",
    ],
  },
];

export const CUSTOM_EXERCISE_VALUE = "__custom__";
