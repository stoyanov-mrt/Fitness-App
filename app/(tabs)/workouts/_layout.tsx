import { Stack } from "expo-router";

// Workouts is the one tab with a nested navigation tree (library, routines,
// an active session) — every other tab is currently a single flat screen.
export default function WorkoutsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="exercises/index" options={{ title: "Exercise Library" }} />
      <Stack.Screen name="exercises/[exerciseId]" options={{ title: "Exercise" }} />
      <Stack.Screen name="routines/new" options={{ title: "New Routine" }} />
      <Stack.Screen name="routines/[routineId]" options={{ title: "Routine" }} />
      <Stack.Screen name="session/[workoutId]" options={{ title: "Workout" }} />
    </Stack>
  );
}
