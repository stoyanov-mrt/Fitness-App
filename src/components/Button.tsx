import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

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
      className={`items-center rounded-lg px-4 py-3 ${
        isPrimary ? "bg-neutral-900 dark:bg-neutral-50" : "bg-neutral-200 dark:bg-neutral-800"
      } ${isDisabled ? "opacity-50" : ""}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : "#111"} />
      ) : (
        <Text
          className={`text-base font-semibold ${
            isPrimary
              ? "text-white dark:text-neutral-900"
              : "text-neutral-900 dark:text-neutral-50"
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
