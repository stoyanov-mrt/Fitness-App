import {
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_CONTENT_GAP,
  TAB_BAR_HEIGHT,
  tabBarContentClearance,
} from "./layout";

// Guards the one invariant this file exists for: a tab screen's reserved
// bottom padding must always be at least as tall as the floating bar's own
// footprint (see app/(tabs)/_layout.tsx's tabBarStyle.bottom), for any
// safe-area inset — not just the zero-inset case the RNTL suite happens to
// render with (src/test-utils/render.tsx). A future edit that changes one
// side's formula but not the other (e.g. bumping TAB_BAR_BOTTOM_MARGIN only
// in _layout.tsx) would otherwise only ever surface on a real device.
describe("tabBarContentClearance", () => {
  it.each([0, 20, 34])(
    "reserves more than the bar's own top-from-screen-bottom position for an inset of %ipx",
    (insetBottom) => {
      // Mirrors app/(tabs)/_layout.tsx's tabBarStyle: bottom + height is how
      // far the *top* of the floating bar sits from the screen's bottom edge.
      const barTopFromScreenBottom = insetBottom + TAB_BAR_BOTTOM_MARGIN + TAB_BAR_HEIGHT;

      const clearance = tabBarContentClearance(insetBottom);

      expect(clearance).toBeGreaterThan(barTopFromScreenBottom);
      // And specifically by the intended breathing-room gap, not some
      // incidental amount.
      expect(clearance - barTopFromScreenBottom).toBe(TAB_BAR_CONTENT_GAP);
    }
  );
});
