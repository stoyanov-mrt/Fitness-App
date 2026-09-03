import { Tabs } from "expo-router";

import { useDesignTheme } from "@/theme/useDesignTheme";

export default function TabsLayout() {
  const { tokens } = useDesignTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.swatch.ink,
        tabBarInactiveTintColor: tokens.swatch.inkDim,
        tabBarStyle: {
          backgroundColor: tokens.swatch.ground,
          borderTopColor: tokens.swatch.inkDim,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: tokens.fonts.label,
          fontSize: 10,
          letterSpacing: tokens.labelTracking,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="workouts" options={{ title: "Workouts" }} />
      <Tabs.Screen name="nutrition" options={{ title: "Nutrition" }} />
      <Tabs.Screen name="metrics/index" options={{ title: "Metrics" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}
