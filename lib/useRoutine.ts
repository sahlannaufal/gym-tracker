"use client";

import { useCallback, useEffect, useState } from "react";
import { loadRoutine, saveRoutine } from "./storage";
import type { Routine, Weekday } from "./types";

export function useRoutine() {
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    setRoutine(loadRoutine());
  }, []);

  const setDayExercises = useCallback((day: Weekday, exercises: string[]) => {
    setRoutine((prev) => {
      const base = prev ?? loadRoutine();
      const next: Routine = {
        ...base,
        days: { ...base.days, [day]: exercises },
      };
      saveRoutine(next);
      return next;
    });
  }, []);

  return { routine, setDayExercises };
}
