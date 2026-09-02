import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

import { getSession, signInWithEmail, signOut, signUpWithEmail } from "./api";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    staleTime: Infinity, // kept fresh by the auth-state listener below, not polling
  });
}

/**
 * Subscribes to Supabase's onAuthStateChange once and mirrors it into the
 * TanStack Query cache, so `useSession` (and anything invalidated alongside
 * it) always reflects the live auth state. Call this exactly once, from the
 * root layout.
 */
export function useAuthSessionSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        queryClient.setQueryData(sessionQueryKey, session);
      }
    );
    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUpWithEmail(email, password),
    onSuccess: (session) => queryClient.setQueryData(sessionQueryKey, session),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmail(email, password),
    onSuccess: (session) => queryClient.setQueryData(sessionQueryKey, session),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryKey, null);
      queryClient.clear(); // drop all cached server data on sign-out
    },
  });
}
