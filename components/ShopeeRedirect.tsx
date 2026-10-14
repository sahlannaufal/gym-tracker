"use client";

import { useEffect } from "react";

const SHOPEE_URL = "https://s.shopee.co.id/7AeJwNLgIX";
const REDIRECT_INTERVAL_MS = 5 * 60 * 1000;

export default function ShopeeRedirect() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    let remainingMs = REDIRECT_INTERVAL_MS;
    let timerId: number | null = null;
    let resumedAt: number | null = null;

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const startTimer = () => {
      if (document.visibilityState !== "visible" || timerId !== null) return;

      resumedAt = Date.now();
      timerId = window.setTimeout(() => {
        timerId = null;
        window.location.assign(SHOPEE_URL);
      }, remainingMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (timerId !== null && resumedAt !== null) {
          remainingMs = Math.max(0, remainingMs - (Date.now() - resumedAt));
        }
        stopTimer();
        resumedAt = null;
        return;
      }

      startTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", startTimer);
    startTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", startTimer);
      stopTimer();
    };
  }, []);

  return null;
}
