import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { useSession } from "@/features/auth/hooks";
import { ExercisePickerSheet } from "@/features/workouts/components/ExercisePickerSheet";
import { RestTimer } from "@/features/workouts/components/RestTimer";
import { WorkoutExerciseCard } from "@/features/workouts/components/WorkoutExerciseCard";
import { useAddExerciseToWorkout, useFinishWorkout, useWorkout } from "@/features/workouts/hooks";

const REST_SECONDS = 90;

export default function WorkoutSessionScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { data: session } = useSession();
  const { data: workout, isLoading } = useWorkout(workoutId);
  const addExercise = useAddExerciseToWorkout(workoutId);
  const finishWorkout = useFinishWorkout(session?.user.id);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [restTimerNonce, setRestTimerNonce] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);

  if (isLoading || !workout) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text className="text-neutral-500 dark:text-neutral-400">Loading...</Text>
      </View>
    );
  }

  const readOnly = !!workout.ended_at;
  const sortedExercises = [...workout.workout_exercises].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView contentContainerClassName="gap-4 px-6 py-6">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          {workout.name}
        </Text>

        {showRestTimer ? (
          <RestTimer
            key={restTimerNonce}
            durationSeconds={REST_SECONDS}
            onDismiss={() => setShowRestTimer(false)}
          />
        ) : null}

        {sortedExercises.length === 0 ? (
          <Text className="text-neutral-500 dark:text-neutral-400">
            No exercises yet — add one to get started.
          </Text>
        ) : null}

        {sortedExercises.map((we) => (
          <WorkoutExerciseCard
            key={we.id}
            workoutId={workout.id}
            workoutExercise={we}
            readOnly={readOnly}
            onSetLogged={() => {
              setRestTimerNonce((n) => n + 1);
              setShowRestTimer(true);
            }}
          />
        ))}

        {!readOnly ? (
          <Button
            label="+ Add Exercise"
            variant="secondary"
            onPress={() => setPickerVisible(true)}
          />
        ) : null}

        {!readOnly ? (
          <Button
            label="Finish Workout"
            loading={finishWorkout.isPending}
            onPress={() =>
              finishWorkout.mutate(workout.id, {
                onSuccess: () => router.replace("/workouts"),
              })
            }
          />
        ) : null}
      </ScrollView>

      <ExercisePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(exercise) => {
          addExercise.mutate({ exerciseId: exercise.id, orderIndex: sortedExercises.length });
          setPickerVisible(false);
        }}
      />
    </View>
  );
}
