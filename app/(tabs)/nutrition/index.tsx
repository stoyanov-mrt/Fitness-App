import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Nutrition</Text>

      <View className="gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <View className="flex-row justify-between">
          <Text className="text-neutral-500 dark:text-neutral-400">Calories</Text>
          <Text className="font-medium text-neutral-900 dark:text-neutral-50">
            {round(caloriesConsumed)}
            {caloriesTarget != null ? ` / ${caloriesTarget}` : ""} kcal
          </Text>
        </View>
        {caloriesRemaining != null ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {caloriesRemaining >= 0
              ? `${round(caloriesRemaining)} kcal remaining`
              : `${round(-caloriesRemaining)} kcal over`}
          </Text>
        ) : null}
        <View className="mt-2 flex-row justify-between">
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            P {round(summary?.total_protein_g ?? 0)}g
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            C {round(summary?.total_carbs_g ?? 0)}g
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            F {round(summary?.total_fat_g ?? 0)}g
          </Text>
        </View>
      </View>

      <Link href="/nutrition/scan" className="text-center text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        Scan a Barcode
      </Link>

      {MEAL_TYPES.map((mealType) => {
        const meal = mealsByType.get(mealType);
        const items = meal?.meal_items ?? [];
        return (
          <View key={mealType} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {MEAL_LABELS[mealType]}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setAddingMealType(mealType)}>
                <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  + Add
                </Text>
              </Pressable>
            </View>

            {items.length === 0 ? (
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                Nothing logged yet.
              </Text>
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                      {item.food.name}
                    </Text>
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.quantity} × {round(item.food.calories)} kcal
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeMealItem.mutate(item.id)}
                  >
                    <Text className="text-sm font-medium text-red-600 dark:text-red-400">
                      Remove
                    </Text>
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
