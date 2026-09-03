import { router, type Href } from "expo-router";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";

type HeaderBackButtonProps = {
  /** Where to land if there's genuinely nothing to go back to (e.g. this
   * screen was somehow reached with no history — a deep link, or a future
   * navigation path this doesn't already account for). Every screen in
   * these stacks is normally reached via push, so router.back() alone
   * would work today, but an unguarded one would silently do nothing in
   * that edge case — the exact "nothing happens when I tap it" symptom
   * this button exists to fix in the first place. */
  fallbackHref: Href;
};

// Explicit headerLeft for the nested Stacks (workouts, nutrition) rather
// than relying on React Navigation's automatic back button — reported as
// missing/not showing up on a real device, and this guarantees a working,
// visible one regardless of whatever was causing that.
export function HeaderBackButton({ fallbackHref }: HeaderBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallbackHref);
      }}
      hitSlop={12}
      className="pr-3"
    >
      <ThemedText variant="display" className="text-2xl text-ink">
        ‹
      </ThemedText>
    </Pressable>
  );
}
