import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

import type {
  DailyNutritionSummary,
  Food,
  Goal,
  MealType,
  MealWithItems,
  SavedMealWithItems,
} from "./types";

type FoodInsert = Database["public"]["Tables"]["foods"]["Insert"];

// ---- Foods ------------------------------------------------------------------

export async function searchFoods(query: string) {
  let request = supabase.from("foods").select("*").order("name").limit(50);
  if (query.trim()) request = request.ilike("name", `%${query.trim()}%`);
  const { data, error } = await request;
  if (error) throw error;
  return data as Food[];
}

export async function createCustomFood(
  userId: string,
  food: Omit<FoodInsert, "is_custom" | "created_by">
) {
  const { data, error } = await supabase
    .from("foods")
    .insert({ ...food, is_custom: true, created_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as Food;
}

/**
 * Looks up a scanned barcode: checks the local `foods` table first, then
 * falls back to the barcode-lookup Edge Function (which queries Open Food
 * Facts and upserts the result) if nothing local matches.
 */
export async function lookupBarcode(barcode: string): Promise<Food | null> {
  const { data: existing, error: existingError } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing as Food;

  const { data, error } = await supabase.functions.invoke<{ food: Food | null }>(
    "barcode-lookup",
    { body: { barcode } }
  );
  if (error) throw error;
  return data?.food ?? null;
}

// ---- Diary --------------------------------------------------------------------

function todayDateString() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
}

export async function getDailyDiary(userId: string, date: string = todayDateString()) {
  const { data, error } = await supabase
    .from("meals")
    .select("*, meal_items(*, food:foods(*))")
    .eq("user_id", userId)
    .eq("date", date);
  if (error) throw error;
  return data as unknown as MealWithItems[];
}

export async function getDailySummary(
  userId: string,
  date: string = todayDateString()
): Promise<DailyNutritionSummary | null> {
  const { data, error } = await supabase
    .from("daily_nutrition_summary")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Every distinct date (on or after `sinceDate`) with at least one meal
 * *item* logged — used for the dashboard's activity streak. The `!inner`
 * join is required, not just an optimization: a `meals` row can exist with
 * zero items (removeMealItem doesn't clean up an emptied parent, and the
 * food diary screen already renders that as an empty, ordinary state), so
 * a plain select on `meals` would count a date as "logged" even after the
 * user deleted everything they added to it. Same pattern as
 * workout_exercises!inner in workouts/api.ts's getExerciseSetHistory. */
export async function listLoggedMealDates(userId: string, sinceDate: string) {
  const { data, error } = await supabase
    .from("meals")
    .select("date, meal_items!inner(id)")
    .eq("user_id", userId)
    .gte("date", sinceDate);
  if (error) throw error;
  return [...new Set(data.map((m) => m.date))];
}

async function ensureMeal(userId: string, date: string, mealType: MealType) {
  const { data: existing, error: existingError } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("meal_type", mealType)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("meals")
    .insert({ user_id: userId, date, meal_type: mealType })
    .select("*")
    .single();
  if (createError) throw createError;
  return created;
}

export async function addMealItem(
  userId: string,
  date: string,
  mealType: MealType,
  foodId: string,
  quantity: number
) {
  const meal = await ensureMeal(userId, date, mealType);
  const { data, error } = await supabase
    .from("meal_items")
    .insert({ meal_id: meal.id, food_id: foodId, quantity })
    .select("*, food:foods(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function removeMealItem(mealItemId: string) {
  const { error } = await supabase.from("meal_items").delete().eq("id", mealItemId);
  if (error) throw error;
}

// ---- Saved meals ----------------------------------------------------------------
// A reusable bundle of foods + quantities (e.g. "my usual breakfast") a user
// logs to their diary in one action. Not tied to a date/meal_type itself —
// logSavedMeal below creates real meal_items rows via the same ensureMeal
// path addMealItem uses.

export async function listSavedMeals(userId: string): Promise<SavedMealWithItems[]> {
  const { data, error } = await supabase
    .from("saved_meals")
    .select("*, saved_meal_items(*, food:foods(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as SavedMealWithItems[];
}

export async function createSavedMeal(
  userId: string,
  name: string,
  items: { foodId: string; quantity: number }[]
) {
  const { data: savedMeal, error } = await supabase
    .from("saved_meals")
    .insert({ user_id: userId, name })
    .select("*")
    .single();
  if (error) throw error;

  if (items.length > 0) {
    const rows = items.map((item) => ({
      saved_meal_id: savedMeal.id,
      food_id: item.foodId,
      quantity: item.quantity,
    }));
    const { error: itemsError } = await supabase.from("saved_meal_items").insert(rows);
    if (itemsError) throw itemsError;
  }

  return savedMeal;
}

export async function deleteSavedMeal(savedMealId: string) {
  const { error } = await supabase.from("saved_meals").delete().eq("id", savedMealId);
  if (error) throw error;
}

/** Logs every item in a saved meal to the given date/meal_type in one go. */
export async function logSavedMeal(
  userId: string,
  date: string,
  mealType: MealType,
  savedMealId: string
) {
  const { data: items, error: itemsError } = await supabase
    .from("saved_meal_items")
    .select("food_id, quantity")
    .eq("saved_meal_id", savedMealId);
  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];

  const meal = await ensureMeal(userId, date, mealType);
  const rows = items.map((item) => ({
    meal_id: meal.id,
    food_id: item.food_id,
    quantity: item.quantity,
  }));
  const { data, error } = await supabase.from("meal_items").insert(rows).select("*, food:foods(*)");
  if (error) throw error;
  return data;
}

// ---- Goals (read-only here; created during onboarding) ------------------------

export async function getLatestGoal(userId: string): Promise<Goal | null> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
