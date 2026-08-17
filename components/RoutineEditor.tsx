"use client";

import { useEffect, useState } from "react";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import { CUSTOM_EXERCISE_VALUE, EXERCISE_CATEGORIES } from "@/lib/constants/exercises";
import type { TrainingProgram } from "@/lib/types";

const fieldClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

function ProgramForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: TrainingProgram;
  onSave: (name: string, exercises: string[]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [exercises, setExercises] = useState(initial?.exercises ?? []);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState("");

  const addExercise = (exercise: string) => {
    if (exercise && !exercises.includes(exercise)) setExercises((items) => [...items, exercise]);
  };

  const submit = () => {
    if (!name.trim()) return setError("Nama program wajib diisi.");
    if (exercises.length === 0) return setError("Tambahkan minimal satu latihan.");
    onSave(name.trim(), exercises);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-lime-500/40 bg-gray-900/70 p-4">
      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Nama Program</span>
        <input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Contoh: Push Day" className={fieldClass} />
      </label>

      <div>
        <p className="mb-2 text-sm text-gray-400">Daftar Latihan</p>
        {exercises.length > 0 && (
          <ul className="mb-3 space-y-2">
            {exercises.map((exercise, index) => (
              <li key={exercise} className="flex items-center justify-between rounded-xl bg-gray-950/70 px-3 py-2 text-sm">
                <span><span className="mr-2 text-gray-600">{index + 1}.</span>{exercise}</span>
                <button type="button" onClick={() => setExercises((items) => items.filter((item) => item !== exercise))} aria-label={`Hapus ${exercise}`} className="text-xl text-gray-500 hover:text-red-400">×</button>
              </li>
            ))}
          </ul>
        )}
        <select
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            event.target.value = "";
            if (value === CUSTOM_EXERCISE_VALUE) setCustomOpen(true);
            else addExercise(value);
            setError("");
          }}
          className={fieldClass}
        >
          <option value="" disabled>Tambah latihan...</option>
          {EXERCISE_CATEGORIES.map((group) => (
            <optgroup key={group.category} label={group.category}>
              {group.exercises.map((exercise) => <option key={exercise}>{exercise}</option>)}
            </optgroup>
          ))}
          <option value={CUSTOM_EXERCISE_VALUE}>Lainnya (Custom)...</option>
        </select>
        {customOpen && (
          <div className="mt-2 flex gap-2">
            <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Nama latihan custom" className={fieldClass} />
            <button type="button" onClick={() => { const value = customName.trim(); if (value) addExercise(value); setCustomName(""); setCustomOpen(false); }} className="rounded-xl bg-gray-700 px-4 font-semibold hover:bg-gray-600">Tambah</button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} className="rounded-xl bg-lime-400 px-5 py-2.5 font-semibold text-gray-950 hover:bg-lime-300">Simpan Program</button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-700 px-5 py-2.5 text-gray-300 hover:bg-gray-800">Batal</button>
      </div>
    </div>
  );
}

export default function RoutineEditor() {
  const { store, addProgram, updateProgram, deleteProgram } = useTrainingPrograms();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  useEffect(() => {
    if (editingId && editingId !== "new" && !store?.programs.some((item) => item.id === editingId)) setEditingId(null);
  }, [editingId, store]);

  if (!store) return <p className="text-gray-500">Memuat...</p>;
  const editing = editingId === "new" ? undefined : store.programs.find((item) => item.id === editingId);

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Program Latihan</h1>
          <p className="mt-1 text-sm text-gray-400">Buat paket latihan yang dapat dipilih untuk tanggal mana pun.</p>
        </div>
        {!editingId && <button type="button" onClick={() => setEditingId("new")} className="shrink-0 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-lime-300">+ Program</button>}
      </div>

      {editingId && (
        <ProgramForm
          key={editingId}
          initial={editing}
          onCancel={() => setEditingId(null)}
          onSave={(name, exercises) => {
            if (editing) updateProgram(editing.id, name, exercises);
            else addProgram(name, exercises);
            setEditingId(null);
          }}
        />
      )}

      {store.programs.length === 0 && !editingId ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center text-gray-400">Belum ada program latihan.</div>
      ) : (
        <ul className="space-y-3">
          {store.programs.map((program) => (
            <li key={program.id} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-semibold text-gray-100">{program.name}</h2><p className="mt-1 text-sm text-gray-500">{program.exercises.length} latihan</p></div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingId(program.id)} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">Edit</button>
                  <button type="button" onClick={() => { if (window.confirm(`Hapus program ${program.name}? Jadwal yang memakainya akan dilepas.`)) deleteProgram(program.id); }} className="rounded-lg border border-red-900/70 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/50">Hapus</button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-300">{program.exercises.join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
