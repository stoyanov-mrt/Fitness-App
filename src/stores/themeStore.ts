import { create } from "zustand";

// UI/ephemeral state only — never mirror server data here (see CLAUDE.md).
export type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  setPreference: (preference) => set({ preference }),
}));
