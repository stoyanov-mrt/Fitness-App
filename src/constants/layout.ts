import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shared between app/(tabs)/_layout.tsx (which draws the floating tab bar)
// and every top-level tab screen (which needs to reserve the same space at
// the bottom of its scroll content so the bar never overlaps it). Kept as
// plain numbers, not Tailwind classes, so both sides read from one source
// of truth — a floating/absolute tab bar does NOT get automatic content
// inset the way a normal docked one does.
export const TAB_BAR_HEIGHT = 64;
/** Fixed gap between the floating bar and the safe-area bottom inset. */
export const TAB_BAR_BOTTOM_MARGIN = 16;
/** Breathing room between a screen's last item and the bar above it. */
export const TAB_BAR_CONTENT_GAP = 24;

/** The bar's fixed footprint — height, its own margin, and the gap above it
 * — NOT including the safe-area inset, which varies per device and must be
 * added separately (see tabBarContentClearance below). */
const TAB_BAR_FIXED_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_MARGIN + TAB_BAR_CONTENT_GAP;

/**
 * Pure version of useTabBarContentClearance, split out so the "the two
 * formulas agree" invariant can be unit-tested without rendering anything
 * (see layout.test.ts) — the bug this whole file exists to prevent (a tab
 * screen's bottom padding silently drifting out of sync with the floating
 * bar's own position math in app/(tabs)/_layout.tsx) would otherwise only
 * ever show up on a real device with a non-zero safe-area inset.
 */
export function tabBarContentClearance(insetBottom: number) {
  return TAB_BAR_FIXED_CLEARANCE + insetBottom;
}

/**
 * The bottom padding a tab screen's scrollable content should reserve, in
 * `contentContainerStyle={{ paddingBottom: useTabBarContentClearance() }}`.
 * A plain constant isn't enough here: the floating bar's own position is
 * `insets.bottom + TAB_BAR_BOTTOM_MARGIN` (app/(tabs)/_layout.tsx), so on any
 * device with a non-zero safe-area bottom inset (iPhone home indicator,
 * Android gesture nav) a screen that only reserved the fixed footprint would
 * still have its last `insets.bottom` px sitting behind the bar.
 */
export function useTabBarContentClearance() {
  const insets = useSafeAreaInsets();
  return tabBarContentClearance(insets.bottom);
}
