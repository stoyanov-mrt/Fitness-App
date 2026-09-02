export type Sex = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "cut" | "maintain" | "bulk";

export type TargetInputs = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type MacroTargets = {
  caloriesTarget: number;
  proteinGTarget: number;
  carbsGTarget: number;
  fatGTarget: number;
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calories added/subtracted from maintenance (TDEE) for each goal — a
// moderate, sustainable rate rather than an aggressive one.
const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

const SEX_OFFSET: Record<Sex, number> = {
  male: 5,
  female: -161,
  // No sex-specific data given: split the difference rather than assume.
  other: (5 + -161) / 2,
};

const PROTEIN_G_PER_KG = 2.0;
const FAT_CALORIE_FRACTION = 0.25;
const CALORIES_PER_G_PROTEIN = 4;
const CALORIES_PER_G_CARB = 4;
const CALORIES_PER_G_FAT = 9;
const MIN_CALORIES_TARGET = 1200;

/**
 * Mifflin-St Jeor BMR, scaled by activity level and adjusted for the user's
 * goal, then split into macro targets (protein by bodyweight, fat as a
 * fraction of calories, carbs filling the remainder).
 */
export function calculateTargets(inputs: TargetInputs): MacroTargets {
  const { sex, age, heightCm, weightKg, activityLevel, goal } = inputs;

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + SEX_OFFSET[sex];
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const caloriesTarget = Math.max(
    MIN_CALORIES_TARGET,
    Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[goal])
  );

  const proteinGTarget = Math.round(weightKg * PROTEIN_G_PER_KG);
  const fatGTarget = Math.round(
    (caloriesTarget * FAT_CALORIE_FRACTION) / CALORIES_PER_G_FAT
  );
  const proteinAndFatCalories =
    proteinGTarget * CALORIES_PER_G_PROTEIN + fatGTarget * CALORIES_PER_G_FAT;
  const carbsGTarget = Math.max(
    0,
    Math.round((caloriesTarget - proteinAndFatCalories) / CALORIES_PER_G_CARB)
  );

  return { caloriesTarget, proteinGTarget, carbsGTarget, fatGTarget };
}
