import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
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
          {exercise.name}
        </ThemedText>
        <ThemedText variant="body" className="text-base text-ink-dim">
          {[exercise.primary_muscle, exercise.equipment, exercise.category]
            .filter(Boolean)
            .join(" · ")}
        </ThemedText>
      </View>

      <View className="gap-2 border border-border bg-ground-raised p-4">
        <ThemedText variant="label" className="text-xs text-ink-dim">
          Personal Records
        </ThemedText>
        {records &&
        (records.heaviestWeight || records.bestEstimatedOneRepMax || records.bestSessionVolume) ? (
          <View className="gap-1.5">
            <View className="flex-row justify-between">
              <ThemedText variant="body" className="text-ink-dim">
                Heaviest weight
              </ThemedText>
              <ThemedText variant="bodyMedium" className="text-ink">
                {formatWeight(records.heaviestWeight?.value)}
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <ThemedText variant="body" className="text-ink-dim">
                Best est. 1RM
              </ThemedText>
              <ThemedText variant="bodyMedium" className="text-ink">
                {formatWeight(records.bestEstimatedOneRepMax?.value)}
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <ThemedText variant="body" className="text-ink-dim">
                Best session volume
              </ThemedText>
              <ThemedText variant="bodyMedium" className="text-ink">
                {formatWeight(records.bestSessionVolume?.value)}
              </ThemedText>
            </View>
          </View>
        ) : (
          <ThemedText variant="body" className="text-ink-dim">
            No sets logged for this exercise yet.
          </ThemedText>
        )}
      </View>

      {exercise.instructions ? (
        <View className="gap-2">
          <ThemedText variant="label" className="text-xs text-ink-dim">
            Instructions
          </ThemedText>
          <ThemedText variant="body" className="text-base leading-6 text-ink-dim">
            {exercise.instructions}
          </ThemedText>
        </View>
      ) : null}
    </ScrollView>
  );
}
