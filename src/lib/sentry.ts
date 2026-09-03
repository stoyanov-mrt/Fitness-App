import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2, // basic performance tracing, not every transaction
    enableAutoSessionTracking: true,
  });
} else if (__DEV__) {
  // Non-fatal: lets the app run (and Sentry.wrap below stays a safe no-op)
  // before a Sentry project exists. Set EXPO_PUBLIC_SENTRY_DSN in
  // .env.local once one does.
  console.warn(
    "[sentry] EXPO_PUBLIC_SENTRY_DSN is not set — crash reporting is disabled."
  );
}

export { Sentry };
