import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useDesignTheme } from "@/theme/useDesignTheme";

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function Button({
  label,
  loading = false,
  variant = "primary",
  disabled,
  ...pressableProps
}: ButtonProps) {
  const { tokens } = useDesignTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      // Explicit, not inferred from children: while loading, the label
      // Text isn't rendered at all (replaced by the spinner), which would
      // otherwise leave the button with no accessible name.
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`items-center justify-center border px-4 py-3 ${
        isPrimary ? "border-ink bg-ink" : "border-border bg-ground-raised"
      } ${isDisabled ? "opacity-40" : ""}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? tokens.swatch.ground : tokens.swatch.ink} />
      ) : (
        <ThemedText
          variant="label"
          className={`text-sm ${isPrimary ? "text-ground" : "text-ink"}`}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
