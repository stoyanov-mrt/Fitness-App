import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/features/auth/hooks";
import { CustomExerciseForm } from "@/features/workouts/components/CustomExerciseForm";
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
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [addingCustom, setAddingCustom] = useState(false);
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
                className={`border-2 px-3 py-1.5 ${
                  selected ? "border-accent bg-accent" : "border-border bg-ground-raised"
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
        <Button
          label="+ Add Custom Exercise"
          variant="secondary"
          onPress={() => setAddingCustom(true)}
        />
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

      <Modal visible={addingCustom} animationType="slide" onRequestClose={() => setAddingCustom(false)}>
        {/* RN Web's Modal portals its content to document.body, outside the
            DOM subtree that carries the theme's CSS custom properties
            (applied via NativeWind's vars() on the root layout View) — so
            without redeclaring them here, every themed color class inside
            this Modal silently resolves to nothing on web. Native is
            unaffected (Modal doesn't break React context there), but this
            costs nothing on native either. */}
        <View className="flex-1 bg-ground pt-16" style={tokens.vars}>
          <View className="flex-row items-center justify-between px-4 pb-3">
            <ThemedText variant="display" className="text-xl text-ink">
              Add Custom Exercise
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={() => setAddingCustom(false)}>
              <ThemedText variant="bodyMedium" className="text-base text-ink-dim">
                Close
              </ThemedText>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="gap-4 px-4 pb-8" keyboardShouldPersistTaps="handled">
            <CustomExerciseForm
              userId={session?.user.id}
              onSaved={(exercise) => {
                setAddingCustom(false);
                router.push(`/workouts/exercises/${exercise.id}`);
              }}
              onCancel={() => setAddingCustom(false)}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
