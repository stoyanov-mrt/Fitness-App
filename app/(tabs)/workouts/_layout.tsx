import { Stack } from "expo-router";

import { useDesignTheme } from "@/theme/useDesignTheme";

// Workouts is the one tab with a nested navigation tree (library, routines,
// an active session) — every other tab is currently a single flat screen.
export default function WorkoutsLayout() {
  const { tokens } = useDesignTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: tokens.swatch.ground },
        headerShadowVisible: false,
        headerTintColor: tokens.swatch.ink,
        headerTitleStyle: { fontFamily: tokens.fonts.bodyMedium, color: tokens.swatch.ink },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="exercises/index" options={{ title: "Exercise Library" }} />
      <Stack.Screen name="exercises/[exerciseId]" options={{ title: "Exercise" }} />
      <Stack.Screen name="routines/new" options={{ title: "New Routine" }} />
      <Stack.Screen name="routines/[routineId]" options={{ title: "Routine" }} />
      <Stack.Screen name="session/[workoutId]" options={{ title: "Workout" }} />
    </Stack>
  );
}
