import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { TextField } from "@/components/TextField";
import { useSession } from "@/features/auth/hooks";
import { useCompleteOnboarding } from "@/features/onboarding/hooks";
import {
  onboardingSchema,
  type OnboardingFormInput,
  type OnboardingFormValues,
} from "@/features/onboarding/schemas";

const SEX_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
] as const;

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
] as const;

const GOAL_OPTIONS = [
  { value: "cut", label: "Cut" },
  { value: "maintain", label: "Maintain" },
  { value: "bulk", label: "Bulk" },
] as const;

const UNIT_OPTIONS = [
  { value: "metric", label: "Metric (kg / cm)" },
  { value: "imperial", label: "Imperial (lb / in)" },
] as const;

export default function OnboardingScreen() {
  const { data: session } = useSession();
  const completeOnboarding = useCompleteOnboarding(session?.user.id);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormInput, unknown, OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      sex: "female",
      dateOfBirth: "",
      heightCm: "",
      currentWeightKg: "",
      activityLevel: "moderate",
      goal: "maintain",
      unitSystem: "metric",
    },
  });

  const onSubmit = handleSubmit((values) => {
    completeOnboarding.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-12"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Tell us about yourself
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          We use this to set your calorie and macro targets. You can change these later in
          Settings.
        </Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <TextField
              label="Full name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="sex"
          render={({ field }) => (
            <ChipSelect
              label="Sex"
              options={SEX_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.sex?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <TextField
              label="Date of birth (YYYY-MM-DD)"
              placeholder="1995-06-15"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.dateOfBirth?.message}
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="heightCm"
              render={({ field }) => (
                <TextField
                  label="Height (cm)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.heightCm?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="currentWeightKg"
              render={({ field }) => (
                <TextField
                  label="Weight (kg)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.currentWeightKg?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="activityLevel"
          render={({ field }) => (
            <ChipSelect
              label="Activity level"
              options={ACTIVITY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.activityLevel?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="goal"
          render={({ field }) => (
            <ChipSelect
              label="Goal"
              options={GOAL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.goal?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="unitSystem"
          render={({ field }) => (
            <ChipSelect
              label="Preferred units"
              options={UNIT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.unitSystem?.message}
            />
          )}
        />

        {completeOnboarding.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {completeOnboarding.error instanceof Error
              ? completeOnboarding.error.message
              : "Couldn't save your info"}
          </Text>
        ) : null}
      </View>

      <Button label="Finish" onPress={onSubmit} loading={completeOnboarding.isPending} />
    </ScrollView>
  );
}
