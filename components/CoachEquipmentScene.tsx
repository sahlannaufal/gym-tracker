"use client";

import Image from "next/image";
import type { CoachEquipmentId } from "@/lib/types";

type EquipmentOption = { id: CoachEquipmentId; label: string };
type Hotspot = { left: string; top: string; width: string };

const equipmentImages: Record<CoachEquipmentId, string> = {
  machines: "/images/coach-equipment/machines.webp",
  cable_machine: "/images/coach-equipment/cable-machine.webp",
  bodyweight: "/images/coach-equipment/bodyweight.webp",
  kettlebell: "/images/coach-equipment/kettlebell.webp",
  pullup_bar: "/images/coach-equipment/pullup-bar.webp",
  bands: "/images/coach-equipment/bands.webp",
  bench: "/images/coach-equipment/bench.webp",
  barbell: "/images/coach-equipment/barbell.webp",
  dumbbells: "/images/coach-equipment/dumbbells.webp",
};

const hotspots: Record<CoachEquipmentId, Hotspot> = {
  barbell: { left: "14%", top: "42%", width: "20%" },
  dumbbells: { left: "33%", top: "42%", width: "16%" },
  pullup_bar: { left: "50%", top: "2%", width: "17%" },
  bands: { left: "50%", top: "27%", width: "13%" },
  kettlebell: { left: "18%", top: "68%", width: "16%" },
  bench: { left: "55%", top: "59%", width: "23%" },
  cable_machine: { left: "73%", top: "30%", width: "16%" },
  machines: { left: "90%", top: "43%", width: "15%" },
  bodyweight: { left: "82%", top: "70%", width: "17%" },
};

export default function CoachEquipmentScene({
  options,
  selected,
  onToggle,
}: {
  options: EquipmentOption[];
  selected: CoachEquipmentId[];
  onToggle: (id: CoachEquipmentId) => void;
}) {
  return (
    <div className="relative mt-3 aspect-[1.45/1] overflow-hidden rounded-2xl border border-gray-700 bg-gray-900" role="group" aria-label="Pilih peralatan latihan">
      <Image
        src="/images/coach-home-gym-background-v2.webp"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 450px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gray-950/10" aria-hidden="true" />

      {options.map((option) => {
        const active = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            aria-label={`${active ? "Hapus" : "Pilih"} ${option.label}`}
            onClick={() => onToggle(option.id)}
            className={`group absolute z-10 flex -translate-x-1/2 flex-col items-center rounded-xl px-0.5 pb-1 pt-0.5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 ${active ? "z-20" : "hover:bg-gray-950/10"}`}
            style={{ left: hotspots[option.id].left, top: hotspots[option.id].top, width: hotspots[option.id].width }}
          >
            <span className="relative block aspect-square w-full">
              {active && <span className="absolute inset-[18%] rounded-full bg-lime-400/70 blur-xl" aria-hidden="true" />}
              <Image
                src={equipmentImages[option.id]}
                alt=""
                fill
                sizes="(max-width: 640px) 23vw, 110px"
                className={`relative object-contain transition-all duration-200 ${active ? "scale-105 drop-shadow-[0_0_12px_rgba(74,222,128,0.95)]" : "grayscale brightness-150 opacity-80 group-hover:opacity-100"}`}
              />
            </span>
            <span className={`-mt-1 inline-flex max-w-full items-center justify-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[7px] font-semibold leading-tight shadow-md backdrop-blur-sm sm:gap-1 sm:px-2 sm:text-[9px] ${active ? "border-lime-300 bg-gray-950/90 text-lime-200 shadow-[0_0_12px_rgba(74,222,128,0.7)]" : "border-white/40 bg-gray-950/80 text-white"}`}>
              <span className="truncate">{option.label}</span>
              {active && <svg className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
