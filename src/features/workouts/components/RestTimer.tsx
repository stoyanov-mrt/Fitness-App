import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

type RestTimerProps = {
  durationSeconds: number;
  onDismiss: () => void;
};

export function RestTimer({ durationSeconds, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onDismiss();
      return;
    }
    const timeout = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining, onDismiss]);

  return (
    <View className="flex-row items-center justify-between border border-accent bg-ground-raised px-4 py-3">
      <ThemedText variant="bodyMedium" className="text-base text-accent">
        Rest: {remaining}s
      </ThemedText>
      <Pressable accessibilityRole="button" onPress={onDismiss}>
        <ThemedText variant="label" className="text-xs text-ink-dim">
          Skip
        </ThemedText>
      </Pressable>
    </View>
  );
}
