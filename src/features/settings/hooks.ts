import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "@/features/onboarding/api";
import { profileQueryKey } from "@/features/onboarding/hooks";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// Re-exported so Settings doesn't need to know profile data lives in the
// onboarding feature module — see the comment in onboarding/hooks.ts.
export { useProfile } from "@/features/onboarding/hooks";

type DisplayPrefs = Pick<ProfileRow, "unit_system" | "theme">;

export function useUpdateDisplayPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<DisplayPrefs>) => {
      if (!userId) throw new Error("Must be signed in to update settings");
      return updateProfile(userId, patch);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey(userId), profile);
    },
  });
}
