import { useState } from "react";
import { Modal, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { useCreateSavedMeal } from "@/features/nutrition/hooks";
import { useDesignTheme } from "@/theme/useDesignTheme";

type SaveMealModalProps = {
  visible: boolean;
  userId: string | undefined;
  items: { foodId: string; quantity: number }[];
  onClose: () => void;
};

// Small centered dialog rather than a full-screen sheet like
// FoodPickerSheet/ExercisePickerSheet — a single text field plus two
// buttons doesn't need a whole screen.
export function SaveMealModal({ visible, userId, items, onClose }: SaveMealModalProps) {
  const { tokens } = useDesignTheme();
  const [name, setName] = useState("");
  const createSavedMeal = useCreateSavedMeal(userId);

  const close = () => {
    setName("");
    onClose();
  };

  const onSave = () => {
    if (!name.trim()) return;
    createSavedMeal.mutate({ name: name.trim(), items }, { onSuccess: close });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      {/* Re-declare the theme's CSS vars here — RN Web portals Modal content
          to document.body, outside the DOM subtree that carries them from
          the root layout, so every themed color class would otherwise
          silently resolve to nothing on web. See CustomExerciseForm's Modal
          for the fuller explanation. */}
      <View className="flex-1 items-center justify-center bg-black/60 px-8" style={tokens.vars}>
        <View className="w-full gap-4 border border-border bg-ground p-4">
          <ThemedText variant="display" className="text-lg text-ink">
            Save as a meal
          </ThemedText>
          <ThemedText variant="body" className="text-sm text-ink-dim">
            Save these {items.length} item{items.length === 1 ? "" : "s"} so you can log them
            together next time.
          </ThemedText>
          <TextField label="Name" value={name} onChangeText={setName} autoFocus />
          {createSavedMeal.isError ? (
            <ThemedText variant="body" className="text-sm text-accent">
              Couldn&apos;t save this meal.
            </ThemedText>
          ) : null}
          <Button label="Save" onPress={onSave} loading={createSavedMeal.isPending} />
          <Button label="Cancel" variant="secondary" onPress={close} />
        </View>
      </View>
    </Modal>
  );
}
