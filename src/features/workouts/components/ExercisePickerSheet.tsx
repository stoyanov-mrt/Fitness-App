import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useExerciseSearch } from "@/features/workouts/hooks";
import type { Exercise } from "@/features/workouts/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

import { CustomExerciseForm } from "./CustomExerciseForm";

type ExercisePickerSheetProps = {
  visible: boolean;
  userId: string | undefined;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  // Exercises already present in the target workout/routine, hidden from
  // results. Prevents adding the same exercise twice — WorkoutExerciseCard's
  // per-row field ids are scoped by exercise name (see that component), so a
  // workout couldn't otherwise tell two "Bench Press" rows apart in tests.
  excludeExerciseIds?: string[];
};

type Step = "search" | "custom";

// Shared by the routine builder and the active workout logger — both need
// "search the library, pick one" plus "or add one that isn't in it yet".
export function ExercisePickerSheet({
  visible,
  userId,
  onClose,
  onSelect,
  excludeExerciseIds,
}: ExercisePickerSheetProps) {
  const { tokens } = useDesignTheme();
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const { data: exercises, isLoading } = useExerciseSearch(query);
  const results = excludeExerciseIds
    ? (exercises ?? []).filter((exercise) => !excludeExerciseIds.includes(exercise.id))
    : (exercises ?? []);

  const close = () => {
    setStep("search");
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View className="flex-1 bg-ground pt-16">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <ThemedText variant="display" className="text-xl text-ink">
            Add Exercise
          </ThemedText>
          <Pressable onPress={close} accessibilityRole="button">
            <ThemedText variant="bodyMedium" className="text-base text-ink-dim">
              Close
            </ThemedText>
          </Pressable>
        </View>

        {step === "search" ? (
          <>
            <TextInput
              className="mx-4 mb-3 border border-border bg-ground-raised px-3 py-2.5 text-base text-ink"
              style={{ fontFamily: tokens.fonts.body }}
              placeholder="Search exercises..."
              placeholderTextColor={tokens.swatch.inkDim}
              autoCapitalize="none"
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search exercises"
              testID="Search exercises"
            />

            {isLoading ? (
              <ThemedText variant="body" className="px-4 text-ink-dim">
                Loading...
              </ThemedText>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                contentContainerClassName="px-4 pb-4"
                ListEmptyComponent={
                  <ThemedText variant="body" className="px-1 py-4 text-ink-dim">
                    No exercises found.
                  </ThemedText>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onSelect(item);
                      setQuery("");
                    }}
                    className="border-b border-border py-3"
                  >
                    <ThemedText variant="bodyMedium" className="text-base text-ink">
                      {item.name}
                    </ThemedText>
                    <ThemedText variant="body" className="text-sm text-ink-dim">
                      {[item.primary_muscle, item.equipment].filter(Boolean).join(" · ")}
                    </ThemedText>
                  </Pressable>
                )}
              />
            )}
            <View className="border-t border-border p-4">
              <Button
                label="Can't find it? Add a custom exercise"
                variant="secondary"
                onPress={() => setStep("custom")}
              />
            </View>
          </>
        ) : null}

        {step === "custom" ? (
          <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
            <CustomExerciseForm
              userId={userId}
              submitLabel="Save & add to workout"
              onSaved={(exercise) => {
                onSelect(exercise);
                close();
              }}
              onCancel={() => setStep("search")}
              cancelLabel="Back to search"
            />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}
