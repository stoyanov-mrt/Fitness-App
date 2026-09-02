import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { useSession } from "@/features/auth/hooks";
import { useDeleteRoutine, useRoutine, useStartWorkout } from "@/features/workouts/hooks";

export default function RoutineDetailScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { data: session } = useSession();
  const { data: routine, isLoading } = useRoutine(routineId);
  const startWorkout = useStartWorkout(session?.user.id);
  const deleteRoutine = useDeleteRoutine(session?.user.id);

  if (isLoading || !routine) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text className="text-neutral-500 dark:text-neutral-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-6"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          {routine.name}
        </Text>
        {routine.description ? (
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            {routine.description}
          </Text>
        ) : null}
      </View>

      <View className="gap-2">
        {routine.routine_exercises.map((re) => (
          <View
            key={re.id}
            className="flex-row items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <Text className="font-medium text-neutral-900 dark:text-neutral-50">
              {re.exercise.name}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {re.target_sets ? `${re.target_sets} × ${re.target_reps ?? "?"}` : "—"}
            </Text>
          </View>
        ))}
      </View>

      <Button
        label="Start Workout"
        loading={startWorkout.isPending}
        onPress={() =>
          startWorkout.mutate(
            { routineId: routine.id, name: routine.name },
            {
              onSuccess: (workout) => router.replace(`/workouts/session/${workout.id}`),
            }
          )
        }
      />

      <Button
        label="Delete Routine"
        variant="secondary"
        loading={deleteRoutine.isPending}
        onPress={() =>
          deleteRoutine.mutate(routine.id, { onSuccess: () => router.back() })
        }
      />
    </ScrollView>
  );
}
