import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { DesignTheme } from "@/theme/designTokens";

// UI/ephemeral state only (see CLAUDE.md) — which of the two portfolio
// design languages is active. Persisted so the choice survives a reload,
// same storage used for the query cache (src/lib/queryClient.ts).
type DesignThemeState = {
  theme: DesignTheme;
  setTheme: (theme: DesignTheme) => void;
};

export const useDesignThemeStore = create<DesignThemeState>()(
  persist(
    (set) => ({
      theme: "dither",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "fitness-app-design-theme",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Whether AsyncStorage rehydration has actually run (or failed) yet — kept
// as its own tiny, unpersisted store rather than a field on the persisted
// one above. A field on the persisted store would work for reading, but
// zustand's persist middleware writes the *whole* state back to storage on
// every setState (including ours for this flag) — and that write crashes
// under Expo Router's Node SSR pass for the web build ("window is not
// defined" inside AsyncStorage's web shim's setItem). This store never
// touches AsyncStorage at all, so there's nothing to crash.
//
// On native, hydration finishes *after* the first render (unlike web's
// synchronous localStorage). RootLayout must not render anything that sets
// NativeWind CSS variables (tokens.vars) before this is true: doing so
// makes react-native-css-interop treat the variable as added "after
// initial render", which triggers its upgrade-warning path — and that path
// crashes (a real bug in react-native-css-interop, not just a console
// warning) when it tries to stringify props that reach into Expo Router's
// internal navigation context. See app/_layout.tsx.
const useDesignThemeHydrated = create(() => ({ hasHydrated: false }));

if (useDesignThemeStore.persist.hasHydrated()) {
  useDesignThemeHydrated.setState({ hasHydrated: true });
} else {
  useDesignThemeStore.persist.onFinishHydration(() => {
    useDesignThemeHydrated.setState({ hasHydrated: true });
  });
}

export { useDesignThemeHydrated };
