import type { CoachTrainingExperience } from "./types";

export type FuzzyDecision = { sessions: number; confidence: number; reasons: string[] };

function triangle(value: number, left: number, peak: number, right: number): number {
  if (value === peak) return 1;
  if (value <= left || value >= right) return 0;
  return value < peak ? (value - left) / (peak - left) : (right - value) / (right - peak);
}

/** Mamdani-style fuzzy scoring: fuzzy preference memberships rank safe split candidates. */
export function decideWeeklySessions(input: {
  target: number;
  duration: number;
  experience: CoachTrainingExperience;
}): FuzzyDecision {
  const targetMembership = [
    triangle(input.target, 0, 1, 3),
    triangle(input.target, 1, 3, 5),
    triangle(input.target, 3, 6, 8),
  ];
  const durationCapacity = input.duration === 30 ? 2 : input.duration === 45 ? 3 : 4;
  const experienceBias = input.experience === "beginner" ? 0 : input.experience === "intermediate" ? 0.25 : 0.5;
  const scored = Array.from({ length: 6 }, (_, index) => {
    const sessions = index + 1;
    const low = targetMembership[0] * (sessions === 1 ? 1 : sessions === 2 ? 0.65 : 0.2);
    const medium = targetMembership[1] * (sessions >= 2 && sessions <= 4 ? 1 : 0.45);
    const high = targetMembership[2] * (sessions >= 4 ? 1 : 0.4);
    const durationFit = sessions <= durationCapacity ? 1 : Math.max(0.2, 1 - 0.2 * (sessions - durationCapacity));
    const recoveryFit = sessions === 6 ? 0.72 : 1;
    const fuzzyFit = Math.max(low, medium, high);
    const targetFit = Math.max(0.25, 1 - Math.abs(sessions - input.target) * 0.18);
    const preferenceFit = fuzzyFit * 0.7 + targetFit * 0.3;
    return { sessions, score: preferenceFit * durationFit * recoveryFit * (sessions > 3 && input.experience === "beginner" ? 0.82 : 1) + experienceBias * (sessions >= 3 && sessions <= 5 ? 0.04 : 0) };
  }).sort((a, b) => b.score - a.score || a.sessions - b.sessions);
  const winner = scored[0];
  const reasons = [
    `Target ${input.target} sesi/minggu diperlakukan sebagai preferensi, bukan batas kaku.`,
    `Durasi ${input.duration} menit dan pengalaman ${input.experience} memengaruhi kapasitas split.`,
  ];
  if (input.target === 7) reasons.push("Rekomendasi membatasi latihan menjadi maksimal 6 hari agar tersedia waktu pemulihan.");
  return { sessions: winner.sessions, confidence: Number(winner.score.toFixed(2)), reasons };
}
