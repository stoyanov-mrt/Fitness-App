import { colorScheme } from "nativewind";
import { useEffect } from "react";

import { useThemeStore } from "@/stores/themeStore";

/**
 * Applies the current theme preference (Zustand, UI state) to NativeWind's
 * color scheme so `dark:` classes respond to it instead of only the OS
 * setting. Call once, from the root layout.
 */
export function useSyncNativeWindTheme() {
  const preference = useThemeStore((state) => state.preference);

  useEffect(() => {
    colorScheme.set(preference);
  }, [preference]);
}
