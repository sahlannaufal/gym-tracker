"use client";

import { useState } from "react";
import { useRoutine } from "@/lib/useRoutine";
import {
  CUSTOM_EXERCISE_VALUE,
  EXERCISE_CATEGORIES,
} from "@/lib/constants/exercises";
import { DAY_LABELS, DAY_ORDER } from "@/lib/types";
import type { Weekday } from "@/lib/types";

const selectClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

function listsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => item === b[i]);
}

function DayCard({
  day,
  exercises,
  onSave,
}: {
  day: Weekday;
  exercises: string[];
  onSave: (list: string[]) => void;
}) {
  const [list, setList] = useState<string[]>(exercises);
  const [saved, setSaved] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");

  const dirty = !listsEqual(list, exercises);

  const addExercise = (name: string) => {
    if (list.includes(name)) return;
    setList((prev) => [...prev, name]);
    setSaved(false);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectValue("");
    if (value === CUSTOM_EXERCISE_VALUE) {
      setCustomOpen(true);
      return;
    }
    if (value) addExercise(value);
  };

  const handleCustomAdd = () => {
    const name = customName.trim();
    if (!name) return;
    addExercise(name);
    setCustomName("");
    setCustomOpen(false);
  };

  const handleSave = () => {
    onSave(list);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-100">{DAY_LABELS[day]}</h2>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-amber-400">
              ● Belum disimpan
            </span>
          )}
          <span className="text-sm text-gray-500">{list.length} latihan</span>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mb-3 text-sm text-gray-500">Belum ada latihan.</p>
      ) : (
        <ul className="mb-3 flex flex-wrap gap-2">
          {list.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-950 py-1 pl-3 pr-1 text-sm text-gray-200"
            >
              <span>{name}</span>
              <button
                onClick={() => {
                  setList((prev) => prev.filter((e) => e !== name));
                  setSaved(false);
                }}
                aria-label={`Hapus ${name}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-950/60 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <select
        value={selectValue}
        onChange={handleSelect}
        className={selectClass}
      >
        <option value="" disabled>
          Tambah latihan...
        </option>
        {EXERCISE_CATEGORIES.map((group) => (
          <optgroup key={group.category} label={group.category}>
            {group.exercises.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={CUSTOM_EXERCISE_VALUE}>Lainnya (Custom)...</option>
      </select>

      {customOpen && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nama latihan custom"
            className={selectClass}
          />
          <button
            onClick={handleCustomAdd}
            className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            Tambah
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dirty}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            dirty
              ? "bg-lime-400 text-gray-950 hover:bg-lime-300"
              : "cursor-not-allowed bg-gray-800 text-gray-500"
          }`}
        >
          Simpan
        </button>
        {saved && (
          <span className="text-sm font-medium text-lime-400">
            ✓ Tersimpan
          </span>
        )}
      </div>
    </div>
  );
}

export default function RoutineEditor() {
  const { routine, setDayExercises } = useRoutine();

  if (!routine) {
    return <p className="text-gray-500">Memuat...</p>;
  }

  const handleSave = (day: Weekday, list: string[]) => {
    setDayExercises(day, list);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rutin Latihan</h1>
        <p className="mt-2 text-gray-400">
          Atur jadwal mingguan. Ubah latihan di tiap hari, lalu tekan
          "Simpan" untuk menyimpan hari itu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {DAY_ORDER.map((day) => (
          <DayCard
            key={day}
            day={day}
            exercises={routine.days[day] ?? []}
            onSave={(list) => handleSave(day, list)}
          />
        ))}
      </div>
    </section>
  );
}
