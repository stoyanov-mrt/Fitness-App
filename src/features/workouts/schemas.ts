import { z } from "zod";

// Mirrors the exact primary_muscle / equipment values used by the seeded
// exercise library (supabase/seed/free-exercise-db.json) so a custom
// exercise looks and filters the same as a seeded one — see
// ExercisePickerSheet's "custom" step.
export const EXERCISE_CATEGORIES = ["strength", "cardio", "mobility"] as const;

export const EXERCISE_MUSCLES = [
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower back",
  "middle back",
  "neck",
  "quadriceps",
  "shoulders",
  "traps",
  "triceps",
] as const;

export const EXERCISE_EQUIPMENT = [
  "bands",
  "barbell",
  "body only",
  "cable",
  "dumbbell",
  "e-z curl bar",
  "exercise ball",
  "foam roll",
  "kettlebells",
  "machine",
  "medicine ball",
  "other",
] as const;

export const customExerciseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.enum(EXERCISE_CATEGORIES),
  primaryMuscle: z.enum(EXERCISE_MUSCLES),
  equipment: z.enum(EXERCISE_EQUIPMENT),
});

export type CustomExerciseFormValues = z.infer<typeof customExerciseSchema>;
