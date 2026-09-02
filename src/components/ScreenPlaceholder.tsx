import { Text, View } from "react-native";

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

// Temporary stand-in for screens not yet built out — swapped for the real
// feature UI phase by phase per the build roadmap.
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white px-8 dark:bg-neutral-950">
      <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </Text>
      <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
        {description}
      </Text>
    </View>
  );
}
