import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

// Server state only. Zustand stores (src/stores) hold UI/ephemeral state and
// must never mirror data that belongs here — see CLAUDE.md.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 24 * 60 * 60 * 1000, // keep a day of cache for offline reads
      retry: 2,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

// Persists the query cache to AsyncStorage so the last-known data (today's
// diary, recent workouts) is still visible if the app opens with no network,
// per the plan's offline strategy (persisted cache + optimistic mutations,
// not a full offline-first sync engine).
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "fitness-app-query-cache",
});
