import { LineChart } from "react-native-gifted-charts";
import { Text, useColorScheme } from "react-native";

import type { BodyMetric } from "@/features/metrics/types";

type WeightChartProps = {
  metrics: BodyMetric[];
};

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WeightChart({ metrics }: WeightChartProps) {
  const isDark = useColorScheme() === "dark";
  const withWeight = metrics.filter((m) => m.weight_kg != null);

  if (withWeight.length < 2) {
    return (
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
        Log your weight on at least two days to see a trend.
      </Text>
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

  const lineColor = isDark ? "#fafafa" : "#171717";

  return (
    <LineChart
      data={data}
      curved
      thickness={2}
      color={lineColor}
      dataPointsColor={lineColor}
      yAxisOffset={yAxisOffset}
      yAxisTextStyle={{ color: isDark ? "#a3a3a3" : "#737373", fontSize: 10 }}
      xAxisLabelTextStyle={{ color: isDark ? "#a3a3a3" : "#737373", fontSize: 10 }}
      xAxisColor={isDark ? "#404040" : "#e5e5e5"}
      yAxisColor={isDark ? "#404040" : "#e5e5e5"}
      rulesColor={isDark ? "#262626" : "#f5f5f5"}
      noOfSections={4}
      spacing={Math.max(36, 280 / data.length)}
      initialSpacing={16}
      height={160}
      yAxisLabelSuffix=" kg"
    />
  );
}
