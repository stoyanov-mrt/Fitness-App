import { useState } from "react";
import { FlatList, Modal, Pressable, TextInput, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useExerciseSearch } from "@/features/workouts/hooks";
import type { Exercise } from "@/features/workouts/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

type ExercisePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
};

// Shared by the routine builder and the active workout logger — both need
// "search the library, pick one" and nothing route-navigation-worthy.
export function ExercisePickerSheet({ visible, onClose, onSelect }: ExercisePickerSheetProps) {
  const { tokens } = useDesignTheme();
  const [query, setQuery] = useState("");
  const { data: exercises, isLoading } = useExerciseSearch(query);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-ground pt-16">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <ThemedText variant="display" className="text-xl text-ink">
            Add Exercise
          </ThemedText>
          <Pressable onPress={onClose} accessibilityRole="button">
            <ThemedText variant="bodyMedium" className="text-base text-ink-dim">
              Close
            </ThemedText>
          </Pressable>
        </View>

        <TextInput
          className="mx-4 mb-3 border border-border bg-ground-raised px-3 py-2.5 text-base text-ink"
          style={{ fontFamily: tokens.fonts.body }}
          placeholder="Search exercises..."
          placeholderTextColor={tokens.swatch.inkDim}
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
        />

        {isLoading ? (
          <ThemedText variant="body" className="px-4 text-ink-dim">
            Loading...
          </ThemedText>
        ) : (
          <FlatList
            data={exercises ?? []}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-8"
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
      </View>
    </Modal>
  );
}
