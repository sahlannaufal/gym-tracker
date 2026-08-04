"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkouts } from "@/lib/useWorkouts";
import { formatDateShort } from "@/lib/format";

const W = 320;
const H = 200;
const PAD = { top: 16, right: 8, bottom: 28, left: 36 };

function Summary({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-gray-100">{value}</p>
    </div>
  );
}

export default function Progress() {
  const { workouts, isLoaded } = useWorkouts();
  const [selected, setSelected] = useState<string | null>(null);

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

  const exercises = [...new Set(workouts.map((w) => w.exercise))].sort();
  const current = selected ?? exercises[0];

  const maxWeightByDate = new Map<string, number>();
  const filtered = workouts.filter((w) => w.exercise === current);
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Grafik Progress</h1>

      <div className="flex flex-wrap gap-2">
        {exercises.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              name === current
                ? "border-lime-400 bg-lime-400 text-gray-950"
                : "border-gray-700 text-gray-300 hover:bg-gray-800"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-300">
          {current} - beban maksimum per sesi
        </p>
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
              <text
                x={xFor(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize={10}
                className="fill-gray-500"
              >
                {formatDateShort(p[0])}
              </text>
            </g>
          ))}
        </svg>
        {points.length === 1 && (
          <p className="mt-1 text-center text-sm text-gray-500">
            Tambahkan lebih banyak sesi untuk melihat tren beban.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Summary label="Max Beban" value={`${maxWeight} kg`} />
        <Summary label="Total Volume" value={`${Math.round(totalVolume)} kg`} />
        <Summary label="Total Sesi" value={filtered.length} />
      </div>
    </section>
  );
}
