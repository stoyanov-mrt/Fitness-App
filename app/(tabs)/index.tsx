import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { MonumentalImage } from "@/components/decor/MonumentalImage";
import { NutritionIcon, WorkoutsIcon } from "@/components/icons/TabIcons";
import { ProgressRing } from "@/components/ProgressRing";
import { ThemedText } from "@/components/ThemedText";
import { useTabBarContentClearance } from "@/constants/layout";
import { useSession } from "@/features/auth/hooks";
import {
  computeStreak,
  lastSevenDays,
  toDateKey,
  weightTrend as computeWeightTrend,
  workoutDayKeys,
  workoutsWithinDays,
} from "@/features/dashboard/utils";
import { useBodyMetrics, useLatestBodyMetric } from "@/features/metrics/hooks";
import { WeightChart } from "@/features/metrics/components/WeightChart";
import { useDailySummary, useLatestGoal, useLoggedMealDates } from "@/features/nutrition/hooks";
import { useWorkoutHistory } from "@/features/workouts/hooks";
import { useDesignTheme } from "@/theme/useDesignTheme";

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

// How far back to look for streak purposes — plenty for any believable
// streak, cheap enough to query in full rather than needing pagination.
const STREAK_WINDOW_DAYS = 60;

function daysAgoDateKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateKey(d);
}

// Every piece of the dashboard is its own self-contained tile now (per
// design feedback: "everything is like a widget") rather than one long
// stack of full-bleed cards — small, focused ones pair up two-to-a-row.
// Kept the app's existing sharp-cornered/bordered tile look rather than
// adopting rounded corners, since literally nothing else in the app (every
// Button/TextField/ChipSelect, both design themes) uses border radius —
// the floating tab bar is a deliberate, one-off exception for a
// navigational element, not a new content-card convention.
function Widget({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View className={`gap-2 border border-border bg-ground-raised p-4 ${className ?? ""}`}>
      {label ? (
        <ThemedText variant="label" className="text-xs text-ink-dim">
          {label}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

function WidgetRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row gap-3">{children}</View>;
}

export default function DashboardScreen() {
  const { tokens } = useDesignTheme();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const date = toDateKey(new Date());

  const { data: goal } = useLatestGoal(userId);
  const { data: summary } = useDailySummary(userId, date);
  const { data: workoutHistory } = useWorkoutHistory(userId);
  const { data: bodyMetrics } = useBodyMetrics(userId, 14);
  const { data: latestBodyMetric } = useLatestBodyMetric(userId);
  const { data: loggedMealDates } = useLoggedMealDates(userId, daysAgoDateKey(STREAK_WINDOW_DAYS));

  const caloriesConsumed = summary?.total_calories ?? 0;
  const caloriesTarget = goal?.calories_target ?? 0;
  const progress = caloriesTarget > 0 ? caloriesConsumed / caloriesTarget : 0;
  const caloriesRemaining = caloriesTarget - caloriesConsumed;

  const lastWorkout = workoutHistory?.[0];
  const tabBarClearance = useTabBarContentClearance();

  const week = lastSevenDays();
  const workoutDays = workoutDayKeys(workoutHistory ?? []);
  const weightTrend = computeWeightTrend(bodyMetrics ?? [], latestBodyMetric?.weight_kg);

  // Active on a given day = a workout and/or a meal logged that day.
  // Known limitation: useWorkoutHistory caps at the 50 most recent
  // *finished* workouts (listWorkoutHistory has no pagination), so the
  // workout half of this could undercount for a user averaging more than
  // ~1.2 finished workouts/day across the whole STREAK_WINDOW_DAYS window
  // — an unusually high logging frequency, not worth paginating for now.
  const activeDays = new Set([...workoutDays, ...(loggedMealDates ?? [])]);
  const streak = computeStreak(activeDays);

  const macros = [
    { label: "Protein", value: summary?.total_protein_g, target: goal?.protein_g_target },
    { label: "Carbs", value: summary?.total_carbs_g, target: goal?.carbs_g_target },
    { label: "Fat", value: summary?.total_fat_g, target: goal?.fat_g_target },
  ];

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

        <View className="gap-3 px-6">
          {/* Current streak — a workout and/or a meal logged, counted
              backward from today (or yesterday if today's still open). */}
          <Widget>
            <View className="flex-row items-baseline justify-between">
              <View className="flex-row items-baseline gap-2">
                <ThemedText variant="display" className="text-3xl text-ink">
                  {streak}
                </ThemedText>
                <ThemedText variant="body" className="text-sm text-ink-dim">
                  day{streak === 1 ? "" : "s"} streak
                </ThemedText>
              </View>
              {streak === 0 ? (
                <ThemedText variant="body" className="text-xs text-ink-dim">
                  Log a workout or a meal to start one
                </ThemedText>
              ) : null}
            </View>
          </Widget>

          {/* Week strip — today and which of the last 7 days had a logged
              workout, at a glance. */}
          <Widget>
            <View className="flex-row justify-between">
              {week.map((d) => {
                const key = toDateKey(d);
                const isToday = key === date;
                const didWorkout = workoutDays.has(key);
                return (
                  <View key={key} className="items-center gap-1.5">
                    <ThemedText variant="label" className="text-[10px] text-ink-dim">
                      {new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(d)}
                    </ThemedText>
                    <View
                      className={`h-8 w-8 items-center justify-center border ${
                        isToday ? "border-ink" : "border-border"
                      }`}
                      style={didWorkout ? { backgroundColor: tokens.swatch.accent, borderColor: tokens.swatch.accent } : undefined}
                    >
                      <ThemedText
                        variant="bodyMedium"
                        className={`text-xs ${didWorkout ? "text-ground" : isToday ? "text-ink" : "text-ink-dim"}`}
                      >
                        {d.getDate()}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </Widget>

          <WidgetRow>
            <Widget label="Bodyweight" className="flex-1">
              {latestBodyMetric?.weight_kg != null ? (
                <>
                  <ThemedText variant="display" className="text-3xl text-ink">
                    {latestBodyMetric.weight_kg} kg
                  </ThemedText>
                  {weightTrend != null ? (
                    <ThemedText variant="body" className="text-sm text-ink-dim">
                      {weightTrend === 0
                        ? "No change"
                        : `${weightTrend > 0 ? "+" : ""}${weightTrend.toFixed(1)} kg ${weightTrend > 0 ? "↑" : "↓"}`}
                    </ThemedText>
                  ) : (
                    <ThemedText variant="body" className="text-sm text-ink-dim">
                      Log a few days to see a trend
                    </ThemedText>
                  )}
                </>
              ) : (
                <ThemedText variant="body" className="text-sm text-ink-dim">
                  No weight logged yet
                </ThemedText>
              )}
            </Widget>

            <Widget label="This Week" className="flex-1">
              <View className="flex-1 flex-row items-end justify-between gap-1 pt-2">
                {week.map((d) => {
                  const key = toDateKey(d);
                  const didWorkout = workoutDays.has(key);
                  return (
                    <View
                      key={key}
                      className="w-2 border"
                      style={{
                        height: didWorkout ? 32 : 10,
                        backgroundColor: didWorkout ? tokens.swatch.accent : "transparent",
                        borderColor: didWorkout ? tokens.swatch.accent : tokens.swatch.border,
                      }}
                    />
                  );
                })}
              </View>
              <ThemedText variant="body" className="text-sm text-ink-dim">
                {workoutsWithinDays(workoutHistory ?? [], week)} workouts
              </ThemedText>
            </Widget>
          </WidgetRow>

          <WidgetRow>
            <Widget label="Calories" className="flex-1 items-center">
              <ProgressRing progress={progress} size={104} strokeWidth={3}>
                <ThemedText variant="display" className="text-xl text-ink">
                  {round(caloriesConsumed)}
                </ThemedText>
                <ThemedText variant="label" className="text-[9px] text-ink-dim">
                  / {caloriesTarget || "—"} kcal
                </ThemedText>
              </ProgressRing>
              <ThemedText variant="body" className="text-center text-xs text-ink-dim">
                {caloriesTarget > 0
                  ? caloriesRemaining >= 0
                    ? `${round(caloriesRemaining)} kcal left`
                    : `${round(-caloriesRemaining)} kcal over`
                  : "Set your goals"}
              </ThemedText>
            </Widget>

            <Widget label="Macros" className="flex-1 justify-center gap-3">
              {macros.map((m) => (
                <View key={m.label} className="gap-1">
                  {/* Stacked, not side-by-side — a letter-spaced uppercase
                      label plus "90g / 140g" doesn't reliably fit on one
                      line in a half-width widget at narrower phone sizes. */}
                  <ThemedText variant="label" className="text-[10px] text-ink-dim">
                    {m.label.toUpperCase()}
                  </ThemedText>
                  <ThemedText variant="bodyMedium" className="text-xs text-ink">
                    {round(m.value ?? 0)}g{m.target ? ` / ${m.target}g` : ""}
                  </ThemedText>
                  <View className="h-1 bg-ground">
                    <View
                      className="h-1"
                      style={{
                        width: `${m.target ? Math.min(100, ((m.value ?? 0) / m.target) * 100) : 0}%`,
                        backgroundColor: tokens.swatch.accent,
                      }}
                    />
                  </View>
                </View>
              ))}
            </Widget>
          </WidgetRow>

          <Widget label="Weight Trend">
            <WeightChart metrics={bodyMetrics ?? []} />
          </Widget>

          <Widget label="Last Workout">
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
          </Widget>

          <WidgetRow>
            <Widget className="flex-1 gap-4">
              <WorkoutsIcon color={tokens.swatch.ink} size={26} />
              <View className="gap-0.5">
                <ThemedText variant="bodyMedium" className="text-base text-ink">
                  Workouts
                </ThemedText>
                <ThemedText variant="body" className="text-xs text-ink-dim">
                  Track and improve
                </ThemedText>
              </View>
              <Button label="Start" variant="secondary" onPress={() => router.push("/workouts")} />
            </Widget>

            <Widget className="flex-1 gap-4">
              <NutritionIcon color={tokens.swatch.ink} size={26} />
              <View className="gap-0.5">
                <ThemedText variant="bodyMedium" className="text-base text-ink">
                  Meals
                </ThemedText>
                <ThemedText variant="body" className="text-xs text-ink-dim">
                  Log and track nutrition
                </ThemedText>
              </View>
              <Button label="Log" variant="secondary" onPress={() => router.push("/nutrition")} />
            </Widget>
          </WidgetRow>
        </View>
      </ScrollView>
    </View>
  );
}
