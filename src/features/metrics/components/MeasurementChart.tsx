import { LineChart } from "react-native-gifted-charts";

import { ThemedText } from "@/components/ThemedText";
import type { BodyMetric } from "@/features/metrics/types";
import { readMeasurement } from "@/features/metrics/utils/readMeasurement";
import { useDesignTheme } from "@/theme/useDesignTheme";

type MeasurementChartProps = {
  metrics: BodyMetric[];
  /** Key inside the measurements jsonb column, e.g. "waist_cm". */
  measurementKey: string;
  /** e.g. "cm" — appended to the y-axis labels. */
  unit: string;
};

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Same "at least 2 points, floor the y-axis near the data" pattern as
// WeightChart — kept as a separate component rather than a shared
// generalization of the two, since WeightChart reads a real column
// (weight_kg) while this reads out of the free-form measurements jsonb, and
// forcing them through one abstraction wasn't worth it for ~40 lines each.
export function MeasurementChart({ metrics, measurementKey, unit }: MeasurementChartProps) {
  const { tokens } = useDesignTheme();
  const points = metrics
    .map((m) => ({ date: m.date, value: readMeasurement(m, measurementKey) }))
    .filter((p): p is { date: string; value: number } => p.value != null);

  if (points.length < 2) {
    return (
      <ThemedText variant="body" className="text-sm text-ink-dim">
        Log this on at least two days to see a trend.
      </ThemedText>
    );
  }

  const data = points.map((p) => ({ value: p.value, label: formatShortDate(p.date) }));
  const values = data.map((d) => d.value);
  const yAxisOffset = Math.max(0, Math.floor(Math.min(...values) - 2));

  return (
    <LineChart
      data={data}
      thickness={2}
      color={tokens.swatch.accent}
      dataPointsColor={tokens.swatch.accent}
      yAxisOffset={yAxisOffset}
      yAxisTextStyle={{ color: tokens.swatch.inkDim, fontSize: 10, fontFamily: tokens.fonts.body }}
      xAxisLabelTextStyle={{ color: tokens.swatch.inkDim, fontSize: 10, fontFamily: tokens.fonts.body }}
      xAxisColor={tokens.swatch.inkDim}
      yAxisColor={tokens.swatch.inkDim}
      rulesColor={tokens.progressRing.track}
      rulesType="solid"
      noOfSections={4}
      spacing={Math.max(36, 280 / data.length)}
      initialSpacing={16}
      height={140}
      yAxisLabelSuffix={` ${unit}`}
    />
  );
}
