import { TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useDesignTheme } from "@/theme/useDesignTheme";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

// Shared, feature-agnostic form primitive — used by auth and onboarding
// forms alike (see CLAUDE.md: components/ is for cross-feature UI only).
export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  const { tokens } = useDesignTheme();

  return (
    <View className="gap-1.5">
      <ThemedText variant="label" className="text-xs text-ink-dim">
        {label}
      </ThemedText>
      <TextInput
        className="border border-border bg-ground-raised px-3 py-2.5 text-base text-ink"
        style={{ fontFamily: tokens.fonts.body }}
        placeholderTextColor={tokens.swatch.inkDim}
        accessibilityLabel={label}
        accessibilityHint={error}
        {...inputProps}
      />
      {error ? (
        <ThemedText variant="body" className="text-sm text-accent">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
