import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { useCreateCustomExercise, useExerciseSearch } from "@/features/workouts/hooks";
import {
  customExerciseSchema,
  EXERCISE_CATEGORIES,
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLES,
  type CustomExerciseFormValues,
} from "@/features/workouts/schemas";
import type { Exercise } from "@/features/workouts/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

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

const CATEGORY_OPTIONS = EXERCISE_CATEGORIES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));
const MUSCLE_OPTIONS = EXERCISE_MUSCLES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));
const EQUIPMENT_OPTIONS = EXERCISE_EQUIPMENT.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

const customExerciseDefaults: CustomExerciseFormValues = {
  name: "",
  category: "strength",
  primaryMuscle: "chest",
  equipment: "dumbbell",
};

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
  const createCustomExercise = useCreateCustomExercise(userId);
  const results = excludeExerciseIds
    ? (exercises ?? []).filter((exercise) => !excludeExerciseIds.includes(exercise.id))
    : (exercises ?? []);

  const {
    control,
    handleSubmit,
    reset: resetCustomForm,
    formState: { errors },
  } = useForm<CustomExerciseFormValues>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: customExerciseDefaults,
  });

  const close = () => {
    setStep("search");
    setQuery("");
    resetCustomForm(customExerciseDefaults);
    onClose();
  };

  const onCreateCustom = handleSubmit((values) => {
    createCustomExercise.mutate(values, {
      onSuccess: (exercise) => {
        onSelect(exercise);
        close();
      },
    });
  });

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
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  label="Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <ChipSelect
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.category?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="primaryMuscle"
              render={({ field }) => (
                <ChipSelect
                  label="Muscle group"
                  options={MUSCLE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.primaryMuscle?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="equipment"
              render={({ field }) => (
                <ChipSelect
                  label="Equipment"
                  options={EQUIPMENT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.equipment?.message}
                />
              )}
            />
            {createCustomExercise.isError ? (
              <ThemedText variant="body" className="text-sm text-accent">
                Couldn&apos;t save this exercise.
              </ThemedText>
            ) : null}
            <Button
              label="Save & add to workout"
              onPress={onCreateCustom}
              loading={createCustomExercise.isPending}
            />
            <Button label="Back to search" variant="secondary" onPress={() => setStep("search")} />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}
