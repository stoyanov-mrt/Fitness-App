import { Pressable, Text, View } from "react-native";

type ChipOption<T extends string> = { value: T; label: string };

type ChipSelectProps<T extends string> = {
  label: string;
  options: readonly ChipOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  error?: string;
};

// Shared single-choice control for short enum fields (sex, activity level,
// goal, unit system, ...) — feature-agnostic, lives in components/ per
// CLAUDE.md.
export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: ChipSelectProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option.value)}
              className={`rounded-full border px-3.5 py-2 ${
                selected
                  ? "border-neutral-900 bg-neutral-900 dark:border-neutral-50 dark:bg-neutral-50"
                  : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected
                    ? "text-white dark:text-neutral-900"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text> : null}
    </View>
  );
}
