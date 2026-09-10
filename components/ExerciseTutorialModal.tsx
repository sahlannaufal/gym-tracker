"use client";

import { useEffect, useState } from "react";
import { loadExerciseTutorial, type ExerciseTutorial } from "@/lib/exerciseCatalog";

const LABELS: Record<string, string> = {
  assisted: "Alat bantu",
  band: "Band",
  "body weight": "Berat badan",
  "bosu ball": "Bola BOSU",
  cable: "Kabel",
  dumbbell: "Dumbel",
  barbell: "Barbel",
  "elliptical machine": "Mesin eliptikal",
  "ez barbell": "Barbel EZ",
  hammer: "Palu",
  kettlebell: "Kettlebell",
  "leverage machine": "Mesin beban",
  "medicine ball": "Bola medis",
  "olympic barbell": "Barbel Olimpiade",
  "resistance band": "Resistance band",
  roller: "Rol",
  rope: "Tali",
  "skierg machine": "Mesin SkiErg",
  "smith machine": "Mesin Smith",
  "sled machine": "Mesin leg press",
  "stability ball": "Bola stabilitas",
  "stationary bike": "Sepeda statis",
  "stepmill machine": "Mesin stepmill",
  tire: "Ban",
  "trap bar": "Trap bar",
  "upper body ergometer": "Ergometer tubuh bagian atas",
  weighted: "Beban tambahan",
  "wheel roller": "Roda latihan",
  abductors: "Abduktor paha",
  adductors: "Adduktor paha",
  pectorals: "Dada",
  delts: "Bahu",
  quads: "Paha depan",
  glutes: "Bokong",
  hamstrings: "Paha belakang",
  lats: "Punggung lebar",
  abs: "Perut",
  biceps: "Bisep",
  triceps: "Trisep",
  calves: "Betis",
  forearms: "Lengan bawah",
  "cardiovascular system": "Kardiovaskular",
  "levator scapulae": "Levator skapula",
  "serratus anterior": "Serratus anterior",
  spine: "Punggung bawah",
  traps: "Trapezius",
  "upper back": "Punggung atas",
};

function label(value: string) {
  return LABELS[value.toLowerCase()] ?? value.replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ExerciseTutorialModal({
  exercise,
  onClose,
}: {
  exercise?: string;
  onClose: () => void;
}) {
  const [tutorial, setTutorial] = useState<ExerciseTutorial>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gifError, setGifError] = useState(false);

  useEffect(() => {
    if (!exercise) return;

    let active = true;
    setTutorial(undefined);
    setLoading(true);
    setError("");
    setGifError(false);

    loadExerciseTutorial(exercise)
      .then((result) => {
        if (!active) return;
        setTutorial(result);
      })
      .catch(() => {
        if (active) setError("Tutorial gagal dimuat. Periksa koneksi lalu coba lagi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [exercise]);

  useEffect(() => {
    if (!exercise) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [exercise, onClose]);

  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 px-0 pt-12 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gray-700 bg-gray-950 p-5 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-lime-400">
              Tutorial Latihan
            </p>
            <h2 id="tutorial-title" className="mt-1 text-xl font-bold text-gray-100">
              {exercise}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tutorial"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-700 text-2xl leading-none text-gray-400 hover:border-gray-500 hover:text-gray-100"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Memuat tutorial...</div>
        ) : error ? (
          <p className="mt-6 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </p>
        ) : !tutorial ? (
          <p className="mt-6 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm text-gray-400">
            Tutorial belum tersedia untuk latihan custom ini.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {gifError ? (
              <p className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 text-center text-sm text-amber-200">
                Animasi tidak dapat dimuat. Pastikan perangkat terhubung ke internet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-white">
                {/* GIF eksternal baru diminta browser setelah modal tutorial dibuka. */}
                <img
                  src={tutorial.gifUrl}
                  alt={`Animasi gerakan ${exercise}`}
                  onError={() => setGifError(true)}
                  className="mx-auto aspect-square w-full max-w-[360px] object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-gray-900 p-3">
                <p className="text-xs text-gray-500">Target</p>
                <p className="mt-1 font-medium text-gray-200">{label(tutorial.target)}</p>
              </div>
              <div className="rounded-xl bg-gray-900 p-3">
                <p className="text-xs text-gray-500">Peralatan</p>
                <p className="mt-1 font-medium text-gray-200">{label(tutorial.equipment)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-100">Petunjuk Gerakan</h3>
              <ol className="mt-3 space-y-3">
                {tutorial.instructions.map((instruction, index) => (
                  <li key={`${tutorial.id}-${index}`} className="flex gap-3 text-sm leading-6 text-gray-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-xs font-bold text-lime-400">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs leading-5 text-amber-100/80">
              Gunakan tutorial sebagai panduan umum. Hentikan latihan jika terasa sakit dan mintalah
              bantuan pelatih jika Anda belum memahami teknik gerakannya.
            </p>

            <p className="border-t border-gray-800 pt-4 text-center text-[11px] text-gray-500">
              ExerciseDB / © Gym Visual —{" "}
              <a
                href="https://gymvisual.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-300"
              >
                gymvisual.com
              </a>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
