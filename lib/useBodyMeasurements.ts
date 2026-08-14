"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BODY_MEASUREMENTS_CHANGED,
  deleteBodyMeasurement,
  loadBodyMeasurements,
  saveBodyMeasurement,
} from "./bodyMeasurements";
import { requestSync } from "./sync";
import type { BodyMeasurement, BodyMeasurementInput } from "./types";

export function useBodyMeasurements(userId: string) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);

  useEffect(() => {
    setMeasurements(loadBodyMeasurements(userId));
    const refresh = (event: Event) => {
      const changedUserId = (event as CustomEvent<{ userId: string }>).detail?.userId;
      if (changedUserId === userId) setMeasurements(loadBodyMeasurements(userId));
    };
    window.addEventListener(BODY_MEASUREMENTS_CHANGED, refresh);
    return () => window.removeEventListener(BODY_MEASUREMENTS_CHANGED, refresh);
  }, [userId]);

  const addMeasurement = useCallback(
    (input: BodyMeasurementInput) => {
      const saved = saveBodyMeasurement(userId, input);
      setMeasurements((current) => [...current, saved]);
      void requestSync();
    },
    [userId],
  );

  const removeMeasurement = useCallback(
    (id: string) => {
      deleteBodyMeasurement(userId, id);
      setMeasurements((current) => current.filter((item) => item.id !== id));
      void requestSync();
    },
    [userId],
  );

  return { measurements, addMeasurement, removeMeasurement };
}
