"use client";

import { useEffect, useState } from "react";
import type {
  CoachEquipmentId,
  CoachGoal,
  CoachGoalType,
  CoachMuscleFocus,
  CoachTrainingExperience,
} from "@/lib/types";
import type { CoachProgramRecommendation } from "@/lib/coachProgramRecommendation";
import { getCoachExerciseAlternatives } from "@/lib/coachProgramRecommendation";
import { loadExerciseCatalog, type ExerciseCatalogItem } from "@/lib/exerciseCatalog";
import { supabase } from "@/lib/supabase/client";
import CoachIcon from "./CoachIcon";
import CoachEquipmentScene from "./CoachEquipmentScene";
import CoachMuscleSelector from "./CoachMuscleSelector";
import ExerciseTutorialModal from "./ExerciseTutorialModal";

type CoachSetup = Pick<
  CoachGoal,
  | "type"
  | "focus"
  | "focuses"
  | "weeklySessionTarget"
  | "sessionDurationMinutes"
  | "programId"
  | "programIds"
  | "trainingExperience"
  | "equipmentAccess"
  | "equipmentIds"
>;

type CoachSheetProps = {
  open: boolean;
  goal: CoachGoal | null;
  onClose: () => void;
  onUseRecommendation: (input: CoachSetup, recommendation: CoachProgramRecommendation) => Promise<void>;
};

const experienceOptions: {
  value: CoachTrainingExperience;
  label: string;
  detail: string;
}[] = [
  { value: "beginner", label: "Baru mulai", detail: "Belum rutin atau kurang dari 6 bulan" },
  { value: "intermediate", label: "Sudah pernah latihan", detail: "Rutin sekitar 6 bulan–2 tahun" },
  { value: "advanced", label: "Berpengalaman", detail: "Rutin lebih dari 2 tahun" },
];

const equipmentOptions: { id: CoachEquipmentId; label: string }[] = [
  { id: "dumbbells", label: "Dumbbell" }, { id: "barbell", label: "Barbell" },
  { id: "bench", label: "Bench" }, { id: "bands", label: "Resistance band" },
  { id: "pullup_bar", label: "Pull-up bar" }, { id: "cable_machine", label: "Kabel" },
  { id: "machines", label: "Mesin gym" }, { id: "kettlebell", label: "Kettlebell" },
  { id: "bodyweight", label: "Berat badan" },
];

const goalOptions: { value: CoachGoalType; label: string }[] = [
  { value: "build_muscle", label: "Membangun massa otot" },
  { value: "lose_fat", label: "Menurunkan lemak tubuh" },
  { value: "build_strength", label: "Meningkatkan kekuatan" },
  { value: "general_fitness", label: "Kebugaran umum" },
];

export default function CoachSheet({ open, goal, onClose, onUseRecommendation }: CoachSheetProps) {
  const [step, setStep] = useState(1);
  const [weeklySessionTarget, setWeeklySessionTarget] = useState(3);
  const [goalType, setGoalType] = useState<CoachGoalType>("build_muscle");
  const [focuses, setFocuses] = useState<Exclude<CoachMuscleFocus, "full_body">[]>([]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<30 | 45 | 60>(45);
  const [trainingExperience, setTrainingExperience] = useState<CoachTrainingExperience>("beginner");
  const [equipmentIds, setEquipmentIds] = useState<CoachEquipmentId[]>(["dumbbells", "barbell", "bench", "cable_machine", "machines", "bodyweight"]);
  const [trainingLocation, setTrainingLocation] = useState<"gym" | "home">("gym");
  const [recommendation, setRecommendation] = useState<CoachProgramRecommendation | null>(null);
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [exerciseCatalogLoaded, setExerciseCatalogLoaded] = useState(false);
  const [tutorialExercise, setTutorialExercise] = useState<{ name: string; id: string } | null>(null);
  const [openSwapKey, setOpenSwapKey] = useState<string | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [applyingRecommendation, setApplyingRecommendation] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [variation, setVariation] = useState(0);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setWeeklySessionTarget(goal?.weeklySessionTarget ?? 3);
    setGoalType(goal?.type ?? "build_muscle");
    const savedFocuses = goal?.focuses?.filter(
      (item): item is Exclude<CoachMuscleFocus, "full_body"> => item !== "full_body",
    );
    setFocuses(savedFocuses ?? (goal?.focus && goal.focus !== "full_body" ? [goal.focus] : []));
    setSessionDurationMinutes(goal?.sessionDurationMinutes ?? 45);
    setTrainingExperience(goal?.trainingExperience ?? "beginner");
    setEquipmentIds(goal?.equipmentIds ?? ["dumbbells", "barbell", "bench", "cable_machine", "machines", "bodyweight"]);
    setTrainingLocation(goal?.equipmentAccess === "home_gym" || goal?.equipmentAccess === "bodyweight" ? "home" : "gym");
    setVariation(0);
  }, [goal, open]);

  const setTarget = (value: number) => setWeeklySessionTarget(Math.max(1, Math.min(7, value)));
  const focus = focuses[0] ?? "full_body";

  useEffect(() => {
    if (!open || step !== 4) return;
    let active = true;
    const controller = new AbortController();
    setRecommendation(null);
    setRecommendationError(null);

    async function generateRecommendation() {
      if (!supabase) {
        setRecommendationError("Coach memerlukan koneksi akun.");
        return;
      }

      setRecommendationLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.access_token) {
          setRecommendationError("Sesi login berakhir. Silakan masuk kembali.");
          return;
        }

        const response = await fetch("/api/coach/program", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            goalType,
            focuses,
            weeklySessionTarget,
            sessionDurationMinutes,
            trainingExperience,
            equipmentIds,
            variation,
            trainingLocation,
          }),
          signal: controller.signal,
        });
        const payload = await response.json() as { recommendation?: CoachProgramRecommendation; error?: string };
        if (!response.ok || !payload.recommendation) {
          if (response.status === 401) setRecommendationError("Sesi login berakhir. Silakan masuk kembali.");
          else if (response.status === 403) setRecommendationError("Coach Premium tidak aktif pada akun ini.");
          else if (response.status === 503) setRecommendationError("Layanan Coach sedang tidak tersedia. Coba lagi nanti.");
          else setRecommendationError("Program belum dapat dibuat. Periksa pilihan alat lalu coba lagi.");
          return;
        }
        if (active) setRecommendation(payload.recommendation);
      } catch {
        if (active && !controller.signal.aborted) setRecommendationError("Koneksi gagal. Periksa internet lalu coba lagi.");
      } finally {
        if (active) setRecommendationLoading(false);
      }
    }

    void generateRecommendation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    open, step, retryCount, goalType, focuses, weeklySessionTarget,
    sessionDurationMinutes, trainingExperience, equipmentIds, trainingLocation,
    variation,
  ]);

  useEffect(() => {
    if (!open || step !== 4 || exerciseCatalog.length > 0) return;
    let active = true;
    void loadExerciseCatalog()
      .then((catalog) => { if (active) setExerciseCatalog(catalog); })
      .catch(() => { if (active) setExerciseCatalog([]); })
      .finally(() => { if (active) setExerciseCatalogLoaded(true); });
    return () => { active = false; };
  }, [open, step, exerciseCatalog.length]);

  if (!open) return null;

  const applyRecommendation = async () => {
    if (!recommendation) return;
    setApplyingRecommendation(true);
    setApplyError(null);
    try {
      await onUseRecommendation({
        type: goalType,
        focus,
        focuses,
        weeklySessionTarget,
        sessionDurationMinutes,
        programId: null,
        programIds: [],
        trainingExperience,
        equipmentAccess: equipmentIds.length === 0 || equipmentIds.every((item) => item === "bodyweight") ? "bodyweight" : trainingLocation === "home" ? "home_gym" : equipmentIds.includes("machines") ? "full_gym" : "limited_gym",
        equipmentIds,
      }, recommendation);
      setReplaceConfirmOpen(false);
      onClose();
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : "Program belum tersimpan. Coba lagi.");
    } finally {
      setApplyingRecommendation(false);
    }
  };

  const useRecommendation = () => {
    if (!recommendation) return;
    if (goal?.programIds.length) {
      setReplaceConfirmOpen(true);
      return;
    }
    void applyRecommendation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-gray-950/75 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="coach-sheet-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} disabled={applyingRecommendation} aria-label="Tutup Coach" />
      <section className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-gray-800 bg-gray-900 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl">
        <div className="mx-auto h-1 w-10 rounded-full bg-gray-700" />
        {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} disabled={applyingRecommendation} className="absolute left-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50" aria-label="Kembali ke langkah sebelumnya" title="Kembali">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg>
          </button>}
        <button type="button" onClick={onClose} disabled={applyingRecommendation} className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50" aria-label="Tutup">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
        <div className="mt-11 flex items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-lime-400">Coach · {step}/4</p>
            <h2 id="coach-sheet-title" className="mt-1 text-xl font-bold text-gray-100">{step === 2 ? "Pengalaman" : step === 3 ? "Target Latihan" : step === 4 ? "Program Rekomendasi" : "Gunakan Coach"}</h2>
          </div>
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          {step === 1 && (
            <div>
              <label htmlFor="coach-goal-type" className="text-sm font-semibold text-gray-200">Apa tujuan utamamu?</label>
              <div className="relative mt-2">
                <select id="coach-goal-type" value={goalType} onChange={(event) => setGoalType(event.target.value as CoachGoalType)} className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-950 px-3 py-3 pr-10 text-sm font-semibold text-gray-200 outline-none transition-colors focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20">
                  {goalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <CoachMuscleSelector selected={focuses} onChange={setFocuses} />
            </div>
          )}

          {step === 2 && (
            <fieldset>
              <div className="mt-2 space-y-2">
                {experienceOptions.map((option) => {
                  const selected = trainingExperience === option.value;
                  return (
                    <button key={option.value} type="button" onClick={() => setTrainingExperience(option.value)} className={`w-full rounded-xl border p-3 text-left ${selected ? "border-lime-400 bg-lime-400/10" : "border-gray-700 bg-gray-950 hover:border-gray-500"}`}>
                      <p className={selected ? "font-semibold text-lime-200" : "font-semibold text-gray-200"}>{option.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{option.detail}</p>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-sm font-semibold text-gray-200">Target latihan per minggu</legend>
                <div className="mt-2 flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-950 p-1.5">
                  <button type="button" onClick={() => setTarget(weeklySessionTarget - 1)} disabled={weeklySessionTarget <= 1} className="grid h-10 w-10 place-items-center rounded-lg text-xl text-gray-300 hover:bg-gray-800 disabled:text-gray-700" aria-label="Kurangi target latihan">−</button>
                  <label className="flex items-center gap-1 text-sm text-gray-400"><input type="number" inputMode="numeric" min="1" max="7" value={weeklySessionTarget} onChange={(event) => setTarget(Number(event.target.value) || 1)} className="w-10 bg-transparent text-center text-lg font-bold text-gray-100 outline-none" aria-label="Target latihan per minggu" /><span>x</span></label>
                  <button type="button" onClick={() => setTarget(weeklySessionTarget + 1)} disabled={weeklySessionTarget >= 7} className="grid h-10 w-10 place-items-center rounded-lg text-xl text-gray-300 hover:bg-gray-800 disabled:text-gray-700" aria-label="Tambah target latihan">+</button>
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold text-gray-200">Durasi latihan ideal</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([30, 45, 60] as const).map((duration) => <button key={duration} type="button" onClick={() => setSessionDurationMinutes(duration)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${sessionDurationMinutes === duration ? "border-lime-400 bg-lime-400 text-gray-950" : "border-gray-700 bg-gray-950 text-gray-300 hover:border-gray-500"}`}>{duration}+ mnt</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold text-gray-200">Lokasi latihan</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">{(["gym", "home"] as const).map((location) => <button key={location} type="button" aria-pressed={trainingLocation === location} onClick={() => { setTrainingLocation(location); setEquipmentIds(location === "gym" ? ["dumbbells", "barbell", "bench", "cable_machine", "machines", "bodyweight"] : ["dumbbells", "bands", "bodyweight"]); }} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${trainingLocation === location ? "border-lime-400 bg-lime-400/10 text-lime-200" : "border-gray-700 bg-gray-950 text-gray-300 hover:border-gray-500"}`}><CoachIcon id={location} className="h-5 w-5" />{location === "gym" ? "Gym" : "Rumah"}</button>)}</div>
                <p className="mt-5 text-sm font-semibold text-gray-200">Peralatan yang tersedia</p>
                <p className="mt-1 text-xs text-gray-500">Pilih alat yang ingin digunakan.</p>
                <CoachEquipmentScene
                  options={equipmentOptions.filter((option) => trainingLocation === "gym" || !["machines", "cable_machine"].includes(option.id))}
                  selected={equipmentIds}
                  onToggle={(id) => setEquipmentIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                />
                <p className="mt-3 text-xs text-gray-500">{equipmentIds.length} alat dipilih</p>
              </fieldset>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {recommendationLoading && <p className="mt-3 text-sm text-gray-400">Menyusun program...</p>}
              {recommendationError && <p className="mt-3 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{recommendationError}</p>}
              {applyError && <p className="mt-3 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{applyError}</p>}
              {!recommendationLoading && recommendation && recommendation.programs.every((program) => program.exercises.length === 0) && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-100">Kombinasi alat ini belum memiliki gerakan yang cocok di katalog. Kembali dan pilih alat lain atau tambahkan Berat badan.</p>}
              {recommendation && <>
              <div className="mt-2 rounded-2xl border border-lime-400/45 bg-lime-400/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 font-semibold text-lime-200">{recommendation.splitName}</p>
                  <button type="button" onClick={() => {
                    setApplyError(null);
                    setOpenSwapKey(null);
                    setVariation((current) => current >= 1000 ? 0 : current + 1);
                  }} disabled={recommendationLoading || applyingRecommendation || !recommendation} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-lime-300/30 px-2.5 py-2 text-xs font-semibold text-lime-100 transition-colors hover:border-lime-300/60 hover:bg-lime-300/10 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Generate ulang" title="Generate ulang">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/><path d="m5 3 .7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3Z"/></svg>
                    Generate ulang
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-400">{recommendation.programs.length} sesi/minggu · {sessionDurationMinutes} menit/sesi</p>
              </div>
              <div className="mt-4 space-y-3">
                {recommendation.programs.map((program, programIndex) => (
                  <section key={`${program.name}-${programIndex}`} className="rounded-xl bg-gray-950 p-3">
                    <p className="font-semibold text-gray-200">{program.name.replace("Coach · ", "")}</p>
                    <ol className="mt-2 space-y-1.5">
                      {program.exercises.map((exercise, index) => {
                        const exerciseId = program.exerciseIds[index];
                        const swapKey = `${programIndex}:${exerciseId ?? index}`;
                        const selectedElsewhere = new Set(program.exerciseIds.filter((_, itemExerciseIndex) => itemExerciseIndex !== index));
                        const alternatives = exerciseId
                          ? getCoachExerciseAlternatives(exerciseCatalog, exerciseId, equipmentIds, equipmentIds.length === 0 ? "bodyweight" : equipmentIds.every((item) => item === "bodyweight") ? "bodyweight" : trainingLocation === "home" ? "home_gym" : equipmentIds.includes("machines") ? "full_gym" : "limited_gym", selectedElsewhere)
                          : [];
                        return (
                          <li key={`${exerciseId ?? exercise}-${index}`} className="rounded-lg border border-gray-800 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                <p className="min-w-0 flex-1 break-words text-sm leading-5 text-gray-300"><span className="mr-2 text-gray-600">{index + 1}.</span>{exercise}</p>
                                {exerciseId && <button type="button" onClick={() => setTutorialExercise({ name: exercise, id: exerciseId })} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-lime-300 hover:bg-lime-400/10 hover:text-lime-200" aria-label={`Buka tutorial ${exercise}`} title={`Tutorial ${exercise}`}>
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                                </button>}
                              </div>
                              <button type="button" onClick={() => setOpenSwapKey((current) => current === swapKey ? null : swapKey)} aria-expanded={openSwapKey === swapKey} className="shrink-0 text-xs font-semibold text-lime-300 hover:text-lime-200">Ganti</button>
                            </div>
                            {openSwapKey === swapKey && <div className="mt-2 border-t border-gray-800 pt-2">
                              {!exerciseCatalogLoaded ? <p className="text-xs text-gray-500">Memuat pilihan gerakan...</p> : alternatives.length ? <div className="space-y-1.5">
                                <p className="mb-2 text-xs text-gray-500">Otot utama: {exerciseCatalog.find((item) => item.id === exerciseId)?.target}</p>
                                {alternatives.slice(0, 8).map((alternative) => <button key={alternative.id} type="button" onClick={() => {
                                  setRecommendation((current) => current ? {
                                    ...current,
                                    programs: current.programs.map((item, itemIndex) => itemIndex !== programIndex ? item : {
                                      ...item,
                                      exercises: item.exercises.map((name, exerciseIndex) => exerciseIndex === index ? alternative.name : name),
                                      exerciseIds: item.exerciseIds.map((id, exerciseIndex) => exerciseIndex === index ? alternative.id : id),
                                    }),
                                  } : current);
                                  setOpenSwapKey(null);
                                }} className="flex w-full items-center justify-between gap-3 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800"><span>{alternative.name}</span><span className="shrink-0 text-gray-500">{alternative.equipment}</span></button>)}
                              </div> : <p className="text-xs text-gray-500">Tidak ada pengganti dengan otot utama dan alat yang sama.</p>}
                            </div>}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </div>
              </>}
            </div>
          )}
        </div>

        <div className="mt-6">
          {step < 3 ? <button type="button" onClick={() => setStep((current) => current + 1)} className="w-full rounded-xl bg-lime-400 py-3 text-sm font-bold text-gray-950 hover:bg-lime-300">Lanjutkan</button> : step === 3 ? <button type="button" onClick={() => { setRecommendation(null); setRecommendationError(null); setApplyError(null); setStep(4); }} className="w-full rounded-xl bg-lime-400 py-3 text-sm font-bold text-gray-950 hover:bg-lime-300">Lihat rekomendasi</button> : recommendationError ? <button type="button" onClick={() => setRetryCount((count) => count + 1)} disabled={recommendationLoading || applyingRecommendation} className="w-full rounded-xl bg-lime-400 py-3 text-sm font-bold text-gray-950 hover:bg-lime-300 disabled:bg-gray-700 disabled:text-gray-500">Coba lagi</button> : <button type="button" onClick={useRecommendation} disabled={recommendationLoading || applyingRecommendation || !recommendation || recommendation.programs.every((program) => program.exercises.length === 0)} className="w-full rounded-xl bg-lime-400 py-3 text-sm font-bold text-gray-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500">{applyingRecommendation ? "Menerapkan..." : recommendationLoading ? "Menyusun..." : "Gunakan Program"}</button>}
        </div>
      </section>
      {replaceConfirmOpen && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/80 p-4 sm:items-center" role="presentation">
        <section role="alertdialog" aria-modal="true" aria-labelledby="coach-replace-title" aria-describedby="coach-replace-description" className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-2xl">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v5m0 3h.01" /></svg>
          </div>
          <h3 id="coach-replace-title" className="mt-4 text-lg font-bold text-gray-100">Ganti program Coach?</h3>
          <p id="coach-replace-description" className="mt-2 text-sm leading-5 text-gray-400">Program lama akan dilabeli nonaktif dan program baru berlabel aktif. Jadwal serta riwayat latihan tetap tersimpan</p>
          {applyError && <p className="mt-3 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{applyError}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setReplaceConfirmOpen(false)} disabled={applyingRecommendation} className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-50">Kembali</button>
            <button type="button" onClick={() => void applyRecommendation()} disabled={applyingRecommendation} className="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-gray-950 hover:bg-lime-300 disabled:opacity-50">{applyingRecommendation ? "Menerapkan..." : "Terapkan"}</button>
          </div>
        </section>
      </div>}
      <ExerciseTutorialModal
        exercise={tutorialExercise?.name}
        exerciseId={tutorialExercise?.id}
        onClose={() => setTutorialExercise(null)}
      />
    </div>
  );
}
