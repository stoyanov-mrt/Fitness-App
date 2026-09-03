import { Link, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useTabBarContentClearance } from "@/constants/layout";
import { useSession } from "@/features/auth/hooks";
import { useRoutines, useStartWorkout, useWorkoutHistory } from "@/features/workouts/hooks";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WorkoutsScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { data: routines } = useRoutines(userId);
  const { data: history } = useWorkoutHistory(userId);
  const startWorkout = useStartWorkout(userId);
  const tabBarClearance = useTabBarContentClearance();

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerClassName="gap-6 px-6 pt-16"
      contentContainerStyle={{ paddingBottom: tabBarClearance }}
    >
      <ThemedText variant="display" className="text-3xl text-ink">
        Workouts
      </ThemedText>

      <Button
        label="Start Empty Workout"
        loading={startWorkout.isPending}
        onPress={() =>
          startWorkout.mutate(
            {},
            { onSuccess: (workout) => router.push(`/workouts/session/${workout.id}`) }
          )
        }
      />

      <Link href="/workouts/exercises" className="text-center text-sm text-ink">
        <ThemedText variant="bodyMedium" className="text-ink">
          Browse Exercise Library
        </ThemedText>
      </Link>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <ThemedText variant="label" className="text-xs text-ink-dim">
            Routines
          </ThemedText>
          <Link href="/workouts/routines/new" className="text-sm text-accent">
            <ThemedText variant="bodyMedium" className="text-accent">
              + New
            </ThemedText>
          </Link>
        </View>
        {routines && routines.length > 0 ? (
          routines.map((routine) => (
            <Pressable
              key={routine.id}
              accessibilityRole="button"
              onPress={() => router.push(`/workouts/routines/${routine.id}`)}
              className="border border-border bg-ground-raised p-4"
            >
              <ThemedText variant="bodyMedium" className="text-ink">
                {routine.name}
              </ThemedText>
            </Pressable>
          ))
        ) : (
          <ThemedText variant="body" className="text-ink-dim">
            No routines yet.
          </ThemedText>
        )}
      </View>

      <View className="gap-3">
        <ThemedText variant="label" className="text-xs text-ink-dim">
          History
        </ThemedText>
        {history && history.length > 0 ? (
          history.map((workout) => (
            <Pressable
              key={workout.id}
              accessibilityRole="button"
              onPress={() => router.push(`/workouts/session/${workout.id}`)}
              className="flex-row items-center justify-between border border-border bg-ground-raised p-4"
            >
              <ThemedText variant="bodyMedium" className="text-ink">
                {workout.name}
              </ThemedText>
              <ThemedText variant="body" className="text-sm text-ink-dim">
                {formatDate(workout.started_at)}
              </ThemedText>
            </Pressable>
          ))
        ) : (
          <ThemedText variant="body" className="text-ink-dim">
            No workouts logged yet.
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
}
