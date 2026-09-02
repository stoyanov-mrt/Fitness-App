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
    extend: {},
  },
  plugins: [],
};
