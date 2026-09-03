import { useDesignThemeHydrated, useDesignThemeStore } from "@/stores/designThemeStore";

import { designThemes } from "./designTokens";

/** The active design theme's tokens, plus a setter. Use this instead of
 * reading the store directly so components get typed tokens in one call. */
export function useDesignTheme() {
  const theme = useDesignThemeStore((state) => state.theme);
  const setTheme = useDesignThemeStore((state) => state.setTheme);
  const hasHydrated = useDesignThemeHydrated((state) => state.hasHydrated);
  return { theme, tokens: designThemes[theme], setTheme, hasHydrated };
}
