import { Link, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
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

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Workouts</Text>

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

      <Link href="/workouts/exercises" className="text-center text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        Browse Exercise Library
      </Link>

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Routines
          </Text>
          <Link href="/workouts/routines/new" className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            + New
          </Link>
        </View>
        {routines && routines.length > 0 ? (
          routines.map((routine) => (
            <Pressable
              key={routine.id}
              accessibilityRole="button"
              onPress={() => router.push(`/workouts/routines/${routine.id}`)}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                {routine.name}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text className="text-neutral-500 dark:text-neutral-400">No routines yet.</Text>
        )}
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          History
        </Text>
        {history && history.length > 0 ? (
          history.map((workout) => (
            <Pressable
              key={workout.id}
              accessibilityRole="button"
              onPress={() => router.push(`/workouts/session/${workout.id}`)}
              className="flex-row items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                {workout.name}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(workout.started_at)}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text className="text-neutral-500 dark:text-neutral-400">No workouts logged yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
