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
