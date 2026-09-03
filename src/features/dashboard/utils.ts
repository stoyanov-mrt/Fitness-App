// Pure domain logic for the dashboard's widgets — split out of
// app/(tabs)/index.tsx per CLAUDE.md ("Route files: thin screens, no
// business logic" / "a new feature module isn't done until its domain
// logic has unit tests") so the date/trend math is unit-testable without
// rendering anything. See utils.test.ts.

/** `YYYY-MM-DD` in local time — matches the `date` column on body_metrics
 * and the string useDailySummary/useDailyDiary are already keyed on
 * elsewhere in the app, so it's consistent to compare against. */
export function toDateKey(date: Date) {
  return date.toLocaleDateString("en-CA");
}

/** The last 7 calendar days, oldest first, ending on `referenceDate` (today
 * by default — a parameter only so this is testable without mocking the
 * system clock). */
export function lastSevenDays(referenceDate = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

/** Every distinct calendar day (as a date-key) that has at least one
 * workout in the given history. */
export function workoutDayKeys(workouts: { started_at: string }[]) {
  return new Set(workouts.map((w) => toDateKey(new Date(w.started_at))));
}

/** How many of the given workouts fall within `days` (by date-key, so a
 * day with two sessions counts both — unlike counting workoutDayKeys). */
export function workoutsWithinDays(workouts: { started_at: string }[], days: Date[]) {
  const dayKeys = new Set(days.map(toDateKey));
  return workouts.filter((w) => dayKeys.has(toDateKey(new Date(w.started_at)))).length;
}

/**
 * Change in weight over a recent window of body-metric entries (oldest
 * first, as returned by listBodyMetrics). Returns null when there isn't
 * enough data yet to call it a trend (fewer than 2 entries, or a missing
 * weight on either end) rather than a misleading 0.
 */
export function weightTrend(
  recentMetrics: { weight_kg: number | null }[],
  latestWeightKg: number | null | undefined
) {
  if (latestWeightKg == null || recentMetrics.length < 2) return null;
  const oldest = recentMetrics[0]?.weight_kg;
  if (oldest == null) return null;
  return latestWeightKg - oldest;
}
