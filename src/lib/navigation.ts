import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useSession } from "@/features/auth/hooks";
import { useProfile } from "@/features/onboarding/hooks";

/**
 * Redirect guard for the three top-level route groups: (auth), (onboarding),
 * (tabs). Cross-domain (needs both auth and onboarding state), so it lives
 * here rather than in either feature folder — see CLAUDE.md's rule of thumb.
 *
 * "Onboarding complete" is inferred from profiles.full_name being set, since
 * that field is only ever written by the onboarding submit (the signup
 * trigger creates a bare row with every field null).
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();

  const { data: session, isLoading: sessionLoading } = useSession();
  const userId = session?.user.id;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);

  const onboardingComplete = !!profile?.full_name;
  const inAuthGroup = segments[0] === "(auth)";
  const inOnboardingGroup = segments[0] === "(onboarding)";

  useEffect(() => {
    if (sessionLoading) return;

    if (!session) {
      if (!inAuthGroup) router.replace("/sign-in");
      return;
    }

    if (profileLoading) return;

    if (!onboardingComplete) {
      if (!inOnboardingGroup) router.replace("/welcome");
      return;
    }

    if (inAuthGroup || inOnboardingGroup) {
      router.replace("/");
    }
  }, [
    session,
    sessionLoading,
    profileLoading,
    onboardingComplete,
    inAuthGroup,
    inOnboardingGroup,
    router,
  ]);

  const isReady = !sessionLoading && (!session || !profileLoading);
  return { isReady };
}
