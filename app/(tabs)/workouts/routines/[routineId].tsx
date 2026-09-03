import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/features/auth/hooks";
import {
  useDeleteRoutine,
  useDuplicateRoutine,
  useRoutine,
  useStartWorkout,
} from "@/features/workouts/hooks";

export default function RoutineDetailScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { data: session } = useSession();
  const { data: routine, isLoading } = useRoutine(routineId);
  const startWorkout = useStartWorkout(session?.user.id);
  const deleteRoutine = useDeleteRoutine(session?.user.id);
  const duplicateRoutine = useDuplicateRoutine(session?.user.id);

  if (isLoading || !routine) {
    return (
      <View className="flex-1 items-center justify-center bg-ground">
        <ThemedText variant="body" className="text-ink-dim">
          Loading...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ground" contentContainerClassName="gap-6 px-6 py-6">
      <View className="gap-1">
        <ThemedText variant="display" className="text-3xl text-ink">
          {routine.name}
        </ThemedText>
        {routine.description ? (
          <ThemedText variant="body" className="text-base text-ink-dim">
            {routine.description}
          </ThemedText>
        ) : null}
      </View>

      <View className="gap-2">
        {routine.routine_exercises.map((re) => (
          <View
            key={re.id}
            className="flex-row items-center justify-between border border-border bg-ground-raised p-3"
          >
            <ThemedText variant="bodyMedium" className="text-ink">
              {re.exercise.name}
            </ThemedText>
            <ThemedText variant="body" className="text-sm text-ink-dim">
              {re.target_sets ? `${re.target_sets} × ${re.target_reps ?? "?"}` : "—"}
            </ThemedText>
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
        label="Duplicate Routine"
        variant="secondary"
        loading={duplicateRoutine.isPending}
        onPress={() =>
          duplicateRoutine.mutate(routine.id, {
            onSuccess: (copy) => router.replace(`/workouts/routines/${copy.id}`),
          })
        }
      />

      {duplicateRoutine.isError ? (
        <ThemedText variant="body" className="text-sm text-accent">
          {duplicateRoutine.error instanceof Error
            ? duplicateRoutine.error.message
            : "Couldn't duplicate this routine."}
        </ThemedText>
      ) : null}

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
