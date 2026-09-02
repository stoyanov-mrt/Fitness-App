import "@/theme/global.css";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthSessionSync } from "@/features/auth/hooks";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { useProtectedRoute } from "@/lib/navigation";
import { useSyncNativeWindTheme } from "@/lib/theme";

function RootNavigator() {
  useAuthSessionSync();
  useSyncNativeWindTheme();
  const { isReady } = useProtectedRoute();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
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
