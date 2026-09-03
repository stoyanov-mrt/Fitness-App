import { LineChart } from "react-native-gifted-charts";

import { ThemedText } from "@/components/ThemedText";
import type { BodyMetric } from "@/features/metrics/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

type WeightChartProps = {
  metrics: BodyMetric[];
};

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WeightChart({ metrics }: WeightChartProps) {
  const { tokens } = useDesignTheme();
  const withWeight = metrics.filter((m) => m.weight_kg != null);

  if (withWeight.length < 2) {
    return (
      <ThemedText variant="body" className="text-sm text-ink-dim">
        Log your weight on at least two days to see a trend.
      </ThemedText>
    );
  }

  const data = withWeight.map((m) => ({
    value: m.weight_kg as number,
    label: formatShortDate(m.date),
  }));

  // Weight moves slowly day to day — starting the axis at 0 (gifted-charts'
  // default) would flatten a real trend into a nearly-straight line near
  // the top of the chart. Floor a couple of kg below the lowest point
  // instead, so the actual variation is visible.
  const weights = data.map((d) => d.value);
  const yAxisOffset = Math.max(0, Math.floor(Math.min(...weights) - 2));

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
      height={160}
      yAxisLabelSuffix=" kg"
    />
  );
}
