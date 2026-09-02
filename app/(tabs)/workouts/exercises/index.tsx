import { router } from "expo-router";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { useState } from "react";

import { useExerciseSearch } from "@/features/workouts/hooks";

const CATEGORIES = [
  { value: undefined, label: "All" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
] as const;

export default function ExerciseLibraryScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: exercises, isLoading } = useExerciseSearch(query, category);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <View className="gap-3 px-4 py-4">
        <TextInput
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
          placeholder="Search exercises..."
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
        />
        <View className="flex-row gap-2">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.label}
              accessibilityRole="button"
              onPress={() => setCategory(c.value)}
              className={`rounded-full border px-3 py-1.5 ${
                category === c.value
                  ? "border-neutral-900 bg-neutral-900 dark:border-neutral-50 dark:bg-neutral-50"
                  : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  category === c.value
                    ? "text-white dark:text-neutral-900"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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
              onPress={() => router.push(`/workouts/exercises/${item.id}`)}
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
  );
}
