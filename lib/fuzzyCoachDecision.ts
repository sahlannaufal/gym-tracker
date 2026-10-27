import type { CoachTrainingExperience } from "./types";

export type FuzzyDecision = { sessions: number; confidence: number; reasons: string[] };

/** Keep the requested weekly frequency exact; safety factors only affect the confidence note. */
export function decideWeeklySessions(input: {
  target: number;
  duration: number;
  experience: CoachTrainingExperience;
}): FuzzyDecision {
  const requestedSessions = Math.max(1, Math.min(7, Math.round(input.target)));
  const sessions = Math.min(6, requestedSessions);
  const durationCapacity = input.duration === 30 ? 2 : input.duration === 45 ? 3 : 4;
  const durationPenalty = Math.max(0, sessions - durationCapacity) * 0.08;
  const beginnerPenalty = input.experience === "beginner" && sessions > 3 ? 0.08 : 0;
  const confidence = Math.max(0.2, 1 - durationPenalty - beginnerPenalty);
  const reasons = [
    `Target ${requestedSessions} sesi/minggu digunakan sebagai jumlah sesi rekomendasi.`,
    `Durasi ${input.duration} menit dan pengalaman ${input.experience} memengaruhi jumlah gerakan per sesi, bukan jumlah sesi mingguan.`,
  ];
  if (requestedSessions === 7) reasons.push("Rekomendasi membatasi latihan menjadi maksimal 6 hari agar tersedia waktu pemulihan.");
  return { sessions, confidence: Number(confidence.toFixed(2)), reasons };
}
