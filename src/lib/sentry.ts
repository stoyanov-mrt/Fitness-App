import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// Whether Sentry.init actually ran. Sentry.wrap() is NOT a safe no-op on its
// own without init — on native it still mounts a ReactNativeProfiler for
// app-start tracking, which throws "Couldn't find a navigation context"
// when it renders above app/_layout.tsx's <Stack> (confirmed on a real
// device; the web build never surfaced this). Callers must skip wrapping
// entirely when this is false — see app/_layout.tsx.
export const sentryEnabled = Boolean(dsn);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2, // basic performance tracing, not every transaction
    enableAutoSessionTracking: true,
  });
} else if (__DEV__) {
  // Non-fatal: lets the app run before a Sentry project exists. Set
  // EXPO_PUBLIC_SENTRY_DSN in .env.local once one does.
  console.warn(
    "[sentry] EXPO_PUBLIC_SENTRY_DSN is not set — crash reporting is disabled."
  );
}

export { Sentry };
