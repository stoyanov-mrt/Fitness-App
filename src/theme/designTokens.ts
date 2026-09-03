import { vars } from "nativewind";

// The app's two portfolio design languages. This is a *design* axis,
// independent of the existing light/dark preference (see
// src/stores/themeStore.ts) — each design theme is single-mode and defines
// its own complete near-monochrome-plus-one-accent palette, so it doesn't
// need a dark variant of its own.
export type DesignTheme = "dither" | "japanese";

export const DESIGN_THEMES: DesignTheme[] = ["dither", "japanese"];

type ThemeTokens = {
  theme: DesignTheme;
  label: string;
  description: string;
  /** CSS custom properties, applied via NativeWind's vars() at the tree root. */
  vars: ReturnType<typeof vars>;
  fonts: {
    /** Large headline / monumental-number type. */
    display: string;
    /** A secondary display weight, for subheads. */
    displaySecondary: string;
    /** Uppercase eyebrow / label type. */
    label: string;
    /** Regular body copy. */
    body: string;
    /** Emphasized body copy (button labels, list titles). */
    bodyMedium: string;
  };
  /** Letter-spacing applied to uppercase labels/eyebrows, in px. */
  labelTracking: number;
  progressRing: { color: string; track: string };
  /** Small swatch used by the theme selector UI, and by components (e.g.
   * SVG fills, placeholder text) that need a raw color value rather than a
   * className. */
  swatch: { ground: string; ink: string; inkDim: string; accent: string };
};

export const designThemes: Record<DesignTheme, ThemeTokens> = {
  dither: {
    theme: "dither",
    label: "Dither Mono",
    description: "Grainy, monochrome, pixel-dithered, retro-digital.",
    vars: vars({
      "--color-ground": "#0a0a0a",
      "--color-ground-raised": "#161614",
      "--color-ink": "#e8e6e1",
      "--color-ink-dim": "#8c8a85",
      "--color-border": "#2c2b28",
      "--color-accent": "#ff7a29",
      "--color-accent-ink": "#0a0a0a",
    }),
    fonts: {
      display: "JetBrainsMono_700Bold",
      displaySecondary: "JetBrainsMono_500Medium",
      label: "JetBrainsMono_500Medium",
      body: "JetBrainsMono_400Regular",
      bodyMedium: "JetBrainsMono_500Medium",
    },
    labelTracking: 2,
    progressRing: { color: "#ff7a29", track: "#2c2b28" },
    swatch: { ground: "#0a0a0a", ink: "#e8e6e1", inkDim: "#8c8a85", accent: "#ff7a29" },
  },
  japanese: {
    theme: "japanese",
    label: "Japanese Minimal",
    description: "Minimalist, elegant, whitespace-rich, subtly asymmetric.",
    vars: vars({
      "--color-ground": "#f5f1e8",
      "--color-ground-raised": "#efe9db",
      "--color-ink": "#1c1a17",
      "--color-ink-dim": "#6b655a",
      "--color-border": "#ddd4c1",
      "--color-accent": "#b8452f",
      "--color-accent-ink": "#f5f1e8",
    }),
    fonts: {
      display: "ShipporiMincho_700Bold",
      displaySecondary: "ShipporiMincho_600SemiBold",
      label: "ZenKakuGothicNew_500Medium",
      body: "ZenKakuGothicNew_400Regular",
      bodyMedium: "ZenKakuGothicNew_500Medium",
    },
    labelTracking: 1.5,
    progressRing: { color: "#b8452f", track: "#ddd4c1" },
    swatch: { ground: "#f5f1e8", ink: "#1c1a17", inkDim: "#6b655a", accent: "#b8452f" },
  },
};

/** The exact font map to hand to expo-font's `useFonts`. */
export const designThemeFontAssets = {
  JetBrainsMono_400Regular: require("@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf"),
  JetBrainsMono_500Medium: require("@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf"),
  JetBrainsMono_700Bold: require("@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf"),
  ShipporiMincho_600SemiBold: require("@expo-google-fonts/shippori-mincho/600SemiBold/ShipporiMincho_600SemiBold.ttf"),
  ShipporiMincho_700Bold: require("@expo-google-fonts/shippori-mincho/700Bold/ShipporiMincho_700Bold.ttf"),
  ZenKakuGothicNew_400Regular: require("@expo-google-fonts/zen-kaku-gothic-new/400Regular/ZenKakuGothicNew_400Regular.ttf"),
  ZenKakuGothicNew_500Medium: require("@expo-google-fonts/zen-kaku-gothic-new/500Medium/ZenKakuGothicNew_500Medium.ttf"),
  ZenKakuGothicNew_700Bold: require("@expo-google-fonts/zen-kaku-gothic-new/700Bold/ZenKakuGothicNew_700Bold.ttf"),
};
