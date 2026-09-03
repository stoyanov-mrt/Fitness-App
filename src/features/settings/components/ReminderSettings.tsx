import { useState } from "react";
import { Platform, View } from "react-native";

import { ChipSelect } from "@/components/ChipSelect";
import { ThemedText } from "@/components/ThemedText";
import { cancelDailyReminder, scheduleDailyReminder } from "@/lib/notifications";
import { useReminderStore } from "@/stores/reminderStore";

const TOGGLE_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "on", label: "On" },
] as const;

// hour-minute pairs encoded as a single string since ChipSelect's value is
// a plain string union, not a tuple.
const TIME_OPTIONS = [
  { value: "8-0", label: "8:00 AM" },
  { value: "12-0", label: "12:00 PM" },
  { value: "18-0", label: "6:00 PM" },
  { value: "20-0", label: "8:00 PM" },
  { value: "21-0", label: "9:00 PM" },
] as const;

function timeValue(hour: number, minute: number) {
  return `${hour}-${minute}`;
}

// Local-only (device notifications, no server push — see src/lib/notifications.ts
// for why that's in scope for CLAUDE.md's v1). A daily nudge to log
// today's weight and food; not conditional on whether the user already
// has, since that would need a background task to check app data at fire
// time, which is unreliable enough on iOS to not be worth it here.
export function ReminderSettings() {
  const { enabled, hour, minute, setReminder } = useReminderStore();
  const [error, setError] = useState<string | null>(null);

  if (Platform.OS === "web") {
    return (
      <ThemedText variant="body" className="text-sm text-ink-dim">
        Reminders aren&apos;t available in the web preview — open the app on your phone to set
        one up.
      </ThemedText>
    );
  }

  const onToggle = async (value: (typeof TOGGLE_OPTIONS)[number]["value"]) => {
    setError(null);
    if (value === "off") {
      await cancelDailyReminder();
      setReminder({ enabled: false, hour, minute });
      return;
    }

    const granted = await scheduleDailyReminder(hour, minute);
    if (!granted) {
      setError("Notifications are turned off for this app — enable them in your device Settings.");
      return;
    }
    setReminder({ enabled: true, hour, minute });
  };

  const onTimeChange = async (value: (typeof TIME_OPTIONS)[number]["value"]) => {
    const [newHour, newMinute] = value.split("-").map(Number);
    setError(null);
    const granted = await scheduleDailyReminder(newHour, newMinute);
    if (!granted) {
      setError("Notifications are turned off for this app — enable them in your device Settings.");
      return;
    }
    setReminder({ enabled: true, hour: newHour, minute: newMinute });
  };

  return (
    <View className="gap-4">
      <ChipSelect
        label="Daily Reminder"
        options={TOGGLE_OPTIONS}
        value={enabled ? "on" : "off"}
        onChange={onToggle}
      />
      {enabled ? (
        <ChipSelect
          label="Reminder Time"
          options={TIME_OPTIONS}
          // The stored hour/minute always comes from one of these presets
          // (set via onToggle/onTimeChange below) — cast rather than widen
          // ChipSelect's value prop, since a non-matching value should
          // just show nothing selected, not be a type error.
          value={timeValue(hour, minute) as (typeof TIME_OPTIONS)[number]["value"]}
          onChange={onTimeChange}
        />
      ) : null}
      {error ? (
        <ThemedText variant="body" className="text-sm text-accent">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
