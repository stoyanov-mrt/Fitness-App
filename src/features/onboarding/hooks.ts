import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createGoal, getProfile, updateProfile } from "./api";
import { ageFromDateOfBirth, type OnboardingFormValues } from "./schemas";
import { calculateTargets } from "./utils/calculateTargets";

export function profileQueryKey(userId: string | undefined) {
  return ["profile", userId] as const;
}

// Reused by Settings too (profile read/update isn't a distinct domain of its
// own per CLAUDE.md's feature list — it's onboarding's table, edited again
// later from Settings) — see src/features/settings/hooks.ts.
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: () => getProfile(userId as string),
    enabled: !!userId,
  });
}

/**
 * Computes calorie/macro targets from the onboarding answers, writes the
 * profile, and inserts the initial goals row — one mutation so the wizard's
 * submit button has a single loading/error state.
 */
export function useCompleteOnboarding(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: OnboardingFormValues) => {
      if (!userId) throw new Error("Must be signed in to complete onboarding");

      const age = ageFromDateOfBirth(values.dateOfBirth);
      const targets = calculateTargets({
        sex: values.sex,
        age,
        heightCm: values.heightCm,
        weightKg: values.currentWeightKg,
        activityLevel: values.activityLevel,
        goal: values.goal,
      });

      const profile = await updateProfile(userId, {
        full_name: values.fullName,
        sex: values.sex,
        date_of_birth: values.dateOfBirth,
        height_cm: values.heightCm,
        current_weight_kg: values.currentWeightKg,
        activity_level: values.activityLevel,
        goal: values.goal,
        unit_system: values.unitSystem,
      });

      const goal = await createGoal({
        user_id: userId,
        calories_target: targets.caloriesTarget,
        protein_g_target: targets.proteinGTarget,
        carbs_g_target: targets.carbsGTarget,
        fat_g_target: targets.fatGTarget,
      });

      return { profile, goal };
    },
    onSuccess: ({ profile }) => {
      queryClient.setQueryData(profileQueryKey(userId), profile);
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
}
