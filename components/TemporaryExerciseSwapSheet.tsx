"use client";

import { useEffect, useState } from "react";
import {
  getCoachExerciseAlternatives,
} from "@/lib/coachProgramRecommendation";
import {
  loadExerciseCatalog,
  type ExerciseCatalogItem,
} from "@/lib/exerciseCatalog";
import type { CoachEquipmentAccess, CoachEquipmentId } from "@/lib/types";

type TemporaryExerciseSwapSheetProps = {
  exerciseName: string;
  exerciseId?: string | null;
  equipmentIds?: CoachEquipmentId[];
  equipmentAccess: CoachEquipmentAccess;
  hasTemporarySwap: boolean;
  onSelect: (exercise: ExerciseCatalogItem) => void;
  onViewTutorial: (exercise: ExerciseCatalogItem) => void;
  tutorialOpen: boolean;
  onRestore: () => void;
  onClose: () => void;
};

const ACCESS_EQUIPMENT: Record<CoachEquipmentAccess, CoachEquipmentId[]> = {
  full_gym: ["dumbbells", "barbell", "bench", "bands", "pullup_bar", "cable_machine", "machines", "kettlebell", "bodyweight"],
  limited_gym: ["dumbbells", "barbell", "bench", "bands", "pullup_bar", "machines", "bodyweight"],
  home_gym: ["dumbbells", "barbell", "bench", "bands", "pullup_bar", "kettlebell", "bodyweight"],
  bodyweight: ["bodyweight", "pullup_bar"],
};

const EQUIPMENT_LABELS: Record<string, string> = {
  "body weight": "Tanpa alat",
  dumbbell: "Dumbbell",
  barbell: "Barbell",
  "ez barbell": "Barbell EZ",
  "olympic barbell": "Barbell",
  "trap bar": "Trap bar",
  band: "Resistance band",
  "resistance band": "Resistance band",
  cable: "Kabel",
  "lever machine": "Mesin",
  "leverage machine": "Mesin",
  "smith machine": "Smith machine",
  "sled machine": "Mesin",
  assisted: "Mesin bantuan",
  kettlebell: "Kettlebell",
  weighted: "Beban tambahan",
};

function equipmentIdsUsedBy(item: ExerciseCatalogItem): CoachEquipmentId[] {
  const equipment = item.equipment.toLowerCase();
  if (equipment === "dumbbell") return ["dumbbells"];
  if (["barbell", "ez barbell", "olympic barbell", "trap bar"].includes(equipment)) return ["barbell"];
  if (["band", "resistance band"].includes(equipment)) return ["bands"];
  if (equipment === "cable") return ["cable_machine"];
  if (["lever machine", "leverage machine", "smith machine", "sled machine", "assisted"].includes(equipment)) return ["machines"];
  if (equipment === "kettlebell") return ["kettlebell"];
  if (equipment === "weighted") return ["dumbbells", "barbell", "kettlebell"];
  if (equipment === "body weight" && /pull.?up|chin.?up/i.test(item.name)) return ["pullup_bar"];
  if (equipment === "body weight") return ["bodyweight"];
  return [];
}

function equipmentLabel(equipment: string): string {
  return EQUIPMENT_LABELS[equipment.toLowerCase()] ?? equipment;
}

export default function TemporaryExerciseSwapSheet({
  exerciseName,
  exerciseId,
  equipmentIds,
  equipmentAccess,
  hasTemporarySwap,
  onSelect,
  onViewTutorial,
  tutorialOpen,
  onRestore,
  onClose,
}: TemporaryExerciseSwapSheetProps) {
  const [catalog, setCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void loadExerciseCatalog()
      .then((items) => {
        if (active) setCatalog(items);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !tutorialOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, tutorialOpen]);

  const current = catalog.find((item) => Boolean(exerciseId && item.id === exerciseId))
    ?? catalog.find((item) => item.name === exerciseName);
  const selectedEquipment = equipmentIds?.length ? equipmentIds : ACCESS_EQUIPMENT[equipmentAccess];
  const unavailableEquipment = current ? new Set(equipmentIdsUsedBy(current)) : new Set<CoachEquipmentId>();
  const usableEquipment = selectedEquipment.filter((id) => !unavailableEquipment.has(id));
  const alternatives = current && usableEquipment.length > 0
    ? getCoachExerciseAlternatives(catalog, current.id, usableEquipment, equipmentAccess)
    : [];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="temporary-swap-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Tutup pilihan pengganti"
      />
      <section className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gray-800 bg-gray-950 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-700 sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="temporary-swap-title" className="mt-1 text-lg font-bold text-gray-100">Ganti gerakan</h2>
            <p className="mt-1 text-sm text-gray-400">Pengganti untuk {exerciseName}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-400 hover:bg-gray-800 hover:text-white" aria-label="Tutup">×</button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-400">Memuat gerakan yang sesuai...</p>
        ) : loadFailed ? (
          <p className="mt-6 rounded-xl bg-red-950/40 p-3 text-sm text-red-300">Pilihan gerakan belum dapat dimuat. Periksa koneksi lalu coba lagi.</p>
        ) : !current ? (
          <p className="mt-6 rounded-xl bg-gray-900 p-3 text-sm text-gray-400">Alternatif belum tersedia untuk gerakan ini.</p>
        ) : (
          <>
            {hasTemporarySwap && (
              <button
                type="button"
                onClick={onRestore}
                className="mt-4 w-full rounded-xl border border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-200 hover:border-lime-400/50 hover:bg-gray-900"
              >
                Kembalikan ke gerakan awal
              </button>
            )}
            {alternatives.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {alternatives.slice(0, 12).map((alternative) => (
                  <li key={alternative.id}>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/70 p-2 pl-3 hover:border-lime-400/50">
                      <button
                        type="button"
                        onClick={() => onSelect(alternative)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 py-1 text-left"
                      >
                        <span className="min-w-0 text-sm font-medium text-gray-100">{alternative.name}</span>
                        <span className="shrink-0 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-300">{equipmentLabel(alternative.equipment)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewTutorial(alternative)}
                        aria-label={`Lihat tutorial ${alternative.name}`}
                        title={`Tutorial ${alternative.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lime-300 hover:bg-lime-400/10 hover:text-lime-200"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
