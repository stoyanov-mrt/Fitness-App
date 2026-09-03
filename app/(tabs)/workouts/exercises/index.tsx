import { router } from "expo-router";
import { FlatList, Pressable, TextInput, View } from "react-native";

import { useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { useExerciseSearch } from "@/features/workouts/hooks";
import { useDesignTheme } from "@/theme/useDesignTheme";

const CATEGORIES = [
  { value: undefined, label: "All" },
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
] as const;

export default function ExerciseLibraryScreen() {
  const { tokens } = useDesignTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: exercises, isLoading } = useExerciseSearch(query, category);

  return (
    <View className="flex-1 bg-ground">
      <View className="gap-3 px-4 py-4">
        <TextInput
          className="border border-border bg-ground-raised px-3 py-2.5 text-base text-ink"
          style={{ fontFamily: tokens.fonts.body }}
          placeholder="Search exercises..."
          placeholderTextColor={tokens.swatch.inkDim}
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
        />
        <View className="flex-row gap-2">
          {CATEGORIES.map((c) => {
            const selected = category === c.value;
            return (
              <Pressable
                key={c.label}
                accessibilityRole="button"
                onPress={() => setCategory(c.value)}
                className={`border px-3 py-1.5 ${
                  selected ? "border-ink bg-ink" : "border-border bg-ground-raised"
                }`}
              >
                <ThemedText
                  variant="bodyMedium"
                  className={`text-sm ${selected ? "text-ground" : "text-ink-dim"}`}
                >
                  {c.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

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
              onPress={() => router.push(`/workouts/exercises/${item.id}`)}
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
  );
}
