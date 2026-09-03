import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { supabase } from "@/lib/supabase";

import { toCsv } from "./utils/csv";

async function shareCsv(filename: string, csv: string) {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: "text/csv", UTI: "public.comma-separated-values-text" });
  }
}

export async function exportWorkoutsCsv(userId: string) {
  const { data, error } = await supabase
    .from("sets")
    .select(
      "weight, reps, rpe, is_warmup, completed_at, workout_exercises!inner(exercise:exercises(name), workout:workouts!inner(name, user_id))"
    )
    .eq("workout_exercises.workout.user_id", userId)
    .order("completed_at", { ascending: true });
  if (error) throw error;

  const rows = data.map((set) => ({
    date: set.completed_at,
    workout: set.workout_exercises.workout.name,
    exercise: set.workout_exercises.exercise.name,
    weight_kg: set.weight,
    reps: set.reps,
    rpe: set.rpe,
    warmup: set.is_warmup ? "yes" : "no",
  }));

  const csv = toCsv(rows, [
    { key: "date", header: "Date" },
    { key: "workout", header: "Workout" },
    { key: "exercise", header: "Exercise" },
    { key: "weight_kg", header: "Weight (kg)" },
    { key: "reps", header: "Reps" },
    { key: "rpe", header: "RPE" },
    { key: "warmup", header: "Warm-up" },
  ]);

  await shareCsv("workout-history.csv", csv);
}

export async function exportNutritionCsv(userId: string) {
  const { data, error } = await supabase
    .from("meal_items")
    .select("quantity, logged_at, food:foods(name, calories, protein_g, carbs_g, fat_g), meal:meals!inner(date, meal_type, user_id)")
    .eq("meal.user_id", userId)
    .order("logged_at", { ascending: true });
  if (error) throw error;

  const rows = data.map((item) => ({
    date: item.meal.date,
    meal_type: item.meal.meal_type,
    food: item.food.name,
    quantity: item.quantity,
    calories: item.quantity * item.food.calories,
    protein_g: item.quantity * item.food.protein_g,
    carbs_g: item.quantity * item.food.carbs_g,
    fat_g: item.quantity * item.food.fat_g,
  }));

  const csv = toCsv(rows, [
    { key: "date", header: "Date" },
    { key: "meal_type", header: "Meal" },
    { key: "food", header: "Food" },
    { key: "quantity", header: "Quantity" },
    { key: "calories", header: "Calories" },
    { key: "protein_g", header: "Protein (g)" },
    { key: "carbs_g", header: "Carbs (g)" },
    { key: "fat_g", header: "Fat (g)" },
  ]);

  await shareCsv("nutrition-diary.csv", csv);
}
