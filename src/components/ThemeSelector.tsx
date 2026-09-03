import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { DESIGN_THEMES, designThemes } from "@/theme/designTokens";
import { useDesignTheme } from "@/theme/useDesignTheme";

// Portfolio theme switcher — lets the two design languages (Dither Mono,
// Japanese Minimal) be compared live. Independent of the Light/Dark/System
// preference elsewhere in Settings; see src/theme/designTokens.ts.
export function ThemeSelector() {
  const { theme, setTheme } = useDesignTheme();

  return (
    <View className="gap-1.5">
      <ThemedText variant="label" className="text-xs text-ink-dim">
        Design
      </ThemedText>
      <View className="flex-row gap-2">
        {DESIGN_THEMES.map((option) => {
          const tokens = designThemes[option];
          const selected = option === theme;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={tokens.label}
              onPress={() => setTheme(option)}
              className={`flex-1 gap-3 border p-3 ${
                selected ? "border-ink" : "border-border"
              }`}
            >
              <View className="flex-row gap-1">
                <View
                  className="h-6 w-6 border border-border"
                  style={{ backgroundColor: tokens.swatch.ground }}
                />
                <View
                  className="h-6 w-6 border border-border"
                  style={{ backgroundColor: tokens.swatch.accent }}
                />
              </View>
              <View className="gap-0.5">
                <ThemedText
                  variant="bodyMedium"
                  className="text-sm text-ink"
                  style={{ fontFamily: tokens.fonts.bodyMedium }}
                >
                  {tokens.label}
                </ThemedText>
                <ThemedText
                  variant="body"
                  className="text-xs text-ink-dim"
                  style={{ fontFamily: tokens.fonts.body }}
                >
                  {tokens.description}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
