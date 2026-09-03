import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTabBarContentClearance } from "@/constants/layout";
import { useSession } from "@/features/auth/hooks";
import { FoodPickerSheet } from "@/features/nutrition/components/FoodPickerSheet";
import { useDailyDiary, useDailySummary, useLatestGoal, useRemoveMealItem } from "@/features/nutrition/hooks";
import { MEAL_TYPES, type MealType, type MealWithItems } from "@/features/nutrition/types";

function todayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

function round(value: number) {
  return Math.round(value);
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function NutritionScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const date = todayDateString();

  const { data: goal } = useLatestGoal(userId);
  const { data: summary } = useDailySummary(userId, date);
  const { data: meals } = useDailyDiary(userId, date);
  const removeMealItem = useRemoveMealItem(userId, date);

  const [addingMealType, setAddingMealType] = useState<MealType | null>(null);

  const caloriesConsumed = summary?.total_calories ?? 0;
  const caloriesTarget = goal?.calories_target ?? null;
  const caloriesRemaining = caloriesTarget != null ? caloriesTarget - caloriesConsumed : null;

  const mealsByType = new Map<MealType, MealWithItems>();
  for (const meal of meals ?? []) {
    mealsByType.set(meal.meal_type as MealType, meal);
  }

  const tabBarClearance = useTabBarContentClearance();

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerClassName="gap-6 px-6 pt-16"
      contentContainerStyle={{ paddingBottom: tabBarClearance }}
    >
      <ThemedText variant="display" className="text-3xl text-ink">
        Nutrition
      </ThemedText>

      <View className="gap-2 border border-border bg-ground-raised p-4">
        <View className="flex-row justify-between">
          <ThemedText variant="body" className="text-ink-dim">
            Calories
          </ThemedText>
          <ThemedText variant="bodyMedium" className="text-ink">
            {round(caloriesConsumed)}
            {caloriesTarget != null ? ` / ${caloriesTarget}` : ""} kcal
          </ThemedText>
        </View>
        {caloriesRemaining != null ? (
          <ThemedText variant="body" className="text-sm text-ink-dim">
            {caloriesRemaining >= 0
              ? `${round(caloriesRemaining)} kcal remaining`
              : `${round(-caloriesRemaining)} kcal over`}
          </ThemedText>
        ) : null}
        <View className="mt-2 flex-row justify-between">
          <ThemedText variant="label" className="text-xs text-ink-dim">
            P {round(summary?.total_protein_g ?? 0)}g
          </ThemedText>
          <ThemedText variant="label" className="text-xs text-ink-dim">
            C {round(summary?.total_carbs_g ?? 0)}g
          </ThemedText>
          <ThemedText variant="label" className="text-xs text-ink-dim">
            F {round(summary?.total_fat_g ?? 0)}g
          </ThemedText>
        </View>
      </View>

      <Link href="/nutrition/scan" className="text-center text-sm text-ink">
        <ThemedText variant="bodyMedium" className="text-ink">
          Scan a Barcode
        </ThemedText>
      </Link>

      {MEAL_TYPES.map((mealType) => {
        const meal = mealsByType.get(mealType);
        const items = meal?.meal_items ?? [];
        return (
          <View key={mealType} className="gap-2">
            <View className="flex-row items-center justify-between">
              <ThemedText variant="label" className="text-xs text-ink-dim">
                {MEAL_LABELS[mealType]}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                // Scoped per meal type — this row repeats once per entry in
                // MEAL_TYPES, so a bare "+ Add" id would be ambiguous.
                accessibilityLabel={`Add to ${MEAL_LABELS[mealType]}`}
                testID={`Add to ${MEAL_LABELS[mealType]}`}
                onPress={() => setAddingMealType(mealType)}
              >
                <ThemedText variant="label" className="text-xs text-accent">
                  + Add
                </ThemedText>
              </Pressable>
            </View>

            {items.length === 0 ? (
              <ThemedText variant="body" className="text-sm text-ink-dim">
                Nothing logged yet.
              </ThemedText>
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between border border-border px-3 py-2"
                >
                  <View className="flex-1">
                    <ThemedText variant="bodyMedium" className="text-ink">
                      {item.food.name}
                    </ThemedText>
                    <ThemedText variant="body" className="text-xs text-ink-dim">
                      {item.quantity} × {round(item.food.calories)} kcal
                    </ThemedText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeMealItem.mutate(item.id)}
                  >
                    <ThemedText variant="label" className="text-xs text-accent">
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        );
      })}

      {addingMealType ? (
        <FoodPickerSheet
          visible
          userId={userId}
          date={date}
          mealType={addingMealType}
          onClose={() => setAddingMealType(null)}
        />
      ) : null}
    </ScrollView>
  );
}
