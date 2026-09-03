import { Text, type TextProps } from "react-native";

import { useDesignTheme } from "@/theme/useDesignTheme";

type Variant =
  | "display" // monumental headline / big number
  | "displaySecondary" // subhead, sits under a display line
  | "label" // uppercase, letter-spaced eyebrow/caption
  | "body" // regular copy
  | "bodyMedium"; // emphasized copy (button labels, list titles)

type ThemedTextProps = TextProps & { variant?: Variant };

// Picks the active design theme's font family for the given role — JetBrains
// Mono across the board for Dither Mono, Shippori Mincho (display) + Zen
// Kaku Gothic New (everything else) for Japanese Minimal. Color and size
// stay in className, same as a plain <Text>; this only owns the font choice
// (and letter-spacing/case for the "label" role, which both themes want
// uppercase and tracked).
export function ThemedText({ variant = "body", style, ...props }: ThemedTextProps) {
  const { tokens } = useDesignTheme();
  const fontFamily = tokens.fonts[variant];

  return (
    <Text
      style={[
        { fontFamily },
        variant === "label"
          ? { textTransform: "uppercase", letterSpacing: tokens.labelTracking }
          : null,
        style,
      ]}
      {...props}
    />
  );
}
