import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { useCreateCustomExercise } from "@/features/workouts/hooks";
import {
  customExerciseSchema,
  EXERCISE_CATEGORIES,
  EXERCISE_EQUIPMENT,
  EXERCISE_MUSCLES,
  type CustomExerciseFormValues,
} from "@/features/workouts/schemas";
import type { Exercise } from "@/features/workouts/types";

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

type CustomExerciseFormProps = {
  userId: string | undefined;
  onSaved: (exercise: Exercise) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

// Shared by ExercisePickerSheet's "custom" step and the standalone exercise
// library screen's own "add custom exercise" entry point — same form
// either way, just a different place it's launched from and what happens
// on save.
export function CustomExerciseForm({
  userId,
  onSaved,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: CustomExerciseFormProps) {
  const createCustomExercise = useCreateCustomExercise(userId);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomExerciseFormValues>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: customExerciseDefaults,
  });

  const onSubmit = handleSubmit((values) => {
    createCustomExercise.mutate(values, { onSuccess: (exercise) => onSaved(exercise) });
  });

  return (
    <View className="gap-4">
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
      <Button label={submitLabel} onPress={onSubmit} loading={createCustomExercise.isPending} />
      {onCancel ? <Button label={cancelLabel} variant="secondary" onPress={onCancel} /> : null}
    </View>
  );
}
