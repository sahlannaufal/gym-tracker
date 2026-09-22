"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { useCustomExercises } from "@/lib/useCustomExercises";
import { formatDateShort } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import ExerciseCatalogPicker from "./ExerciseCatalogPicker";
import ExerciseTutorialModal from "./ExerciseTutorialModal";

const W = 320;
const H = 200;
const PAD = { top: 16, right: 8, bottom: 28, left: 36 };
type DateRange = "7d" | "30d" | "3m";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "3m", label: "3 Bulan" },
];

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeStart(range: DateRange): string {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  if (range === "7d") start.setDate(start.getDate() - 6);
  if (range === "30d") start.setDate(start.getDate() - 29);
  if (range === "3m") start.setMonth(start.getMonth() - 3);
  return formatLocalDate(start);
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-100">{value}</p>
    </div>
  );
}

function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  return (
    <div className="max-w-[50%] min-w-32">
      <label htmlFor="chartDateRange" className="sr-only">Rentang tanggal grafik</label>
      <select
        id="chartDateRange"
        aria-label="Rentang tanggal grafik"
        value={value}
        onChange={(event) => onChange(event.target.value as DateRange)}
        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs font-semibold text-gray-200 focus:border-lime-400 focus:outline-none"
      >
        {DATE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>{range.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function Progress() {
  const { workouts, isLoaded } = useWorkouts();
  const { customExercises } = useCustomExercises();
  const [selected, setSelected] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [tutorialExercise, setTutorialExercise] = useState<string>();
  const lastTrackedView = useRef<string | null>(null);

  const rangeStart = getRangeStart(dateRange);
  const rangeEnd = formatLocalDate(new Date());

  useEffect(() => {
    const viewKey = `${selected}:${dateRange}`;
    if (!isLoaded || !selected || lastTrackedView.current === viewKey) return;
    const dates = [...new Set(
      workouts
        .filter((workout) => workout.exercise === selected && workout.date >= rangeStart && workout.date <= rangeEnd)
        .map((workout) => workout.date),
    )].sort();
    lastTrackedView.current = viewKey;
    trackEvent("Progress Chart Viewed", {
      exercise_name: selected,
      date_range: `${rangeStart}:${rangeEnd}`,
      total_data_points: dates.length,
    });
  }, [dateRange, isLoaded, rangeEnd, rangeStart, selected, workouts]);

  if (!isLoaded) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  if (workouts.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Grafik Progress</h1>
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">Belum ada data untuk ditampilkan.</p>
          <p className="mt-1 text-sm text-gray-500">
            Yuk catat latihan pertamamu sekarang.
          </p>
          <Link
            href="/workout/new"
            className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            + Tambah Latihan
          </Link>
        </div>
      </section>
    );
  }

  const current = selected;

  const maxWeightByDate = new Map<string, number>();
  const filtered = workouts.filter(
    (w) => w.exercise === current && w.date >= rangeStart && w.date <= rangeEnd,
  );
  for (const w of filtered) {
    const max = maxWeightByDate.get(w.date) ?? 0;
    if (w.weight > max) maxWeightByDate.set(w.date, w.weight);
  }
  const points = [...maxWeightByDate.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const maxWeight = points.length ? Math.max(...points.map((p) => p[1])) : 0;
  const totalVolume = filtered.reduce(
    (acc, w) => acc + w.weight * w.reps * w.sets,
    0
  );

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(5, Math.ceil(maxWeight / 5) * 5);

  const xFor = (i: number) =>
    points.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (points.length - 1)) * innerW;
  const yFor = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p[1])}`)
    .join(" ");

  const gridCount = 4;
  const gridlines = Array.from(
    { length: gridCount + 1 },
    (_, i) => (maxVal / gridCount) * i
  );
  const labelStep = Math.max(1, Math.ceil(points.length / 7));

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Grafik Progress</h1>

      <div className="max-w-md">
        <button
          type="button"
          aria-label="Pilih latihan untuk grafik"
          aria-expanded={exercisePickerOpen}
          onClick={() => setExercisePickerOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-left text-gray-100 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
        >
          <span className={current ? "truncate" : "text-gray-400"}>{current ?? "Pilih Latihan..."}</span>
          <svg
            className={`ml-3 h-4 w-4 shrink-0 text-gray-500 transition-transform ${exercisePickerOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {exercisePickerOpen && (
          <div className="mt-2 rounded-xl border border-gray-700 bg-gray-950 p-2 shadow-xl">
            <ExerciseCatalogPicker
              selected={current ? [current] : []}
              onAdd={(exercise) => {
                setSelected(exercise);
                setExercisePickerOpen(false);
              }}
              onTutorial={setTutorialExercise}
              customExercises={customExercises.map((item) => item.name)}
              showCustomAction={false}
            />
          </div>
        )}
      </div>

      {!current && (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-300">Pilih latihan untuk melihat grafik.</p>
        </div>
      )}

      {current && points.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
          <div className="mb-6 text-left">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
          <p className="text-gray-300">Belum ada data untuk {current}.</p>
          <p className="mt-1 text-sm text-gray-500">Tidak ada catatan dalam rentang tanggal yang dipilih.</p>
        </div>
      )}

      {current && points.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-4">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
            {gridlines.map((v) => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={yFor(v)}
                  y2={yFor(v)}
                  stroke="#1f2937"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={yFor(v) + 3}
                  textAnchor="end"
                  fontSize={10}
                  className="fill-gray-500"
                >
                  {Math.round(v)}
                </text>
              </g>
            ))}
            {points.length > 1 && (
              <polyline
                points={points.map((p, i) => `${xFor(i)},${yFor(p[1])}`).join(" ")}
                fill="none"
                stroke="#a3e635"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((p, i) => (
              <g key={p[0]}>
                <circle cx={xFor(i)} cy={yFor(p[1])} r={3.5} fill="#a3e635" />
                {(i % labelStep === 0 || i === points.length - 1) && (
                  <text
                    x={xFor(i)}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize={10}
                    className="fill-gray-500"
                  >
                    {formatDateShort(p[0])}
                  </text>
                )}
              </g>
            ))}
          </svg>
          {points.length === 1 && (
            <p className="mt-1 text-center text-sm text-gray-500">
              Tambahkan lebih banyak sesi untuk melihat tren beban.
            </p>
          )}
          <p className="mt-3 text-center text-xs text-gray-500">
            Grafik menampilkan beban maksimum per sesi.
          </p>
        </div>
      )}

      {current && points.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Summary label="Max Beban" value={`${maxWeight} kg`} />
          <Summary label="Total Volume" value={`${Math.round(totalVolume)} kg`} />
          <Summary label="Total Sesi" value={filtered.length} />
        </div>
      )}
      <ExerciseTutorialModal
        exercise={tutorialExercise}
        onClose={() => setTutorialExercise(undefined)}
      />
    </section>
  );
}
