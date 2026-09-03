"use client";

import { useEffect, useState } from "react";
import { useTrainingPrograms } from "@/lib/useTrainingPrograms";
import type { TrainingProgram } from "@/lib/types";
import ExerciseCatalogPicker from "./ExerciseCatalogPicker";
import ExerciseTutorialModal from "./ExerciseTutorialModal";

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
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [tutorialExercise, setTutorialExercise] = useState<string>();
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
              <li key={exercise} className="flex items-center justify-between gap-2 rounded-xl bg-gray-950/70 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate"><span className="mr-2 text-gray-600">{index + 1}.</span>{exercise}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTutorialExercise(exercise)}
                    aria-label={`Buka tutorial ${exercise}`}
                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-lime-400 hover:bg-lime-400/10"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Tutorial
                  </button>
                  <button
                    type="button"
                    onClick={() => setExercises((items) => items.filter((item) => item !== exercise))}
                    aria-label={`Hapus ${exercise}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-red-950/40 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setExercisePickerOpen((open) => !open)}
          aria-expanded={exercisePickerOpen}
          className={`${fieldClass} flex items-center justify-between text-left`}
        >
          <span className="text-gray-400">Tambah latihan...</span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${exercisePickerOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {exercisePickerOpen && (
          <div className="mt-2 rounded-xl border border-gray-700 bg-gray-950 p-2 shadow-xl">
            <ExerciseCatalogPicker
              selected={exercises}
              onAdd={(exercise) => {
                addExercise(exercise);
                setExercisePickerOpen(false);
                setError("");
              }}
              onTutorial={setTutorialExercise}
              onCustom={() => {
                setCustomOpen(true);
                setExercisePickerOpen(false);
              }}
            />
          </div>
        )}
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
      <ExerciseTutorialModal
        exercise={tutorialExercise}
        onClose={() => setTutorialExercise(undefined)}
      />
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
