import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ProgressRing } from "@/components/ProgressRing";
import { useSession } from "@/features/auth/hooks";
import { useBodyMetrics, useLatestBodyMetric } from "@/features/metrics/hooks";
import { WeightChart } from "@/features/metrics/components/WeightChart";
import { useDailySummary, useLatestGoal } from "@/features/nutrition/hooks";
import { useWorkoutHistory } from "@/features/workouts/hooks";

function todayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function round(value: number) {
  return Math.round(value);
}

export default function DashboardScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const date = todayDateString();

  const { data: goal } = useLatestGoal(userId);
  const { data: summary } = useDailySummary(userId, date);
  const { data: workoutHistory } = useWorkoutHistory(userId);
  const { data: bodyMetrics } = useBodyMetrics(userId, 14);
  const { data: latestBodyMetric } = useLatestBodyMetric(userId);

  const caloriesConsumed = summary?.total_calories ?? 0;
  const caloriesTarget = goal?.calories_target ?? 0;
  const progress = caloriesTarget > 0 ? caloriesConsumed / caloriesTarget : 0;
  const caloriesRemaining = caloriesTarget - caloriesConsumed;

  const lastWorkout = workoutHistory?.[0];

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</Text>

      <View className="items-center gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <ProgressRing progress={progress}>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {round(caloriesConsumed)}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            of {caloriesTarget || "—"} kcal
          </Text>
        </ProgressRing>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {caloriesTarget > 0
            ? caloriesRemaining >= 0
              ? `${round(caloriesRemaining)} kcal remaining`
              : `${round(-caloriesRemaining)} kcal over`
            : "Set your goals in onboarding"}
        </Text>
        <View className="flex-row justify-between self-stretch">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            P {round(summary?.total_protein_g ?? 0)}g
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            C {round(summary?.total_carbs_g ?? 0)}g
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            F {round(summary?.total_fat_g ?? 0)}g
          </Text>
        </View>
      </View>

      <View className="gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Last Workout
        </Text>
        {lastWorkout ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50">{lastWorkout.name}</Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {formatDate(lastWorkout.started_at)}
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            No workouts logged yet.
          </Text>
        )}
      </View>

      <View className="gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Weight Trend
          </Text>
          {latestBodyMetric?.weight_kg != null ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {latestBodyMetric.weight_kg} kg
            </Text>
          ) : null}
        </View>
        <WeightChart metrics={bodyMetrics ?? []} />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button label="Log Weight" variant="secondary" onPress={() => router.push("/metrics")} />
        </View>
        <View className="flex-1">
          <Button label="Log Food" variant="secondary" onPress={() => router.push("/nutrition")} />
        </View>
        <View className="flex-1">
          <Button label="Workout" variant="secondary" onPress={() => router.push("/workouts")} />
        </View>
      </View>
    </ScrollView>
  );
}
