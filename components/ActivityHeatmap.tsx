import type { Workout } from "@/lib/types";

const WEEK_COUNT = 52;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayFromMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - dayFromMonday);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calendarDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

function intensityClass(totalSets: number): string {
  if (totalSets === 0) return "bg-gray-800";
  if (totalSets <= 3) return "bg-lime-950 ring-1 ring-inset ring-lime-900";
  if (totalSets <= 6) return "bg-lime-800";
  if (totalSets <= 10) return "bg-lime-600";
  return "bg-lime-400";
}

export default function ActivityHeatmap({ workouts }: { workouts: Workout[] }) {
  const today = new Date();
  const currentWeekStart = startOfWeek(today);
  const rangeStart = addDays(currentWeekStart, -(WEEK_COUNT - 1) * 7);
  const dailySets = new Map<number, number>();

  for (const workout of workouts) {
    const workoutDate = parseLocalDate(workout.date);
    if (!workoutDate || workoutDate > today || workoutDate < rangeStart) continue;
    const dayNumber = calendarDayNumber(workoutDate);
    dailySets.set(dayNumber, (dailySets.get(dayNumber) ?? 0) + workout.sets);
  }

  const weeks = Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(rangeStart, weekIndex * 7 + dayIndex);
      return dailySets.get(calendarDayNumber(date)) ?? 0;
    }),
  );
  const activeWeeks = weeks.filter((days) => days.some((total) => total > 0)).length;
  const monthSegments: Array<{ key: string; label: string; start: number; span: number }> = [];
  for (let weekIndex = 0; weekIndex < WEEK_COUNT; weekIndex += 1) {
    // Hari Kamis mewakili bulan dominan pada minggu tersebut.
    const representativeDate = addDays(rangeStart, weekIndex * 7 + 3);
    const key = `${representativeDate.getFullYear()}-${representativeDate.getMonth()}`;
    const previous = monthSegments.at(-1);
    if (previous?.key === key) {
      previous.span += 1;
    } else {
      monthSegments.push({
        key,
        label: MONTHS[representativeDate.getMonth()],
        start: weekIndex,
        span: 1,
      });
    }
  }

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
      <div>
        <h2 className="font-semibold text-gray-100">Aktivitas 12 Bulan Terakhir</h2>
      </div>

      <div
        className="mt-5 overflow-x-auto pb-2"
        role="img"
        aria-label={`${activeWeeks} dari 52 minggu aktif`}
      >
        <div className="w-max min-w-full">
          <div className="grid grid-cols-[repeat(52,0.75rem)] gap-1 text-xs text-gray-500">
            {monthSegments.map((month) => (
              <span
                key={month.key}
                className="truncate"
                style={{ gridColumn: `${month.start + 1} / span ${month.span}` }}
              >
                {month.label}
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            {weeks.map((days, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {days.map((total, dayIndex) => (
                  <span
                    key={dayIndex}
                    aria-hidden="true"
                    className={`h-3 w-3 rounded-[2px] ${intensityClass(total)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-200">{activeWeeks}</span> minggu aktif
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500" aria-hidden="true">
          <span>Tidak aktif</span>
          {[0, 2, 5, 8, 12].map((total) => (
            <span key={total} className={`h-2.5 w-2.5 rounded-[2px] ${intensityClass(total)}`} />
          ))}
          <span>Sangat aktif</span>
        </div>
      </div>
    </section>
  );
}
