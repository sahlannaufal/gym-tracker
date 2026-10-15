import type { ReactNode } from "react";
import type { CoachEquipmentId } from "@/lib/types";

type CoachIconId = CoachEquipmentId | "gym" | "home" | "coach";

const iconPaths: Record<CoachIconId, ReactNode> = {
  dumbbells: <><path d="M5 9v6M2.5 10.5v3M19 9v6m2.5-4.5v3M5 12h14" /></>,
  barbell: <><path d="M4 7v10M2 9v6M20 7v10m2-8v6M4 12h16" /></>,
  bench: <><path d="M4 8h11l3 4H7zM7 12l-2 7m11-7 2 7M3 19h18" /></>,
  bands: <><path d="M7 4c-3 2-3 14 0 16m10-16c3 2 3 14 0 16M7 4h10M7 20h10" /></>,
  pullup_bar: <><path d="M3 5h18M6 5v4m12-4v4M9 10v3m6-3v3m-6 0 3 3 3-3M12 16v4" /></>,
  cable_machine: <><path d="M5 3v18m14-18v18M5 5h14M8 8l8 5m-8 0 8-5m-8 5v5m8-5v5" /></>,
  machines: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5m-5 3h8" /></>,
  kettlebell: <><path d="M8 8V6a4 4 0 0 1 8 0v2M6 9h12l2 10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /></>,
  bodyweight: <><circle cx="12" cy="4.5" r="2" /><path d="m12 7 2 5 5 2m-7-7-3 5-4 2m9-2-2 5-5 3m7-8 4 8" /></>,
  gym: <><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-7h6v7M8 9h.01M16 9h.01" /></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></>,
  coach: <><path d="m12 2.75 8 3.1v5.4c0 5.1-3.3 8.2-8 10-4.7-1.8-8-4.9-8-10v-5.4z" /><path d="M15.2 8.5a4.1 4.1 0 1 0 0 7" /></>,
};

export default function CoachIcon({ id, className = "h-6 w-6" }: { id: CoachIconId; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[id]}</svg>;
}
