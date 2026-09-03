import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react-native";
import type { ReactElement } from "react";

/**
 * Wraps a component under test with a fresh QueryClient — every screen
 * reads server state through TanStack Query hooks (per CLAUDE.md), so this
 * is needed for basically any screen-level RNTL test, not just ones that
 * obviously fetch data.
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    ...options,
  });
}

export * from "@testing-library/react-native";
