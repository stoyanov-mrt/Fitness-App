/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  // 'class' (not the Tailwind default 'media') so the Settings theme toggle
  // can override the OS preference via NativeWind's colorScheme.set() —
  // see src/lib/theme.ts. "system" still works: useThemeStore defaults to
  // it and colorScheme.set("system") falls back to prefers-color-scheme.
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic tokens resolved at runtime from CSS custom properties set
      // by the active design theme (see src/theme/designTokens.ts). Screens
      // use `bg-ground`, `text-ink`, etc. instead of hardcoded neutral-*/
      // dark: pairs, so switching the design theme re-colors everything.
      colors: {
        ground: "var(--color-ground)",
        "ground-raised": "var(--color-ground-raised)",
        ink: "var(--color-ink)",
        "ink-dim": "var(--color-ink-dim)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
      },
    },
  },
  plugins: [],
};
