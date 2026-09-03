import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

// Temporary stand-in for screens not yet built out — swapped for the real
// feature UI phase by phase per the build roadmap.
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-ground px-8">
      <ThemedText variant="displaySecondary" className="text-2xl text-ink">
        {title}
      </ThemedText>
      <ThemedText variant="body" className="text-center text-base text-ink-dim">
        {description}
      </ThemedText>
    </View>
  );
}
