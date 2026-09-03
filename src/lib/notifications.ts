import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Local-only reminders (no push/server involvement) — CLAUDE.md scopes
// *server-pushed* notifications out of v1, not on-device local ones. A
// single daily reminder to log weight/food; no per-condition logic (e.g.
// "only if you haven't logged yet") since that would need a background
// task to evaluate app data at fire time, which iOS in particular makes
// unreliable — out of scope for what this is worth here.
//
// Every native call in this module is skipped on web: this feature is
// about the user's phone, not the web QA build, and this project has
// already hit real crashes from native-module side effects running during
// Expo Router's Node SSR pass for web (see lib/supabase.ts's isBrowser
// guard, and the react-native-css-interop patch) — module-level
// registration calls are exactly the pattern that bit us before, so this
// skips them outright on web rather than assuming expo-notifications'
// web/SSR behavior is safe.
const isWeb = Platform.OS === "web";

const DAILY_REMINDER_ID = "daily-reminder";
const ANDROID_CHANNEL_ID = "reminders";

if (!isWeb) {
  // Controls how a notification is presented while the app is in the
  // foreground — without this, iOS silently drops it instead of showing it.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function hasPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * (Re)schedules the daily reminder at the given local hour/minute,
 * replacing any previously-scheduled one. Returns false without
 * scheduling anything if notification permission isn't granted (and
 * couldn't be obtained), or on web (unsupported) — the caller is
 * responsible for reflecting that back to the user rather than silently
 * leaving the toggle in a state that doesn't actually do anything.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (isWeb) return false;

  await cancelDailyReminder();

  if (!(await hasPermission())) return false;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Fitness App",
      body: "Don't forget to log today's weight and food.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
    },
  });
  return true;
}

export async function cancelDailyReminder() {
  if (isWeb) return;
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {
    // Nothing was scheduled — fine, that's the common case when toggling
    // the reminder on for the first time.
  });
}
