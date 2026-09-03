import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Zero-inset metrics, matching web/most test environments — real per-device
// insets don't matter for behavioral tests, this just satisfies any screen
// that reads useSafeAreaInsets() (e.g. the floating tab bar's content
// clearance, see src/constants/layout.ts) so it doesn't throw for lacking a
// SafeAreaProvider ancestor, which app/_layout.tsx always provides for real.
const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/**
 * Wraps a component under test with a fresh QueryClient — every screen
 * reads server state through TanStack Query hooks (per CLAUDE.md), so this
 * is needed for basically any screen-level RNTL test, not just ones that
 * obviously fetch data. Also wraps with SafeAreaProvider, matching the real
 * app's root layout.
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    ),
    ...options,
  });
}

export * from "@testing-library/react-native";
