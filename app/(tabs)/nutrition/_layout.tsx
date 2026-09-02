import { Stack } from "expo-router";

export default function NutritionLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ title: "Scan Barcode" }} />
    </Stack>
  );
}
