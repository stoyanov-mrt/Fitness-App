import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useLogSet } from "@/features/workouts/hooks";
import type { WorkoutExerciseWithSets } from "@/features/workouts/types";

type WorkoutExerciseCardProps = {
  workoutId: string;
  workoutExercise: WorkoutExerciseWithSets;
  readOnly: boolean;
  onSetLogged: () => void;
};

export function WorkoutExerciseCard({
  workoutId,
  workoutExercise,
  readOnly,
  onSetLogged,
}: WorkoutExerciseCardProps) {
  const logSet = useLogSet(workoutId, workoutExercise.id);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isWarmup, setIsWarmup] = useState(false);

  const sortedSets = [...workoutExercise.sets].sort((a, b) => a.set_index - b.set_index);

  const onLogSet = () => {
    const weightValue = Number(weight);
    const repsValue = Number(reps);
    if (!Number.isFinite(weightValue) || !Number.isFinite(repsValue) || repsValue <= 0) return;

    logSet.mutate(
      {
        set_index: sortedSets.length,
        weight: weightValue,
        reps: repsValue,
        is_warmup: isWarmup,
        rpe: null,
      },
      {
        onSuccess: () => {
          setReps("");
          setIsWarmup(false);
          onSetLogged();
        },
      }
    );
  };

  return (
    <View className="gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {workoutExercise.exercise.name}
      </Text>

      {sortedSets.length > 0 ? (
        <View className="gap-1.5">
          {sortedSets.map((set, index) => (
            <View key={set.id} className="flex-row items-center gap-3">
              <Text className="w-6 text-sm text-neutral-400">{index + 1}</Text>
              <Text className="flex-1 text-neutral-900 dark:text-neutral-50">
                {set.weight} kg × {set.reps} {set.is_warmup ? "(warm-up)" : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">No sets logged yet.</Text>
      )}

      {!readOnly ? (
        <View className="flex-row items-end gap-2">
          <View className="flex-1 gap-1">
            <Text
              numberOfLines={1}
              className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              kg
            </Text>
            <TextInput
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Reps
            </Text>
            <TextInput
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isWarmup }}
            onPress={() => setIsWarmup((w) => !w)}
            className={`rounded-lg border px-3 py-2.5 ${
              isWarmup
                ? "border-neutral-900 bg-neutral-900 dark:border-neutral-50 dark:bg-neutral-50"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isWarmup ? "text-white dark:text-neutral-900" : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Warm-up
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onLogSet}
            disabled={logSet.isPending}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 dark:bg-neutral-50"
          >
            <Text className="text-sm font-semibold text-white dark:text-neutral-900">Log</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
