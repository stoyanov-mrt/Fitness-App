import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

import type { DailyNutritionSummary, Food, Goal, MealType, MealWithItems } from "./types";

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
