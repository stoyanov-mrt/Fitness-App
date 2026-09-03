import { useDesignThemeStore } from "@/stores/designThemeStore";

import { designThemes } from "./designTokens";

/** The active design theme's tokens, plus a setter. Use this instead of
 * reading the store directly so components get typed tokens in one call. */
export function useDesignTheme() {
  const theme = useDesignThemeStore((state) => state.theme);
  const setTheme = useDesignThemeStore((state) => state.setTheme);
  return { theme, tokens: designThemes[theme], setTheme };
}
