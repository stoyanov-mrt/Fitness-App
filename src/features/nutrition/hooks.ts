import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/types/database";

import {
  addMealItem,
  createCustomFood,
  createSavedMeal,
  deleteSavedMeal,
  getDailyDiary,
  getDailySummary,
  getLatestGoal,
  listSavedMeals,
  logSavedMeal,
  lookupBarcode,
  removeMealItem,
  searchFoods,
} from "./api";
import type { Food, MealItemWithFood, MealType, MealWithItems } from "./types";

type FoodInsert = Database["public"]["Tables"]["foods"]["Insert"];

function diaryQueryKey(userId: string | undefined, date: string) {
  return ["diary", userId, date] as const;
}
function summaryQueryKey(userId: string | undefined, date: string) {
  return ["diary-summary", userId, date] as const;
}

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ["foods", "search", query],
    queryFn: () => searchFoods(query),
  });
}

export function useDailyDiary(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: diaryQueryKey(userId, date),
    queryFn: () => getDailyDiary(userId as string, date),
    enabled: !!userId,
  });
}

export function useDailySummary(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: summaryQueryKey(userId, date),
    queryFn: () => getDailySummary(userId as string, date),
    enabled: !!userId,
  });
}

export function useLatestGoal(userId: string | undefined) {
  return useQuery({
    queryKey: ["latest-goal", userId],
    queryFn: () => getLatestGoal(userId as string),
    enabled: !!userId,
  });
}

/**
 * Optimistic per CLAUDE.md's offline strategy — a logged food item appears
 * in the diary instantly, rolling back on failure — same onMutate/onError
 * pattern as useLogSet in the workouts feature. The daily summary is
 * server-computed (a view), so it's invalidated rather than optimistically
 * recomputed client-side.
 */
export function useAddMealItem(userId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  const queryKey = diaryQueryKey(userId, date);

  return useMutation({
    mutationFn: ({
      mealType,
      food,
      quantity,
    }: {
      mealType: MealType;
      food: Food;
      quantity: number;
    }) => addMealItem(userId as string, date, mealType, food.id, quantity),
    onMutate: async ({ mealType, food, quantity }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealWithItems[]>(queryKey);

      const optimisticItem: MealItemWithFood = {
        id: `optimistic-${Date.now()}`,
        meal_id: `optimistic-meal-${mealType}`,
        food_id: food.id,
        quantity,
        logged_at: new Date().toISOString(),
        food,
      };

      const existing = previous ?? [];
      const existingMeal = existing.find((meal) => meal.meal_type === mealType);

      const next: MealWithItems[] = existingMeal
        ? existing.map((meal) =>
            meal.meal_type === mealType
              ? { ...meal, meal_items: [...meal.meal_items, optimisticItem] }
              : meal
          )
        : [
            ...existing,
            {
              id: `optimistic-meal-${mealType}`,
              user_id: userId as string,
              date,
              meal_type: mealType,
              created_at: new Date().toISOString(),
              meal_items: [optimisticItem],
            },
          ];

      queryClient.setQueryData<MealWithItems[]>(queryKey, next);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: summaryQueryKey(userId, date) });
    },
  });
}

export function useRemoveMealItem(userId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealItemId: string) => removeMealItem(mealItemId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: diaryQueryKey(userId, date) });
      queryClient.invalidateQueries({ queryKey: summaryQueryKey(userId, date) });
    },
  });
}

export function useCreateCustomFood(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (food: Omit<FoodInsert, "is_custom" | "created_by">) =>
      createCustomFood(userId as string, food),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["foods", "search"] }),
  });
}

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (barcode: string) => lookupBarcode(barcode),
  });
}

function savedMealsQueryKey(userId: string | undefined) {
  return ["saved-meals", userId] as const;
}

export function useSavedMeals(userId: string | undefined) {
  return useQuery({
    queryKey: savedMealsQueryKey(userId),
    queryFn: () => listSavedMeals(userId as string),
    enabled: !!userId,
  });
}

export function useCreateSavedMeal(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      items,
    }: {
      name: string;
      items: { foodId: string; quantity: number }[];
    }) => createSavedMeal(userId as string, name, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: savedMealsQueryKey(userId) }),
  });
}

export function useDeleteSavedMeal(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedMealId: string) => deleteSavedMeal(savedMealId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: savedMealsQueryKey(userId) }),
  });
}

/** Logs every item in a saved meal to a specific date/meal_type at once. */
export function useLogSavedMeal(userId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealType, savedMealId }: { mealType: MealType; savedMealId: string }) =>
      logSavedMeal(userId as string, date, mealType, savedMealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryQueryKey(userId, date) });
      queryClient.invalidateQueries({ queryKey: summaryQueryKey(userId, date) });
    },
  });
}
