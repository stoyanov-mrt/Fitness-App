import type { Database } from "@/types/database";

export type Food = Database["public"]["Tables"]["foods"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type MealItem = Database["public"]["Tables"]["meal_items"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type DailyNutritionSummary = Database["public"]["Views"]["daily_nutrition_summary"]["Row"];

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export type MealItemWithFood = MealItem & { food: Food };
export type MealWithItems = Meal & { meal_items: MealItemWithFood[] };

export type SavedMeal = Database["public"]["Tables"]["saved_meals"]["Row"];
export type SavedMealItem = Database["public"]["Tables"]["saved_meal_items"]["Row"];
export type SavedMealItemWithFood = SavedMealItem & { food: Food };
export type SavedMealWithItems = SavedMeal & { saved_meal_items: SavedMealItemWithFood[] };
