import { Stack } from "expo-router";

import { HeaderBackButton } from "@/components/HeaderBackButton";
import { useDesignTheme } from "@/theme/useDesignTheme";

export default function NutritionLayout() {
  const { tokens } = useDesignTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: tokens.swatch.ground },
        headerShadowVisible: false,
        headerTintColor: tokens.swatch.ink,
        headerTitleStyle: { fontFamily: tokens.fonts.bodyMedium, color: tokens.swatch.ink },
        // Explicit rather than relying on the native stack's automatic
        // back button — reported missing on a real device.
        headerLeft: () => <HeaderBackButton fallbackHref="/nutrition" />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
    </Stack>
  );
}
