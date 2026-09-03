import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useLogSet } from "@/features/workouts/hooks";
import type { WorkoutExerciseWithSets } from "@/features/workouts/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

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
  const { tokens } = useDesignTheme();
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
    <View className="gap-3 border border-border bg-ground-raised p-4">
      <ThemedText variant="bodyMedium" className="text-lg text-ink">
        {workoutExercise.exercise.name}
      </ThemedText>

      {sortedSets.length > 0 ? (
        <View className="gap-1.5">
          {sortedSets.map((set, index) => (
            <View key={set.id} className="flex-row items-center gap-3">
              <ThemedText variant="body" className="w-6 text-sm text-ink-dim">
                {index + 1}
              </ThemedText>
              <ThemedText variant="body" className="flex-1 text-ink">
                {set.weight} kg × {set.reps} {set.is_warmup ? "(warm-up)" : ""}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText variant="body" className="text-sm text-ink-dim">
          No sets logged yet.
        </ThemedText>
      )}

      {!readOnly ? (
        <View className="flex-row items-end gap-2">
          <View className="flex-1 gap-1">
            <ThemedText variant="label" numberOfLines={1} className="text-xs text-ink-dim">
              kg
            </ThemedText>
            <TextInput
              className="border border-border bg-ground px-3 py-2 text-base text-ink"
              style={{ fontFamily: tokens.fonts.body }}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View className="flex-1 gap-1">
            <ThemedText variant="label" className="text-xs text-ink-dim">
              Reps
            </ThemedText>
            <TextInput
              className="border border-border bg-ground px-3 py-2 text-base text-ink"
              style={{ fontFamily: tokens.fonts.body }}
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isWarmup }}
            onPress={() => setIsWarmup((w) => !w)}
            className={`border px-3 py-2.5 ${isWarmup ? "border-ink bg-ink" : "border-border"}`}
          >
            <ThemedText
              variant="label"
              className={`text-xs ${isWarmup ? "text-ground" : "text-ink-dim"}`}
            >
              Warm-up
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onLogSet}
            disabled={logSet.isPending}
            className="border border-ink bg-ink px-4 py-2.5"
          >
            <ThemedText variant="label" className="text-sm text-ground">
              Log
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
