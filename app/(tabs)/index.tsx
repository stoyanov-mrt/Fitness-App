import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { MonumentalImage } from "@/components/decor/MonumentalImage";
import { ProgressRing } from "@/components/ProgressRing";
import { ThemedText } from "@/components/ThemedText";
import { useTabBarContentClearance } from "@/constants/layout";
import { useSession } from "@/features/auth/hooks";
import { useBodyMetrics, useLatestBodyMetric } from "@/features/metrics/hooks";
import { WeightChart } from "@/features/metrics/components/WeightChart";
import { useDailySummary, useLatestGoal } from "@/features/nutrition/hooks";
import { useWorkoutHistory } from "@/features/workouts/hooks";
import { useDesignTheme } from "@/theme/useDesignTheme";

function todayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function round(value: number) {
  return Math.round(value);
}

function Card({ children }: { children: React.ReactNode }) {
  return <View className="gap-2 border border-border bg-ground-raised p-4">{children}</View>;
}

export default function DashboardScreen() {
  const { theme } = useDesignTheme();
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
  const tabBarClearance = useTabBarContentClearance();

  return (
    <View className="flex-1 bg-ground">
      <GrainOverlay />
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }}>
        {/* Editorial hero — the monumental image, bleeding off the trailing
            edge, with the headline offset to one side per the "subtly
            asymmetric" brief rather than centered. */}
        <View className="flex-row items-end justify-between gap-4 px-6 pb-6 pt-16">
          <View className="flex-1 gap-1">
            <ThemedText variant="label" className="text-xs text-ink-dim">
              {todayLabel()}
            </ThemedText>
            <ThemedText variant="display" className="text-4xl text-ink">
              Dashboard
            </ThemedText>
          </View>
          <View className="w-24 opacity-90">
            <MonumentalImage />
          </View>
        </View>

        <View className={theme === "japanese" ? "gap-6 px-6" : "gap-4 px-6"}>
          <Card>
            <View className="items-center gap-4 py-2">
              <ProgressRing progress={progress}>
                <ThemedText variant="display" className="text-2xl text-ink">
                  {round(caloriesConsumed)}
                </ThemedText>
                <ThemedText variant="label" className="text-[10px] text-ink-dim">
                  of {caloriesTarget || "—"} kcal
                </ThemedText>
              </ProgressRing>
              <ThemedText variant="body" className="text-sm text-ink-dim">
                {caloriesTarget > 0
                  ? caloriesRemaining >= 0
                    ? `${round(caloriesRemaining)} kcal remaining`
                    : `${round(-caloriesRemaining)} kcal over`
                  : "Set your goals in onboarding"}
              </ThemedText>
              <View className="flex-row justify-between self-stretch border-t border-border pt-3">
                <ThemedText variant="label" className="text-xs text-ink-dim">
                  P {round(summary?.total_protein_g ?? 0)}g
                </ThemedText>
                <ThemedText variant="label" className="text-xs text-ink-dim">
                  C {round(summary?.total_carbs_g ?? 0)}g
                </ThemedText>
                <ThemedText variant="label" className="text-xs text-ink-dim">
                  F {round(summary?.total_fat_g ?? 0)}g
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card>
            <ThemedText variant="label" className="text-xs text-ink-dim">
              Last Workout
            </ThemedText>
            {lastWorkout ? (
              <View className="flex-row items-center justify-between">
                <ThemedText variant="bodyMedium" className="text-base text-ink">
                  {lastWorkout.name}
                </ThemedText>
                <ThemedText variant="body" className="text-sm text-ink-dim">
                  {formatDate(lastWorkout.started_at)}
                </ThemedText>
              </View>
            ) : (
              <ThemedText variant="body" className="text-sm text-ink-dim">
                No workouts logged yet.
              </ThemedText>
            )}
          </Card>

          <Card>
            <View className="flex-row items-baseline justify-between">
              <ThemedText variant="label" className="text-xs text-ink-dim">
                Weight Trend
              </ThemedText>
              {latestBodyMetric?.weight_kg != null ? (
                <ThemedText variant="bodyMedium" className="text-sm text-ink">
                  {latestBodyMetric.weight_kg} kg
                </ThemedText>
              ) : null}
            </View>
            <WeightChart metrics={bodyMetrics ?? []} />
          </Card>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Log Weight"
                variant="secondary"
                onPress={() => router.push("/metrics")}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Log Food"
                variant="secondary"
                onPress={() => router.push("/nutrition")}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Workout"
                variant="secondary"
                onPress={() => router.push("/workouts")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
