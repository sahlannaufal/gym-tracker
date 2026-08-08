import { WEEKDAYS } from "./types";
import type { Weekday } from "./types";

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function todayLocalISO(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function currentWeekRange(): { monday: string; sunday: string } {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7; // getDay(): 0=Minggu, 1=Senin
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysSinceMonday
  );
  const sunday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysSinceMonday + 6
  );
  const toISO = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  return { monday: toISO(monday), sunday: toISO(sunday) };
}

export function weekdayFromISO(iso: string): Weekday {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}
