import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getCoachExerciseAlternatives,
  getCoachProgramRecommendation,
  type CoachProgramRecommendation,
} from "@/lib/coachProgramRecommendation";
import type { ExerciseCatalogItem } from "@/lib/exerciseCatalog";
import type { CoachEquipmentAccess, CoachEquipmentId, CoachGoalType, CoachMuscleFocus, CoachTrainingExperience } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const goalTypes: CoachGoalType[] = ["build_muscle", "lose_fat", "build_strength", "general_fitness"];
const focuses: CoachMuscleFocus[] = ["full_body", "chest", "back", "shoulders", "arms", "core", "legs"];
const experiences: CoachTrainingExperience[] = ["beginner", "intermediate", "advanced"];
const equipmentAccessOptions: CoachEquipmentAccess[] = ["full_gym", "limited_gym", "home_gym", "bodyweight"];
const equipmentOptions: CoachEquipmentId[] = [
  "dumbbells", "barbell", "bench", "bands", "pullup_bar", "cable_machine", "machines", "kettlebell", "bodyweight",
];

type AppliedProfile = {
  version: 1;
  type: CoachGoalType;
  focus: CoachMuscleFocus;
  focuses: CoachMuscleFocus[];
  weeklySessionTarget: number;
  sessionDurationMinutes: 30 | 45 | 60;
  programId: string | null;
  programIds: string[];
  trainingExperience: CoachTrainingExperience;
  equipmentAccess: CoachEquipmentAccess;
  equipmentIds: CoachEquipmentId[];
  startedAt: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProfile(value: unknown, recommendation: CoachProgramRecommendation): AppliedProfile | null {
  if (!isRecord(value)) return null;
  const profile = value;
  const programIds = profile.programIds;
  const equipmentIds = profile.equipmentIds;
  const selectedFocuses = profile.focuses;
  const timestamps = [profile.startedAt, profile.updatedAt];

  if (
    profile.version !== 1 ||
    typeof profile.type !== "string" || !goalTypes.includes(profile.type as CoachGoalType) ||
    typeof profile.focus !== "string" || !focuses.includes(profile.focus as CoachMuscleFocus) ||
    !Array.isArray(selectedFocuses) || selectedFocuses.length > focuses.length - 1 ||
    new Set(selectedFocuses).size !== selectedFocuses.length ||
    !selectedFocuses.every((item) => typeof item === "string" && item !== "full_body" && focuses.includes(item as CoachMuscleFocus)) ||
    (selectedFocuses.length ? profile.focus !== selectedFocuses[0] : profile.focus !== "full_body") ||
    !Number.isInteger(profile.weeklySessionTarget) || (profile.weeklySessionTarget as number) < 1 || (profile.weeklySessionTarget as number) > 6 ||
    ![30, 45, 60].includes(profile.sessionDurationMinutes as number) ||
    typeof profile.trainingExperience !== "string" || !experiences.includes(profile.trainingExperience as CoachTrainingExperience) ||
    typeof profile.equipmentAccess !== "string" || !equipmentAccessOptions.includes(profile.equipmentAccess as CoachEquipmentAccess) ||
    !Array.isArray(equipmentIds) || equipmentIds.length > equipmentOptions.length ||
    !equipmentIds.every((item) => typeof item === "string" && equipmentOptions.includes(item as CoachEquipmentId)) ||
    !timestamps.every((item) => typeof item === "string" && Number.isFinite(Date.parse(item))) ||
    !Array.isArray(programIds) || programIds.length !== recommendation.programs.length ||
    !programIds.every((item) => typeof item === "string" && /^p_[a-zA-Z0-9_-]{6,100}$/.test(item)) ||
    new Set(programIds).size !== programIds.length ||
    profile.programId !== (programIds[0] ?? null)
  ) return null;

  return profile as unknown as AppliedProfile;
}

let catalogCache: ExerciseCatalogItem[] | null = null;
async function loadCatalog(): Promise<ExerciseCatalogItem[]> {
  if (catalogCache) return catalogCache;
  const content = await readFile(join(process.cwd(), "public/data/exercises/catalog.json"), "utf8");
  const parsed: unknown = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("Exercise catalogue has an invalid format.");
  catalogCache = parsed as ExerciseCatalogItem[];
  return catalogCache;
}

export async function POST(request: Request) {
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userResult, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !userResult.user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const { data: entitlement, error: entitlementError } = await supabase
    .from("coach_entitlements")
    .select("status,current_period_end")
    .eq("user_id", userResult.user.id)
    .maybeSingle();
  if (entitlementError) return NextResponse.json({ error: "entitlement_unavailable" }, { status: 503 });
  const entitled = entitlement?.status === "active" &&
    (!entitlement.current_period_end || Date.parse(entitlement.current_period_end) > Date.now());
  if (!entitled) return NextResponse.json({ error: "premium_required" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!isRecord(body) || !isRecord(body.recommendation) || !Array.isArray(body.recommendation.programs)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const submittedRecommendation = body.recommendation as unknown as CoachProgramRecommendation;
    const profile = parseProfile(body.profile, submittedRecommendation);
    if (!profile) return NextResponse.json({ error: "invalid_profile" }, { status: 400 });
    const variant = submittedRecommendation.variant ?? 0;
    if (!Number.isInteger(variant) || variant < 0 || variant > 1000) {
      return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });
    }

    const catalog = await loadCatalog();
    const canonicalRecommendation = getCoachProgramRecommendation({
      goalType: profile.type,
      focus: profile.focus,
      focuses: profile.focuses,
      weeklySessionTarget: profile.weeklySessionTarget,
      sessionDurationMinutes: profile.sessionDurationMinutes,
      trainingExperience: profile.trainingExperience,
      equipmentIds: profile.equipmentIds,
      equipmentAccess: profile.equipmentAccess,
      variation: variant,
      catalog,
    });
    if (
      submittedRecommendation.splitName !== canonicalRecommendation.splitName ||
      submittedRecommendation.programs.length !== canonicalRecommendation.programs.length
    ) return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });

    // Keep the server-generated split and session structure fixed. A user may
    // only replace a movement with a catalog item for the same target muscle
    // and available equipment; arbitrary client changes are rejected.
    const validatedPrograms = [];
    for (let programIndex = 0; programIndex < canonicalRecommendation.programs.length; programIndex += 1) {
      const canonicalProgram = canonicalRecommendation.programs[programIndex];
      const submittedProgram = submittedRecommendation.programs[programIndex];
      const usedExerciseIds = new Set<string>();
      if (
        !isRecord(submittedProgram) || submittedProgram.name !== canonicalProgram.name ||
        !Array.isArray(submittedProgram.exerciseIds) ||
        !Array.isArray(submittedProgram.exercises) ||
        submittedProgram.exerciseIds.length !== canonicalProgram.exerciseIds.length ||
        submittedProgram.exercises.length !== canonicalProgram.exercises.length
      ) return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });

      const exerciseIds: string[] = [];
      const exercises: string[] = [];
      for (let exerciseIndex = 0; exerciseIndex < canonicalProgram.exerciseIds.length; exerciseIndex += 1) {
        const baseId = canonicalProgram.exerciseIds[exerciseIndex];
        const exerciseId = submittedProgram.exerciseIds[exerciseIndex];
        if (typeof exerciseId !== "string" || usedExerciseIds.has(exerciseId)) {
          return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });
        }

        const base = catalog.find((item) => item.id === baseId);
        const replacement = catalog.find((item) => item.id === exerciseId);
        if (!base || !replacement || submittedProgram.exercises[exerciseIndex] !== replacement.name) {
          return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });
        }
        if (exerciseId !== baseId) {
          const alternatives = getCoachExerciseAlternatives(
            catalog,
            baseId,
            profile.equipmentIds,
            profile.equipmentAccess,
            usedExerciseIds,
          );
          if (!alternatives.some((item) => item.id === exerciseId)) {
            return NextResponse.json({ error: "recommendation_mismatch" }, { status: 400 });
          }
        }
        usedExerciseIds.add(exerciseId);
        exerciseIds.push(exerciseId);
        exercises.push(replacement.name);
      }
      validatedPrograms.push({ ...canonicalProgram, exerciseIds, exercises });
    }
    const validatedRecommendation: CoachProgramRecommendation = {
      ...canonicalRecommendation,
      programs: validatedPrograms,
    };

    const { data, error } = await supabase.rpc("apply_coach_program_version", {
      p_profile: profile,
      p_recommendation: validatedRecommendation,
    });
    if (error) {
      if (error.code === "42501") return NextResponse.json({ error: "premium_required" }, { status: 403 });
      if (error.code === "22023") return NextResponse.json({ error: "invalid_request" }, { status: 400 });
      return NextResponse.json({ error: "save_failed" }, { status: 500 });
    }

    return NextResponse.json({ version: Array.isArray(data) ? data[0] : data }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "recommendation_unavailable" }, { status: 500 });
  }
}
