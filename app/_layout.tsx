import "@/theme/global.css";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
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
import { designThemeFontAssets } from "@/theme/designTokens";
import { useDesignTheme } from "@/theme/useDesignTheme";

function RootNavigator() {
  useAuthSessionSync();
  useSyncNativeWindTheme();
  useSyncNetworkStatus();
  const { tokens } = useDesignTheme();
  const { isReady } = useProtectedRoute();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-ground">
        <ActivityIndicator color={tokens.swatch.ink} />
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
  // Loaded once, up front, for both design themes at once — switching the
  // theme is then just re-pointing which family names get used, no
  // re-fetch/re-mount. See src/theme/designTokens.ts.
  const [fontsLoaded] = useFonts(designThemeFontAssets);
  const { theme, tokens } = useDesignTheme();

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    // The active design theme's CSS custom properties (--color-ground,
    // --color-ink, ...) live on this wrapper via NativeWind's vars() —
    // every `bg-ground`/`text-ink`/etc. class underneath resolves against
    // them, so switching the theme re-colors the whole tree live.
    <View style={[{ flex: 1 }, tokens.vars]} className="flex-1 bg-ground">
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <RootNavigator />
          <StatusBar style={theme === "dither" ? "light" : "dark"} />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}

// A safe no-op when EXPO_PUBLIC_SENTRY_DSN isn't set (see lib/sentry.ts) —
// adds a top-level error boundary + navigation instrumentation once it is.
export default Sentry.wrap(RootLayout);
