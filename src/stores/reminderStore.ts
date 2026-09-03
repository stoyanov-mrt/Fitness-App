import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// UI/ephemeral state only (see CLAUDE.md) — whether the daily local
// reminder is on and what time it's set for. The actual OS-level
// scheduling lives in src/lib/notifications.ts; this store just remembers
// the user's choice across app restarts so the Settings toggle reflects
// reality. Persisted the same way as designThemeStore.
type ReminderState = {
  enabled: boolean;
  hour: number;
  minute: number;
  setReminder: (state: { enabled: boolean; hour: number; minute: number }) => void;
};

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      enabled: false,
      hour: 20,
      minute: 0,
      setReminder: (state) => set(state),
    }),
    {
      name: "fitness-app-reminder",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
