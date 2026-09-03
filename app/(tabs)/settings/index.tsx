import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { GrainOverlay } from "@/components/decor/GrainOverlay";
import { ThemedText } from "@/components/ThemedText";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useTabBarContentClearance } from "@/constants/layout";
import { useSession, useSignOut } from "@/features/auth/hooks";
import { ReminderSettings } from "@/features/settings/components/ReminderSettings";
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

const APPEARANCE_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText variant="label" className="text-xs text-ink-dim">
      {children}
    </ThemedText>
  );
}

export default function SettingsScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const updateDisplayPreferences = useUpdateDisplayPreferences(userId);
  const setThemePreference = useThemeStore((state) => state.setPreference);
  const signOut = useSignOut();
  const exportWorkouts = useExportWorkoutsCsv(userId);
  const exportNutrition = useExportNutritionCsv(userId);
  const tabBarClearance = useTabBarContentClearance();

  return (
    <View className="flex-1 bg-ground">
      <GrainOverlay />
      <ScrollView
        contentContainerClassName="gap-8 px-6 pt-16"
        contentContainerStyle={{ maxWidth: 640, paddingBottom: tabBarClearance }}
      >
        <View className="gap-1">
          <ThemedText variant="display" className="text-4xl text-ink">
            Settings
          </ThemedText>
          {session?.user.email ? (
            <ThemedText variant="body" className="text-base text-ink-dim">
              {session.user.email}
            </ThemedText>
          ) : null}
        </View>

        <View className="gap-4 border-t border-border pt-6">
          <ThemeSelector />
        </View>

        <View className="gap-4 border-t border-border pt-6">
          <SectionLabel>Preferences</SectionLabel>
          <ChipSelect
            label="Units"
            options={UNIT_OPTIONS}
            value={profile?.unit_system}
            onChange={(unit_system) => updateDisplayPreferences.mutate({ unit_system })}
          />
          <ChipSelect
            label="Appearance"
            options={APPEARANCE_OPTIONS}
            value={profile?.theme}
            onChange={(theme) => {
              updateDisplayPreferences.mutate({ theme });
              setThemePreference(theme as ThemePreference);
            }}
          />
        </View>

        <View className="gap-4 border-t border-border pt-6">
          <SectionLabel>Notifications</SectionLabel>
          <ReminderSettings />
        </View>

        <View className="gap-3 border-t border-border pt-6">
          <SectionLabel>Export Data</SectionLabel>
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
            <ThemedText variant="body" className="text-sm text-accent">
              Couldn&apos;t export — please try again.
            </ThemedText>
          ) : null}
        </View>

        <View className="gap-3 border-t border-border pt-6">
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
        </View>
      </ScrollView>
    </View>
  );
}
