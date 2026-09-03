import type { BodyMetric } from "@/features/metrics/types";

// Kept in its own module, separate from MeasurementChart.tsx, purely so it
// can be unit-tested without transitively importing react-native-gifted-charts
// (which ships an untranspiled-ESM dependency, gifted-charts-core, that
// Jest can't parse without extra transformIgnorePatterns config — simplest
// to just not pull the chart library into a pure-logic test's module graph
// at all).

/** measurements is a jsonb column (Json | null in the generated types), not
 * strictly Record<string, number> — read it defensively rather than
 * trusting the shape. */
export function readMeasurement(metric: BodyMetric, key: string): number | null {
  const measurements = metric.measurements;
  if (measurements == null || typeof measurements !== "object" || Array.isArray(measurements)) {
    return null;
  }
  const value = (measurements as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}
