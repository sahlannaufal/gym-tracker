"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadRestMuted,
  loadRestSeconds,
  saveRestMuted,
  saveRestSeconds,
} from "@/lib/storage";

const MAX_SECONDS = 3600;

function clampSeconds(value: number): number {
  return Math.min(MAX_SECONDS, Math.max(1, Math.round(value)));
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function signalFinished(): void {
  try {
    navigator.vibrate?.([300, 100, 300]);
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [0, 0.35, 0.7].forEach((delay, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = index === 2 ? 1174 : 880;
      const start = context.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (index === 2 ? 0.5 : 0.25));
      oscillator.start(start);
      oscillator.stop(start + (index === 2 ? 0.5 : 0.25));
    });
  } catch {
    /* Audio/vibrasi tidak tersedia. */
  }
}

export default function FloatingRestTimer({
  open,
  restartKey,
  exercise,
  onClose,
}: {
  open: boolean;
  restartKey: number;
  exercise?: string;
  onClose: () => void;
}) {
  const [total, setTotal] = useState(() => loadRestSeconds());
  const [remaining, setRemaining] = useState(() => loadRestSeconds());
  const [running, setRunning] = useState(true);
  const [muted, setMuted] = useState(() => loadRestMuted());
  const signaledRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const duration = loadRestSeconds();
    setTotal(duration);
    setRemaining(duration);
    setRunning(true);
    signaledRef.current = false;
  }, [open, restartKey]);

  useEffect(() => {
    if (!open || !running || remaining <= 0) return;
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open, running, remaining]);

  useEffect(() => {
    if (!open || remaining !== 0 || signaledRef.current) return;
    signaledRef.current = true;
    setRunning(false);
    if (!muted) signalFinished();
  }, [muted, open, remaining]);

  if (!open) return null;

  const adjustDuration = (delta: number) => {
    const nextTotal = clampSeconds(total + delta);
    setTotal(nextTotal);
    setRemaining((current) => clampSeconds(current + delta));
    saveRestSeconds(nextTotal);
  };

  const toggleMuted = () => {
    setMuted((current) => {
      saveRestMuted(!current);
      return !current;
    });
  };

  const progress = total > 0 ? (remaining / total) * 100 : 0;
  const finished = remaining === 0;

  return (
    <aside
      aria-label="Timer istirahat"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/95 shadow-2xl shadow-black/50 backdrop-blur"
    >
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-lime-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-400">
            {finished ? "Istirahat selesai" : `Istirahat${exercise ? ` · ${exercise}` : ""}`}
          </p>
          <p className={`tabular-nums text-3xl font-bold ${finished ? "text-lime-400" : "text-gray-100"}`}>
            {formatTime(remaining)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => adjustDuration(-30)}
          className="rounded-lg border border-gray-700 px-2.5 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800"
          aria-label="Kurangi 30 detik"
        >
          −30
        </button>
        <button
          type="button"
          onClick={() => {
            if (finished) {
              setRemaining(total);
              signaledRef.current = false;
              setRunning(true);
            } else {
              setRunning((current) => !current);
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-gray-950 hover:bg-lime-300"
          aria-label={finished ? "Ulangi timer" : running ? "Jeda timer" : "Lanjutkan timer"}
        >
          {finished ? "↻" : running ? "Ⅱ" : "▶"}
        </button>
        <button
          type="button"
          onClick={() => adjustDuration(30)}
          className="rounded-lg border border-gray-700 px-2.5 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800"
          aria-label="Tambah 30 detik"
        >
          +30
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 px-3 py-2 text-xs">
        <button
          type="button"
          onClick={toggleMuted}
          className="text-gray-400 hover:text-gray-200"
        >
          Suara: {muted ? "Mati" : "Nyala"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-medium text-gray-400 hover:text-red-400"
        >
          Lewati
        </button>
      </div>
    </aside>
  );
}
