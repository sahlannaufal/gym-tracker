import type { ExerciseCatalogItem } from "./exerciseCatalog";
import type {
  CoachEquipmentAccess,
  CoachEquipmentId,
  CoachGoalType,
  CoachMuscleFocus,
  CoachTrainingExperience,
} from "./types";
import { decideWeeklySessions } from "./fuzzyCoachDecision";

export type CoachProgramRecommendationInput = {
  goalType: CoachGoalType;
  focus: CoachMuscleFocus;
  focuses: CoachMuscleFocus[];
  equipmentAccess: CoachEquipmentAccess;
  sessionDurationMinutes: 30 | 45 | 60;
  weeklySessionTarget: number;
  trainingExperience: CoachTrainingExperience;
  equipmentIds?: CoachEquipmentId[];
  variation?: number;
  catalog: ExerciseCatalogItem[];
};

export type CoachProgramDraft = {
  name: string;
  /** Nama katalog dipakai oleh pencatat latihan/tutorial yang sudah ada. */
  exercises: string[];
  /** ID katalog menjadi identitas stabil gerakan Coach. */
  exerciseIds: string[];
};

export type CoachProgramRecommendation = {
  /** Deterministic exercise selection variant so apply can revalidate the preview. */
  variant?: number;
  splitName: string;
  programs: CoachProgramDraft[];
  summary: string;
  restDays: number;
  reasons: string[];
  fuzzyConfidence: number;
};

type SessionKey = "fullA" | "fullB" | "fullC" | "pushA" | "pushB" | "pullA" | "pullB" | "legsA" | "legsB" | "upperA" | "upperB" | "lowerA" | "lowerB";

const focusLabels: Record<CoachMuscleFocus, string> = {
  full_body: "Full Body", chest: "Dada", back: "Punggung", shoulders: "Bahu", arms: "Lengan", core: "Core", legs: "Kaki",
};
const goalLabels: Record<CoachGoalType, string> = {
  build_muscle: "Membangun massa otot",
  lose_fat: "Menurunkan lemak tubuh",
  build_strength: "Meningkatkan kekuatan",
  general_fitness: "Meningkatkan kebugaran umum",
};
const focusCategories: Record<CoachMuscleFocus, string[]> = {
  full_body: [], chest: ["chest"], back: ["back"], shoulders: ["shoulders"],
  arms: ["upper arms", "lower arms"], core: ["waist"], legs: ["upper legs", "lower legs"],
};
const categoryLabels: Record<string, string[]> = {
  chest: ["chest"], back: ["back"], shoulders: ["shoulders"],
  arms: ["upper arms", "lower arms"], legs: ["upper legs", "lower legs"],
  "upper legs": ["upper legs"], "lower legs": ["lower legs"],
  "upper arms": ["upper arms"], waist: ["waist"],
};
const focusSessions: Record<CoachMuscleFocus, SessionKey[]> = {
  full_body: [], chest: ["pushA", "pushB", "upperA", "upperB"],
  back: ["pullA", "pullB", "upperA", "upperB"],
  shoulders: ["pushA", "pushB", "upperA", "upperB"],
  arms: ["pushA", "pullA", "upperA", "upperB"],
  core: ["fullA", "fullB", "upperA", "upperB"],
  legs: ["legsA", "legsB", "lowerA", "lowerB"],
};
const sessionNames: Record<SessionKey, string> = {
  fullA: "Full Body A", fullB: "Full Body B", fullC: "Full Body C",
  pushA: "Push A", pushB: "Push B", pullA: "Pull A", pullB: "Pull B",
  legsA: "Legs A", legsB: "Legs B", upperA: "Upper A", upperB: "Upper B",
  lowerA: "Lower A", lowerB: "Lower B",
};

function chooseSplit(input: CoachProgramRecommendationInput, count: number): { name: string; keys: SessionKey[] } {
  const activeFocus = input.focuses[0] ?? input.focus;
  const allMusclesSelected = input.focuses.length === Object.keys(focusCategories).length - 1;
  const focused = !allMusclesSelected && (input.focuses.length > 0 || activeFocus !== "full_body");
  if (count === 1) return { name: "Full Body", keys: [focused ? focusSessions[activeFocus][0] : "fullA"] };
  if (count === 2) return focused
    ? { name: `Fokus ${focusLabels[activeFocus]} + Full Body`, keys: [focusSessions[activeFocus][0], "fullB"] }
    : { name: "Upper / Lower", keys: ["upperA", "lowerA"] };
  if (count === 3) return focused
    ? { name: `Fokus ${focusLabels[activeFocus]} + Full Body`, keys: [focusSessions[activeFocus][0], "lowerA", "fullB"] }
    : input.trainingExperience === "beginner"
      ? { name: "Full Body A/B/C", keys: ["fullA", "fullB", "fullC"] }
      : { name: "Push / Pull / Legs", keys: ["pushA", "pullA", "legsA"] };
  if (count === 4) return { name: "Upper / Lower A/B", keys: ["upperA", "lowerA", "upperB", "lowerB"] };
  if (count === 5) return { name: "Upper / Lower + Fokus", keys: focused
    ? ["upperA", "lowerA", focusSessions[activeFocus][0], "lowerB", focusSessions[activeFocus][1]]
    : ["upperA", "lowerA", "pushA", "pullA", "legsA"] };
  return { name: "Push / Pull / Legs A/B", keys: ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB"] };
}

function categoriesForSession(key: SessionKey): string[] {
  if (key.startsWith("push")) return ["chest", "shoulders", "upper arms", "waist"];
  if (key.startsWith("pull")) return ["back", "shoulders", "upper arms", "waist"];
  if (key.startsWith("legs") || key.startsWith("lower")) return ["upper legs", "upper legs", "lower legs", "waist"];
  if (key.startsWith("upper")) return ["chest", "back", "shoulders", "upper arms", "waist"];
  return key === "fullA"
    ? ["upper legs", "chest", "back", "shoulders", "upper arms", "waist"]
    : key === "fullB"
      ? ["upper legs", "back", "chest", "upper legs", "upper arms", "waist"]
      : ["upper legs", "chest", "back", "lower legs", "shoulders", "waist"];
}

export function isCoachExerciseEquipmentAllowed(
  item: ExerciseCatalogItem,
  equipmentIds?: CoachEquipmentId[],
  equipmentAccess: CoachEquipmentAccess = "full_gym",
): boolean {
  const equipment = item.equipment.toLowerCase();
  const selected = equipmentIds;
  if (!selected?.length) {
    if (equipmentAccess === "bodyweight") return equipment === "body weight";
    if (equipmentAccess === "home_gym") return ["body weight", "dumbbell", "band", "kettlebell", "barbell"].includes(equipment);
    return true;
  }
  if (equipment === "body weight") {
    return selected.includes("bodyweight") || (selected.includes("pullup_bar") && /pull-up|chin-up/i.test(item.name));
  }
  if (/bench/i.test(item.name) && !selected.includes("bench")) return false;
  const equipmentMap: Record<string, CoachEquipmentId[]> = {
    dumbbell: ["dumbbells"], barbell: ["barbell"], band: ["bands"],
    cable: ["cable_machine"], "lever machine": ["machines"], "smith machine": ["machines"],
    "sled machine": ["machines"], kettlebell: ["kettlebell"], rope: ["cable_machine"],
    weighted: ["dumbbells", "barbell", "kettlebell"],
  };
  const requirements = equipmentMap[equipment];
  return Boolean(requirements?.some((id) => selected.includes(id)));
}

export function isCoachExerciseEligible(item: ExerciseCatalogItem): boolean {
  return !/stretch|warm.?up|cardio|jumping jack|left hook.*boxing/i.test(item.name) && item.category !== "cardio";
}

/** Alternatives stay within the same primary target muscle and selected equipment. */
export function getCoachExerciseAlternatives(
  catalog: ExerciseCatalogItem[],
  currentId: string,
  equipmentIds: CoachEquipmentId[] | undefined,
  equipmentAccess: CoachEquipmentAccess,
  excludedIds: Set<string> = new Set(),
): ExerciseCatalogItem[] {
  const current = catalog.find((item) => item.id === currentId);
  if (!current) return [];
  return catalog
    .filter((item) => item.id !== current.id)
    .filter((item) => item.category === current.category && item.target === current.target)
    .filter((item) => !excludedIds.has(item.id))
    .filter(isCoachExerciseEligible)
    .filter((item) => isCoachExerciseEquipmentAllowed(item, equipmentIds, equipmentAccess))
    .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
}

function preferredNameScore(name: string, category: string, goalType: CoachGoalType): number {
  const value = name.toLowerCase();
  const terms: Record<string, string[]> = {
    chest: ["bench press", "chest press", "push-up", "chest dip", "chest fly"],
    back: ["row", "pulldown", "pull-up", "chin-up"],
    shoulders: ["shoulder press", "overhead press", "lateral raise", "rear delt"],
    "upper arms": ["curl", "tricep", "bicep", "extension"],
    "lower arms": ["wrist", "forearm"],
    "upper legs": ["squat", "deadlift", "leg press", "lunge", "leg curl", "leg extension"],
    "lower legs": ["calf raise"], waist: ["plank", "crunch", "sit-up", "twist"],
  };
  const base = (terms[category] ?? []).reduce((score, term) => score + (value.includes(term) ? 2 : 0), 0);
  if (goalType === "build_strength" && /squat|deadlift|bench press|row|overhead press/i.test(value)) return base + 4;
  if (goalType === "general_fitness" && /olympic|plyometric|jump/i.test(value)) return base - 4;
  return base;
}

function exerciseLimit(duration: 30 | 45 | 60, experience: CoachTrainingExperience): number {
  const base = duration === 30 ? 4 : duration === 45 ? 5 : 6;
  return experience === "beginner" ? Math.min(base, 5) : base;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getCoachProgramRecommendation(input: CoachProgramRecommendationInput): CoachProgramRecommendation {
  const variation = Number.isInteger(input.variation) && (input.variation ?? 0) >= 0
    ? input.variation as number
    : 0;
  const decision = decideWeeklySessions({ target: input.weeklySessionTarget, duration: input.sessionDurationMinutes, experience: input.trainingExperience });
  const sessions = Math.max(1, Math.min(6, decision.sessions));
  const split = chooseSplit(input, sessions);
  const limit = exerciseLimit(input.sessionDurationMinutes, input.trainingExperience);
  const available = input.catalog.filter((item) =>
    isCoachExerciseEquipmentAllowed(item, input.equipmentIds, input.equipmentAccess) && isCoachExerciseEligible(item),
  );
  const programs = split.keys.map((key) => {
    const slots = categoriesForSession(key);
    const selectedInSession = new Set<string>();
    const priorities = input.focuses.length === Object.keys(focusCategories).length - 1
      ? []
      : input.focuses.flatMap((focus) => focusCategories[focus]);
    priorities.forEach((focusCategory, priorityIndex) => {
      const index = slots.indexOf(focusCategory);
      const targetIndex = Math.min(priorityIndex, slots.length - 1);
      if (index >= 0 && index > targetIndex) {
        slots.splice(index, 1);
        slots.splice(targetIndex, 0, focusCategory);
      }
    });
    const selected = slots.slice(0, limit).map((category, slotIndex) => {
      const matches = available
        .filter((item) => (categoryLabels[category] ?? [category]).includes(item.category))
        .sort((a, b) => {
          const scoreA = (a.popular ? 5 : 0) + preferredNameScore(a.name, category, input.goalType);
          const scoreB = (b.popular ? 5 : 0) + preferredNameScore(b.name, category, input.goalType);
          return scoreB - scoreA || a.id.localeCompare(b.id);
        });
      const choices = matches.filter((item) => !selectedInSession.has(item.id));
      // Keep exercise slots in place, but rotate the candidate movement for
      // each session/slot so regeneration changes exercises instead of order.
      const offset = choices.length
        ? (variation + stableHash(`${key}:${slotIndex}:${category}`)) % choices.length
        : 0;
      const match = choices[offset];
      if (match) selectedInSession.add(match.id);
      return match;
    }).filter((item): item is ExerciseCatalogItem => Boolean(item));
    return {
      name: `Coach · ${sessionNames[key]}`,
      exercises: selected.map((item) => item.name),
      exerciseIds: selected.map((item) => item.id),
    };
  });
  const availableEquipment = [...new Set(available.map((item) => item.equipment))];
  return {
    variant: variation,
    splitName: split.name,
    programs,
    restDays: 7 - sessions,
    reasons: [
      `Tujuan dipilih: ${goalLabels[input.goalType]}.`,
      input.focuses.length === 0
        ? "Tidak ada otot khusus yang diprioritaskan; program dibuat seimbang."
        : input.focuses.length === Object.keys(focusCategories).length - 1
          ? "Semua otot dipilih; program dibuat seimbang."
          : `Fokus prioritas: ${input.focuses.map((focus) => focusLabels[focus]).join(", ")}.`,
      ...decision.reasons,
      `${available.length} gerakan dari katalog tersedia setelah dicocokkan dengan alat pilihan.`,
      `Setiap gerakan menyimpan ID katalog agar tutorial dan pencatatan memakai item yang sama${availableEquipment.length ? ` (${availableEquipment.slice(0, 4).join(", ")})` : ""}.`,
    ],
    fuzzyConfidence: decision.confidence,
    summary: `${split.name} · ${sessions} sesi/minggu · ${input.sessionDurationMinutes}+ menit`,
  };
}
