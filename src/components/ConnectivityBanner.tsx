import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useIsOnline } from "@/lib/network";

// Shared, feature-agnostic — shown once at the root so every screen gets
// the same "you're offline, changes will sync" affordance.
export function ConnectivityBanner() {
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <View className="border-b border-accent bg-ground-raised px-4 py-2">
      <ThemedText variant="label" className="text-center text-xs text-accent">
        Offline — changes will sync once you&apos;re back online
      </ThemedText>
    </View>
  );
}
