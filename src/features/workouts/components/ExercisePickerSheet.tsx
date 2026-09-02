import { useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

import { useExerciseSearch } from "@/features/workouts/hooks";
import type { Exercise } from "@/features/workouts/types";

type ExercisePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
};

// Shared by the routine builder and the active workout logger — both need
// "search the library, pick one" and nothing route-navigation-worthy.
export function ExercisePickerSheet({ visible, onClose, onSelect }: ExercisePickerSheetProps) {
  const [query, setQuery] = useState("");
  const { data: exercises, isLoading } = useExerciseSearch(query);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white pt-16 dark:bg-neutral-950">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Add Exercise
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text className="text-base font-medium text-neutral-500 dark:text-neutral-400">
              Close
            </Text>
          </Pressable>
        </View>

        <TextInput
          className="mx-4 mb-3 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
          placeholder="Search exercises..."
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
        />

        {isLoading ? (
          <Text className="px-4 text-neutral-500 dark:text-neutral-400">Loading...</Text>
        ) : (
          <FlatList
            data={exercises ?? []}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 pb-8"
            ListEmptyComponent={
              <Text className="px-1 py-4 text-neutral-500 dark:text-neutral-400">
                No exercises found.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onSelect(item);
                  setQuery("");
                }}
                className="border-b border-neutral-100 py-3 dark:border-neutral-900"
              >
                <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                  {item.name}
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {[item.primary_muscle, item.equipment].filter(Boolean).join(" · ")}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
