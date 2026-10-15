"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCoachGoal, saveCoachGoal } from "./storage";
import { requestSync } from "./sync";
import type { CoachGoal } from "./types";

export function useCoachGoal() {
  const [goal, setGoal] = useState<CoachGoal | null>(null);

  useEffect(() => {
    const refresh = () => setGoal(loadCoachGoal());
    refresh();
    window.addEventListener("coach-goal-changed", refresh);
    return () => window.removeEventListener("coach-goal-changed", refresh);
  }, []);

  const saveGoal = useCallback((input: Pick<CoachGoal, "type" | "focus" | "focuses" | "weeklySessionTarget" | "sessionDurationMinutes" | "programId" | "programIds" | "trainingExperience" | "equipmentAccess" | "equipmentIds">) => {
    const current = loadCoachGoal();
    const now = new Date().toISOString();
    const next: CoachGoal = {
      version: 1,
      ...input,
      startedAt: current?.startedAt ?? now,
      updatedAt: now,
    };
    saveCoachGoal(next);
    setGoal(next);
    requestSync();
    return next;
  }, []);

  return { goal, saveGoal };
}
