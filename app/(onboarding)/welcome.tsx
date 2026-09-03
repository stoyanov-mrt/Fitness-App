import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { MonumentalImage } from "@/components/decor/MonumentalImage";
import { ThemedText } from "@/components/ThemedText";
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
    <View className="flex-1 bg-ground">
      <GrainOverlay />
      <ScrollView contentContainerClassName="gap-8 px-6 py-16" contentContainerStyle={{ maxWidth: 640 }}>
        <View className="flex-row items-start gap-5">
          <View className="w-20 shrink-0 opacity-90">
            <MonumentalImage />
          </View>
          <View className="flex-1 gap-1 pt-1">
            <ThemedText variant="label" className="text-xs text-accent">
              Step 1 of 1
            </ThemedText>
            <ThemedText variant="display" className="text-3xl text-ink">
              Tell us about yourself
            </ThemedText>
            <ThemedText variant="body" className="text-base text-ink-dim">
              We use this to set your calorie and macro targets. You can change these later in
              Settings.
            </ThemedText>
          </View>
        </View>

        <View className="gap-4 border-t border-border pt-6">
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
            <ThemedText variant="body" className="text-sm text-accent">
              {completeOnboarding.error instanceof Error
                ? completeOnboarding.error.message
                : "Couldn't save your info"}
            </ThemedText>
          ) : null}
        </View>

        <Button label="Finish" onPress={onSubmit} loading={completeOnboarding.isPending} />
      </ScrollView>
    </View>
  );
}
