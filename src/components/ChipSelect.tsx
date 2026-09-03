import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

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
      <ThemedText variant="label" className="text-xs text-ink-dim">
        {label}
      </ThemedText>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option.value)}
              className={`border px-3.5 py-2 ${
                selected ? "border-ink bg-ink" : "border-border bg-ground-raised"
              }`}
            >
              <ThemedText
                variant="bodyMedium"
                className={`text-sm ${selected ? "text-ground" : "text-ink-dim"}`}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <ThemedText variant="body" className="text-sm text-accent">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
