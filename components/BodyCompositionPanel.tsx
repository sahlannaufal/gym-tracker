"use client";

import { useMemo, useState } from "react";
import { todayLocalISO } from "@/lib/format";
import { useBodyMeasurements } from "@/lib/useBodyMeasurements";
import type { BodyMeasurement } from "@/lib/types";

const fieldClass =
  "w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-gray-100 focus:border-lime-400 focus:outline-none";

function number(value: number, digits = 1) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: digits });
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "Di bawah rentang referensi";
  if (bmi < 25) return "Dalam rentang referensi";
  if (bmi < 30) return "Di atas rentang referensi";
  return "Jauh di atas rentang referensi";
}

function Summary({ current, previous }: { current: BodyMeasurement; previous?: BodyMeasurement }) {
  const heightM = current.heightCm / 100;
  const bmi = current.weightKg / (heightM * heightM);
  const fatMass = current.bodyFatPercentage === undefined
    ? undefined
    : current.weightKg * current.bodyFatPercentage / 100;
  const delta = previous ? current.weightKg - previous.weightKg : undefined;

  let advice = "Tambahkan pengukuran berikutnya dalam kondisi yang konsisten untuk membaca tren.";
  if (previous) {
    const bodyFatDelta = current.bodyFatPercentage !== undefined && previous.bodyFatPercentage !== undefined
      ? current.bodyFatPercentage - previous.bodyFatPercentage
      : undefined;
    const muscleDelta = current.muscleMassKg !== undefined && previous.muscleMassKg !== undefined
      ? current.muscleMassKg - previous.muscleMassKg
      : undefined;
    if (bodyFatDelta !== undefined && bodyFatDelta < -0.2 && (muscleDelta === undefined || muscleDelta >= -0.2)) {
      advice = "Body fat menurun dan massa otot relatif terjaga. Pertahankan latihan beban, protein, dan pemulihan.";
    } else if (muscleDelta !== undefined && muscleDelta < -0.5) {
      advice = "Massa otot terukur menurun. Pantau performa latihan, asupan protein, energi, dan kualitas tidur.";
    } else if (delta !== undefined && Math.abs(delta) < 0.3) {
      advice = "Berat relatif stabil. Gunakan tren beberapa minggu dan progres latihan untuk menilai perubahan.";
    } else if (delta !== undefined && delta > 0) {
      advice = "Berat meningkat. Bandingkan dengan progres kekuatan dan body fat untuk menilai arah kenaikannya.";
    } else {
      advice = "Berat menurun. Pastikan performa latihan dan pemulihan tetap terjaga selama prosesnya.";
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Berat" value={`${number(current.weightKg)} kg`} detail={delta === undefined ? undefined : `${delta >= 0 ? "+" : ""}${number(delta)} kg`} />
        <Metric label="BMI" value={number(bmi)} detail={bmiLabel(bmi)} />
        <Metric label="Massa lemak" value={fatMass === undefined ? "—" : `${number(fatMass)} kg`} detail={current.bodyFatPercentage === undefined ? "Body fat belum diisi" : `${number(current.bodyFatPercentage)}%`} />
        <Metric label="Massa otot" value={current.muscleMassKg === undefined ? "—" : `${number(current.muscleMassKg)} kg`} detail={current.muscleMassKg === undefined ? "Belum diisi" : `${number(current.muscleMassKg / current.weightKg * 100)}% berat`} />
      </div>
      <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-lime-400">Insight</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">{advice}</p>
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        BMI tidak membedakan lemak dan otot. Angka body composition dari timbangan pintar dapat berubah karena hidrasi; gunakan sebagai tren, bukan diagnosis medis.
      </p>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl bg-gray-950/70 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-bold text-gray-100">{value}</p>
      {detail && <p className="mt-1 text-[11px] leading-tight text-gray-500">{detail}</p>}
    </div>
  );
}

export default function BodyCompositionPanel({ userId }: { userId: string }) {
  const { measurements, addMeasurement, removeMeasurement } = useBodyMeasurements(userId);
  const sorted = useMemo(
    () => [...measurements].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt) || b.createdAt.localeCompare(a.createdAt)),
    [measurements],
  );
  const latest = sorted[0];
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    measuredAt: todayLocalISO(),
    weightKg: "",
    heightCm: "",
    bodyFatPercentage: "",
    muscleMassKg: "",
  });

  const openForm = () => {
    setForm((current) => ({
      ...current,
      measuredAt: todayLocalISO(),
      heightCm: latest ? String(latest.heightCm) : current.heightCm,
    }));
    setShowForm(true);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const weightKg = Number(form.weightKg);
    const heightCm = Number(form.heightCm);
    const bodyFat = form.bodyFatPercentage === "" ? undefined : Number(form.bodyFatPercentage);
    const muscleMass = form.muscleMassKg === "" ? undefined : Number(form.muscleMassKg);
    if (!form.measuredAt || form.measuredAt > todayLocalISO() || weightKg < 20 || weightKg > 500 || heightCm < 100 || heightCm > 250) {
      setError("Periksa tanggal, berat (20–500 kg), dan tinggi (100–250 cm). ");
      return;
    }
    if ((bodyFat !== undefined && (bodyFat < 1 || bodyFat > 70)) || (muscleMass !== undefined && (muscleMass <= 0 || muscleMass > weightKg))) {
      setError("Body fat harus 1–70% dan massa otot tidak boleh melebihi berat badan.");
      return;
    }
    addMeasurement({ measuredAt: form.measuredAt, weightKg, heightCm, bodyFatPercentage: bodyFat, muscleMassKg: muscleMass });
    setForm((current) => ({ ...current, weightKg: "", bodyFatPercentage: "", muscleMassKg: "" }));
    setError("");
    setShowForm(false);
  };

  const field = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  return (
    <section className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Komposisi tubuh</p>
          <h2 className="mt-1 text-lg font-bold text-gray-100">Riwayat Pengukuran</h2>
        </div>
        <button type="button" onClick={() => showForm ? setShowForm(false) : openForm()} className="shrink-0 rounded-xl bg-lime-400 px-3 py-2 text-sm font-semibold text-gray-950 hover:bg-lime-300">
          {showForm ? "Batal" : "+ Ukur"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
          <label className="col-span-2 text-sm text-gray-400">Tanggal<input type="date" max={todayLocalISO()} value={form.measuredAt} onChange={field("measuredAt")} className={`mt-1 ${fieldClass}`} /></label>
          <label className="text-sm text-gray-400">Berat (kg)<input type="number" inputMode="decimal" step="0.1" value={form.weightKg} onChange={field("weightKg")} className={`mt-1 ${fieldClass}`} /></label>
          <label className="text-sm text-gray-400">Tinggi (cm)<input type="number" inputMode="decimal" step="0.1" value={form.heightCm} onChange={field("heightCm")} className={`mt-1 ${fieldClass}`} /></label>
          <label className="text-sm text-gray-400">Body fat (%) <span className="text-gray-600">opsional</span><input type="number" inputMode="decimal" step="0.1" value={form.bodyFatPercentage} onChange={field("bodyFatPercentage")} className={`mt-1 ${fieldClass}`} /></label>
          <label className="text-sm text-gray-400">Massa otot (kg) <span className="text-gray-600">opsional</span><input type="number" inputMode="decimal" step="0.1" value={form.muscleMassKg} onChange={field("muscleMassKg")} className={`mt-1 ${fieldClass}`} /></label>
          {error && <p className="col-span-2 text-sm text-red-400">{error}</p>}
          <button className="col-span-2 rounded-xl bg-lime-400 py-3 font-semibold text-gray-950 hover:bg-lime-300">Simpan Pengukuran</button>
        </form>
      )}

      {latest ? <Summary current={latest} previous={sorted[1]} /> : <p className="rounded-xl border border-dashed border-gray-700 p-6 text-center text-sm text-gray-400">Belum ada pengukuran. Tambahkan data pertama untuk melihat summary.</p>}

      {sorted.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Riwayat</p>
          <ul className="space-y-2">
            {sorted.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-950/60 p-3 text-sm">
                <div><p className="font-semibold text-gray-200">{number(item.weightKg)} kg · {number(item.heightCm)} cm</p><p className="mt-0.5 text-xs text-gray-500">{new Date(`${item.measuredAt}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{item.bodyFatPercentage !== undefined ? ` · BF ${number(item.bodyFatPercentage)}%` : ""}{item.muscleMassKg !== undefined ? ` · Otot ${number(item.muscleMassKg)} kg` : ""}</p></div>
                <button type="button" onClick={() => window.confirm("Hapus pengukuran ini?") && removeMeasurement(item.id)} className="text-xs font-medium text-red-400 hover:text-red-300">Hapus</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
