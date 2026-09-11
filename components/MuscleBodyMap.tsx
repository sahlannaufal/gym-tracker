"use client";

import BodyModel, { type IExerciseData, type Muscle } from "react-body-highlighter";

const MUSCLE_MAP: Record<string, Muscle[]> = {
  dada: ["chest"],
  "dada atas": ["chest"],
  "dada bawah": ["chest"],
  pectorals: ["chest"],
  biseps: ["biceps"],
  brachialis: ["biceps"],
  trisep: ["triceps"],
  "lengan bawah": ["forearm"],
  lengan: ["biceps", "triceps", "forearm"],
  "bahu depan": ["front-deltoids"],
  "bahu samping": ["front-deltoids", "back-deltoids"],
  "bahu belakang": ["back-deltoids"],
  bahu: ["front-deltoids", "back-deltoids"],
  trapezius: ["trapezius"],
  "punggung atas": ["upper-back"],
  "punggung bawah": ["lower-back"],
  punggung: ["upper-back", "lower-back", "trapezius"],
  lats: ["upper-back"],
  core: ["abs", "obliques"],
  perut: ["abs"],
  "perut bawah": ["abs"],
  oblique: ["obliques"],
  "hip flexor": ["adductor"],
  quadriceps: ["quadriceps"],
  hamstring: ["hamstring"],
  glutes: ["gluteal"],
  betis: ["calves"],
  kaki: ["quadriceps", "hamstring", "gluteal", "calves"],
};

function toModelData(primaryMuscles: string[], secondaryMuscles: string[]): IExerciseData[] {
  const priorities = new Map<Muscle, number>();

  for (const muscleName of secondaryMuscles) {
    for (const muscle of MUSCLE_MAP[muscleName.toLocaleLowerCase("id-ID")] ?? []) {
      priorities.set(muscle, Math.max(priorities.get(muscle) ?? 0, 1));
    }
  }
  for (const muscleName of primaryMuscles) {
    for (const muscle of MUSCLE_MAP[muscleName.toLocaleLowerCase("id-ID")] ?? []) {
      priorities.set(muscle, 2);
    }
  }

  return [...priorities].map(([muscle, frequency]) => ({
    name: "Latihan terakhir",
    muscles: [muscle],
    frequency,
  }));
}

export default function MuscleBodyMap({
  primaryMuscles,
  secondaryMuscles,
}: {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}) {
  const data = toModelData(primaryMuscles, secondaryMuscles);
  if (data.length === 0) return null;

  const sharedProps = {
    data,
    bodyColor: "#303238",
    highlightedColors: ["#3f6212", "#a3e635"],
    style: { width: "100%" },
    svgStyle: { width: "100%", height: "auto", maxHeight: "260px" },
  };

  return (
    <div
      className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-gray-800 bg-gray-950/60 px-3 py-4"
      role="img"
      aria-label="Diagram otot utama dan pendukung pada latihan terakhir"
    >
      <div>
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Depan
        </p>
        <BodyModel {...sharedProps} type="anterior" />
      </div>
      <div>
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Belakang
        </p>
        <BodyModel {...sharedProps} type="posterior" />
      </div>
    </div>
  );
}
