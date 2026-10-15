"use client";

import BodyModel, { type IExerciseData, type IMuscleStats, type Muscle } from "react-body-highlighter";
import type { CoachMuscleFocus } from "@/lib/types";

type PriorityFocus = Exclude<CoachMuscleFocus, "full_body">;

const focusOptions: { value: PriorityFocus; label: string }[] = [
  { value: "chest", label: "Dada" },
  { value: "back", label: "Punggung" },
  { value: "shoulders", label: "Bahu" },
  { value: "arms", label: "Lengan" },
  { value: "core", label: "Core" },
  { value: "legs", label: "Kaki" },
];

const focusMuscles: Record<PriorityFocus, Muscle[]> = {
  chest: ["chest"],
  back: ["trapezius", "upper-back", "lower-back"],
  shoulders: ["front-deltoids", "back-deltoids"],
  arms: ["biceps", "triceps", "forearm"],
  core: ["abs", "obliques"],
  legs: ["adductor", "abductors", "hamstring", "quadriceps", "calves", "gluteal", "left-soleus", "right-soleus", "knees"],
};

const muscleFocus: Partial<Record<Muscle, PriorityFocus>> = Object.fromEntries(
  Object.entries(focusMuscles).flatMap(([focus, muscles]) =>
    muscles.map((muscle) => [muscle, focus]),
  ),
) as Partial<Record<Muscle, PriorityFocus>>;

export default function CoachMuscleSelector({
  selected,
  onChange,
}: {
  selected: PriorityFocus[];
  onChange: (value: PriorityFocus[]) => void;
}) {
  const selectedMuscles: IExerciseData[] = selected.map((focus) => ({
    name: focus,
    muscles: focusMuscles[focus],
    frequency: 1,
  }));

  const toggleFocus = (focus: PriorityFocus) => {
    if (selected.includes(focus)) {
      onChange(selected.filter((item) => item !== focus));
    } else {
      onChange([...selected, focus]);
    }
  };

  const handleMuscleClick = ({ muscle }: IMuscleStats) => {
    const focus = muscleFocus[muscle];
    if (focus) toggleFocus(focus);
  };

  const bodyProps = {
    data: selectedMuscles,
    bodyColor: "#303238",
    highlightedColors: ["#a3e635"],
    onClick: handleMuscleClick,
    style: { width: "100%", maxWidth: "8.5rem", margin: "0 auto" },
    svgStyle: { width: "100%", height: "auto", maxHeight: "210px" },
  };

  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-gray-200">Otot prioritas</legend>
      <p className="mt-1 text-xs text-gray-500">Pilih pada anatomi atau badge di bawah.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-gray-800 bg-gray-950/60 px-2 py-3">
        <div>
          <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">Depan</p>
          <BodyModel {...bodyProps} type="anterior" />
        </div>
        <div>
          <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wide text-gray-500">Belakang</p>
          <BodyModel {...bodyProps} type="posterior" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pilihan otot prioritas">
        <button
          type="button"
          aria-pressed={selected.length === focusOptions.length}
          onClick={() => onChange(focusOptions.map((option) => option.value))}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selected.length === focusOptions.length ? "border-lime-400 bg-lime-400 text-gray-950" : "border-gray-700 bg-gray-950 text-gray-300 hover:border-gray-500"}`}
        >
          All
        </button>
        {focusOptions.map((option) => <button
          key={option.value}
          type="button"
          aria-pressed={selected.includes(option.value)}
          onClick={() => toggleFocus(option.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selected.includes(option.value) ? "border-lime-400 bg-lime-400 text-gray-950" : "border-gray-700 bg-gray-950 text-gray-300 hover:border-gray-500"}`}
        >
          {option.label}
        </button>)}
      </div>
    </fieldset>
  );
}
