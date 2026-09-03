import { Text, View } from "react-native";

import { useIsOnline } from "@/lib/network";

// Shared, feature-agnostic — shown once at the root so every screen gets
// the same "you're offline, changes will sync" affordance.
export function ConnectivityBanner() {
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <View className="bg-amber-500 px-4 py-2 dark:bg-amber-600">
      <Text className="text-center text-sm font-medium text-white">
        You&apos;re offline — changes will sync once you&apos;re back online.
      </Text>
    </View>
  );
}
