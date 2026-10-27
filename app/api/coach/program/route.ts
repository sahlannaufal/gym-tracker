import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCoachProgramRecommendation } from "@/lib/coachProgramRecommendation";
import type { ExerciseCatalogItem } from "@/lib/exerciseCatalog";
import type {
  CoachEquipmentId,
  CoachGoalType,
  CoachMuscleFocus,
  CoachTrainingExperience,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const goalTypes: CoachGoalType[] = ["build_muscle", "lose_fat", "build_strength", "general_fitness"];
const muscleFocuses: Exclude<CoachMuscleFocus, "full_body">[] = ["chest", "back", "shoulders", "arms", "core", "legs"];
const experiences: CoachTrainingExperience[] = ["beginner", "intermediate", "advanced"];
const equipmentOptions: CoachEquipmentId[] = [
  "dumbbells", "barbell", "bench", "bands", "pullup_bar", "cable_machine", "machines", "kettlebell", "bodyweight",
];

type ProgramRequest = {
  goalType: CoachGoalType;
  focuses: Exclude<CoachMuscleFocus, "full_body">[];
  weeklySessionTarget: number;
  sessionDurationMinutes: 30 | 45 | 60;
  trainingExperience: CoachTrainingExperience;
  equipmentIds: CoachEquipmentId[];
  variation: number;
  trainingLocation: "gym" | "home";
};

let catalogCache: ExerciseCatalogItem[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProgramRequest(value: unknown): ProgramRequest | null {
  if (!isRecord(value)) return null;
  const {
    goalType,
    focuses,
    weeklySessionTarget,
    sessionDurationMinutes,
    trainingExperience,
    equipmentIds,
    variation,
    trainingLocation,
  } = value;

  if (
    typeof goalType !== "string" || !goalTypes.includes(goalType as CoachGoalType) ||
    !Array.isArray(focuses) || focuses.length > muscleFocuses.length ||
    new Set(focuses).size !== focuses.length ||
    !focuses.every((focus) => typeof focus === "string" && muscleFocuses.includes(focus as Exclude<CoachMuscleFocus, "full_body">)) ||
    !Number.isInteger(weeklySessionTarget) || (weeklySessionTarget as number) < 1 || (weeklySessionTarget as number) > 6 ||
    ![30, 45, 60].includes(sessionDurationMinutes as number) ||
    typeof trainingExperience !== "string" || !experiences.includes(trainingExperience as CoachTrainingExperience) ||
    !Array.isArray(equipmentIds) || equipmentIds.length > equipmentOptions.length ||
    !equipmentIds.every((id) => typeof id === "string" && equipmentOptions.includes(id as CoachEquipmentId)) ||
    (variation !== undefined && (!Number.isInteger(variation) || (variation as number) < 0 || (variation as number) > 1000)) ||
    (trainingLocation !== "gym" && trainingLocation !== "home")
  ) return null;

  return {
    goalType: goalType as CoachGoalType,
    focuses: focuses as ProgramRequest["focuses"],
    weeklySessionTarget: weeklySessionTarget as number,
    sessionDurationMinutes: sessionDurationMinutes as ProgramRequest["sessionDurationMinutes"],
    trainingExperience: trainingExperience as CoachTrainingExperience,
    equipmentIds: equipmentIds as CoachEquipmentId[],
    variation: (variation as number | undefined) ?? 0,
    trainingLocation,
  };
}

async function loadCatalog(): Promise<ExerciseCatalogItem[]> {
  if (catalogCache) return catalogCache;
  const content = await readFile(join(process.cwd(), "public/data/exercises/catalog.json"), "utf8");
  const parsed: unknown = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("Exercise catalogue has an invalid format.");
  catalogCache = parsed as ExerciseCatalogItem[];
  return catalogCache;
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

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
  const isActive = entitlement?.status === "active" &&
    (!entitlement.current_period_end || new Date(entitlement.current_period_end).getTime() > Date.now());
  if (!isActive) return NextResponse.json({ error: "premium_required" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const input = parseProgramRequest(body);
  if (!input) return NextResponse.json({ error: "invalid_profile" }, { status: 400 });

  try {
    const catalog = await loadCatalog();
    const equipmentAccess = input.equipmentIds.length === 0 || input.equipmentIds.every((id) => id === "bodyweight")
      ? "bodyweight"
      : input.trainingLocation === "home"
        ? "home_gym"
        : input.equipmentIds.includes("machines")
          ? "full_gym"
          : "limited_gym";
    const recommendation = getCoachProgramRecommendation({
      goalType: input.goalType,
      focus: input.focuses[0] ?? "full_body",
      focuses: input.focuses,
      weeklySessionTarget: input.weeklySessionTarget,
      sessionDurationMinutes: input.sessionDurationMinutes,
      trainingExperience: input.trainingExperience,
      equipmentIds: input.equipmentIds,
      variation: input.variation,
      equipmentAccess,
      catalog,
    });

    return NextResponse.json({ recommendation }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "recommendation_unavailable" }, { status: 500 });
  }
}
