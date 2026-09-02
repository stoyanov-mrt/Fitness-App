import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
    <View className="flex-row items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 dark:bg-neutral-50">
      <Text className="text-base font-semibold text-white dark:text-neutral-900">
        Rest: {remaining}s
      </Text>
      <Pressable accessibilityRole="button" onPress={onDismiss}>
        <Text className="text-sm font-medium text-white dark:text-neutral-900">Skip</Text>
      </Pressable>
    </View>
  );
}
