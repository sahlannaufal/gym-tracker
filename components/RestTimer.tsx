"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadRestMuted,
  loadRestSeconds,
  saveRestMuted,
  saveRestSeconds,
} from "@/lib/storage";

const PRESETS = [30, 60, 90, 120];
const MAX_SECONDS = 3600;

function clampSeconds(value: number): number {
  return Math.min(MAX_SECONDS, Math.max(1, Math.round(value)));
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Beep singkat via Web Audio API (tanpa file aset).
function playFinishedSignal(): void {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const beep = (delay: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    beep(0, 880, 0.25);
    beep(0.35, 880, 0.25);
    beep(0.7, 1174, 0.5);
  } catch {
    /* Audio tidak tersedia — abaikan */
  }
}

function vibrateFinished(): void {
  try {
    navigator.vibrate?.([300, 100, 300]);
  } catch {
    /* Vibrasi tidak tersedia — abaikan */
  }
}

interface RestTimerProps {
  open: boolean;
  onClose: () => void;
  onLogAgain: () => void;
}

export default function RestTimer({
  open,
  onClose,
  onLogAgain,
}: RestTimerProps) {
  const [total, setTotal] = useState<number>(() => loadRestSeconds());
  const [remaining, setRemaining] = useState<number>(() => loadRestSeconds());
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => loadRestMuted());
  const signaledRef = useRef(false);

  // Saat overlay dibuka: mulai ulang dari durasi tersimpan (default 60 detik).
  useEffect(() => {
    if (!open) return;
    const stored = loadRestSeconds();
    setTotal(stored);
    setRemaining(stored);
    setIsRunning(true);
    setIsFinished(false);
    signaledRef.current = false;
  }, [open]);

  // Hitung mundur tiap detik.
  useEffect(() => {
    if (!open || isFinished || !isRunning) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, isFinished, isRunning]);

  // Sinyal suara/vibrasi hanya sekali saat benar-benar selesai (bukan saat skip).
  useEffect(() => {
    if (!open || !isFinished || signaledRef.current) return;
    signaledRef.current = true;
    if (!muted) {
      playFinishedSignal();
      vibrateFinished();
    }
  }, [open, isFinished, muted]);

  if (!open) return null;

  const handlePauseToggle = () => {
    setIsRunning((r) => !r);
  };

  const handleSkip = () => {
    signaledRef.current = true;
    setIsRunning(false);
    setIsFinished(true);
  };

  const handleRestart = () => {
    setRemaining(total);
    setIsRunning(true);
    setIsFinished(false);
    signaledRef.current = false;
  };

  const handlePreset = (seconds: number) => {
    const next = clampSeconds(seconds);
    setTotal(next);
    setRemaining(next);
    setIsRunning(true);
    setIsFinished(false);
    signaledRef.current = false;
    saveRestSeconds(next);
  };

  const handleAdjust = (delta: number) => {
    const nextRemaining = clampSeconds(remaining + delta);
    const nextTotal = clampSeconds(total + delta);
    setRemaining(nextRemaining);
    setTotal(nextTotal);
    setIsRunning(true);
    setIsFinished(false);
    signaledRef.current = false;
    saveRestSeconds(nextTotal);
  };

  const handleToggleMute = () => {
    setMuted((m) => {
      saveRestMuted(!m);
      return !m;
    });
  };

  const progress = total > 0 ? Math.round((remaining / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 px-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
        Istirahat
      </h2>

      <p
        className={`mt-6 tabular-nums text-8xl font-bold ${
          remaining <= 10 ? "text-lime-400" : "text-gray-100"
        }`}
      >
        {formatTime(remaining)}
      </p>

      <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-lime-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isFinished ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-lg font-medium text-gray-100">
            Waktu istirahat selesai!
          </p>
          <button
            type="button"
            onClick={onLogAgain}
            className="w-full max-w-xs rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
          >
            Catat Set Berikutnya
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-xs rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
          >
            Selesai
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="text-sm text-gray-400 underline-offset-2 hover:underline"
          >
            Ulangi {formatTime(total)}
          </button>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePauseToggle}
              className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-lime-300"
            >
              {isRunning ? "Jeda" : "Lanjut"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl border border-gray-700 px-5 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
            >
              Lewati
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAdjust(-30)}
              className="rounded-lg border border-gray-700 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              -30s
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(30)}
              className="rounded-lg border border-gray-700 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              +30s
            </button>
          </div>

          <div className="flex gap-2">
            {PRESETS.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handlePreset(sec)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  total === sec
                    ? "bg-lime-400 text-gray-950"
                    : "border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {sec} dtk
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute bottom-8 rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
      >
        Suara: {muted ? "Mati" : "Nyala"}
      </button>
    </div>
  );
}
