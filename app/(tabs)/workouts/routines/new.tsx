import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { useSession } from "@/features/auth/hooks";
import { ExercisePickerSheet } from "@/features/workouts/components/ExercisePickerSheet";
import { useCreateRoutine } from "@/features/workouts/hooks";
import type { Exercise } from "@/features/workouts/types";

type DraftExercise = { exercise: Exercise; targetSets: string; targetReps: string };

export default function NewRoutineScreen() {
  const { data: session } = useSession();
  const createRoutine = useCreateRoutine(session?.user.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  const onSave = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    createRoutine.mutate(
      {
        routine: { name: name.trim(), description: description.trim() || null },
        exercises: draftExercises.map((d) => ({
          exerciseId: d.exercise.id,
          targetSets: d.targetSets ? Number(d.targetSets) : null,
          targetReps: d.targetReps.trim() || null,
        })),
      },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerClassName="gap-6 px-6 py-6"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-4">
        <TextField
          label="Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (nameError) setNameError(undefined);
          }}
          error={nameError}
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View className="gap-3">
        <ThemedText variant="label" className="text-xs text-ink-dim">
          Exercises
        </ThemedText>

        {draftExercises.map((draft, index) => (
          <View
            key={`${draft.exercise.id}-${index}`}
            className="gap-3 border border-border bg-ground-raised p-3"
          >
            <View className="flex-row items-start justify-between gap-3">
              <ThemedText variant="bodyMedium" className="flex-1 text-ink">
                {draft.exercise.name}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDraftExercises((prev) => prev.filter((_, i) => i !== index))}
              >
                <ThemedText variant="label" className="text-xs text-accent">
                  Remove
                </ThemedText>
              </Pressable>
            </View>
            <View className="flex-row gap-3">
              <View className="w-16">
                <TextField
                  label="Sets"
                  keyboardType="numeric"
                  value={draft.targetSets}
                  onChangeText={(value) =>
                    setDraftExercises((prev) =>
                      prev.map((d, i) => (i === index ? { ...d, targetSets: value } : d))
                    )
                  }
                />
              </View>
              <View className="w-24">
                <TextField
                  label="Reps"
                  placeholder="8-12"
                  value={draft.targetReps}
                  onChangeText={(value) =>
                    setDraftExercises((prev) =>
                      prev.map((d, i) => (i === index ? { ...d, targetReps: value } : d))
                    )
                  }
                />
              </View>
            </View>
          </View>
        ))}

        <Button
          label="+ Add Exercise"
          variant="secondary"
          onPress={() => setPickerVisible(true)}
        />
      </View>

      {createRoutine.isError ? (
        <ThemedText variant="body" className="text-sm text-accent">
          {createRoutine.error instanceof Error
            ? createRoutine.error.message
            : "Couldn't save this routine"}
        </ThemedText>
      ) : null}

      <Button label="Save Routine" onPress={onSave} loading={createRoutine.isPending} />

      <ExercisePickerSheet
        visible={pickerVisible}
        userId={session?.user.id}
        onClose={() => setPickerVisible(false)}
        onSelect={(exercise) => {
          setDraftExercises((prev) => [...prev, { exercise, targetSets: "3", targetReps: "8-12" }]);
          setPickerVisible(false);
        }}
      />
    </ScrollView>
  );
}
