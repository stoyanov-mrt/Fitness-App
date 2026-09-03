import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { useSession, useSignOut } from "@/features/auth/hooks";
import {
  useExportNutritionCsv,
  useExportWorkoutsCsv,
  useProfile,
  useUpdateDisplayPreferences,
} from "@/features/settings/hooks";
import { Sentry } from "@/lib/sentry";
import { useThemeStore, type ThemePreference } from "@/stores/themeStore";

const UNIT_OPTIONS = [
  { value: "metric", label: "Metric (kg / cm)" },
  { value: "imperial", label: "Imperial (lb / in)" },
] as const;

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function SettingsScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const updateDisplayPreferences = useUpdateDisplayPreferences(userId);
  const setThemePreference = useThemeStore((state) => state.setPreference);
  const signOut = useSignOut();
  const exportWorkouts = useExportWorkoutsCsv(userId);
  const exportNutrition = useExportNutritionCsv(userId);

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-12"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Settings
        </Text>
        {session?.user.email ? (
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            {session.user.email}
          </Text>
        ) : null}
      </View>

      <ChipSelect
        label="Units"
        options={UNIT_OPTIONS}
        value={profile?.unit_system}
        onChange={(unit_system) => updateDisplayPreferences.mutate({ unit_system })}
      />

      <ChipSelect
        label="Theme"
        options={THEME_OPTIONS}
        value={profile?.theme}
        onChange={(theme) => {
          updateDisplayPreferences.mutate({ theme });
          setThemePreference(theme as ThemePreference);
        }}
      />

      <View className="gap-3">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Export Data
        </Text>
        <Button
          label="Export Workout History (CSV)"
          variant="secondary"
          onPress={() => exportWorkouts.mutate()}
          loading={exportWorkouts.isPending}
        />
        <Button
          label="Export Nutrition Diary (CSV)"
          variant="secondary"
          onPress={() => exportNutrition.mutate()}
          loading={exportNutrition.isPending}
        />
        {exportWorkouts.isError || exportNutrition.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            Couldn&apos;t export — please try again.
          </Text>
        ) : null}
      </View>

      <Button
        label="Sign Out"
        variant="secondary"
        onPress={() => signOut.mutate(undefined, { onSuccess: () => router.replace("/sign-in") })}
        loading={signOut.isPending}
      />

      {__DEV__ ? (
        <Button
          label="Trigger Test Error (dev only)"
          variant="secondary"
          onPress={() => {
            Sentry.captureException(new Error("Test error from Settings screen"));
          }}
        />
      ) : null}
    </ScrollView>
  );
}
