import "@/theme/global.css";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ConnectivityBanner } from "@/components/ConnectivityBanner";
import { useAuthSessionSync } from "@/features/auth/hooks";
import { useProtectedRoute } from "@/lib/navigation";
import { useSyncNetworkStatus } from "@/lib/network";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { Sentry } from "@/lib/sentry";
import { useSyncNativeWindTheme } from "@/lib/theme";

function RootNavigator() {
  useAuthSessionSync();
  useSyncNativeWindTheme();
  useSyncNetworkStatus();
  const { isReady } = useProtectedRoute();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <ConnectivityBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <RootNavigator />
        <StatusBar style="auto" />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

// A safe no-op when EXPO_PUBLIC_SENTRY_DSN isn't set (see lib/sentry.ts) —
// adds a top-level error boundary + navigation instrumentation once it is.
export default Sentry.wrap(RootLayout);
