import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * TanStack Query's `onlineManager` has no way to know real connectivity on
 * React Native (there's no `navigator.onLine`) unless told — without this,
 * every mutation just tries immediately regardless of network state, and
 * `networkMode: "offlineFirst"` (see queryClient.ts) never actually pauses
 * anything. This is what makes the offline queue-and-replay behavior real.
 *
 * Call once, from the root layout.
 */
export function useSyncNetworkStatus() {
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
      });
    });
  }, []);
}

/** Live connectivity state for UI (e.g. an offline banner). */
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
  }, []);

  return isOnline;
}
