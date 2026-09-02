import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { useExercise, useExerciseHistory } from "@/features/workouts/hooks";
import { detectPersonalRecords } from "@/features/workouts/utils/prDetection";

function formatWeight(value: number | undefined) {
  if (value == null) return "—";
  return `${Math.round(value * 10) / 10} kg`;
}

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { data: exercise, isLoading } = useExercise(exerciseId);
  const { data: history } = useExerciseHistory(exerciseId);

  const records = history ? detectPersonalRecords(history) : null;

  if (isLoading || !exercise) {
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
          {exercise.name}
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          {[exercise.primary_muscle, exercise.equipment, exercise.category]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>

      <View className="gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Personal Records
        </Text>
        {records &&
        (records.heaviestWeight || records.bestEstimatedOneRepMax || records.bestSessionVolume) ? (
          <View className="gap-1.5">
            <View className="flex-row justify-between">
              <Text className="text-neutral-500 dark:text-neutral-400">Heaviest weight</Text>
              <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                {formatWeight(records.heaviestWeight?.value)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-500 dark:text-neutral-400">Best est. 1RM</Text>
              <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                {formatWeight(records.bestEstimatedOneRepMax?.value)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-500 dark:text-neutral-400">Best session volume</Text>
              <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                {formatWeight(records.bestSessionVolume?.value)}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="text-neutral-500 dark:text-neutral-400">
            No sets logged for this exercise yet.
          </Text>
        )}
      </View>

      {exercise.instructions ? (
        <View className="gap-2">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Instructions
          </Text>
          <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-300">
            {exercise.instructions}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
