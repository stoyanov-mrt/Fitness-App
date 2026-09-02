import { estimateOneRepMax } from "./oneRepMax";

export type SetForPR = {
  weight: number;
  reps: number;
  isWarmup: boolean;
  workoutId: string;
  completedAt: string; // ISO timestamp
};

export type PersonalRecord = {
  value: number;
  workoutId: string;
  achievedAt: string;
};

export type PersonalRecords = {
  heaviestWeight: PersonalRecord | null;
  bestEstimatedOneRepMax: PersonalRecord | null;
  bestSessionVolume: PersonalRecord | null;
};

/**
 * Computes an exercise's all-time PRs from its full set history: heaviest
 * single-set weight, best estimated 1RM (Epley), and best single-session
 * volume (sum of weight*reps across all sets in one workout). Warm-up sets
 * are excluded from every PR — they aren't a measure of working strength.
 */
export function detectPersonalRecords(sets: SetForPR[]): PersonalRecords {
  const workingSets = sets.filter((set) => !set.isWarmup);

  let heaviestWeight: PersonalRecord | null = null;
  let bestEstimatedOneRepMax: PersonalRecord | null = null;

  for (const set of workingSets) {
    if (!heaviestWeight || set.weight > heaviestWeight.value) {
      heaviestWeight = {
        value: set.weight,
        workoutId: set.workoutId,
        achievedAt: set.completedAt,
      };
    }

    const oneRepMax = estimateOneRepMax(set.weight, set.reps);
    if (!bestEstimatedOneRepMax || oneRepMax > bestEstimatedOneRepMax.value) {
      bestEstimatedOneRepMax = {
        value: oneRepMax,
        workoutId: set.workoutId,
        achievedAt: set.completedAt,
      };
    }
  }

  const volumeByWorkout = new Map<string, { total: number; latestSetAt: string }>();
  for (const set of workingSets) {
    const existing = volumeByWorkout.get(set.workoutId);
    const volume = set.weight * set.reps;
    if (existing) {
      existing.total += volume;
      if (set.completedAt > existing.latestSetAt) existing.latestSetAt = set.completedAt;
    } else {
      volumeByWorkout.set(set.workoutId, { total: volume, latestSetAt: set.completedAt });
    }
  }

  let bestSessionVolume: PersonalRecord | null = null;
  for (const [workoutId, { total, latestSetAt }] of volumeByWorkout) {
    if (!bestSessionVolume || total > bestSessionVolume.value) {
      bestSessionVolume = { value: total, workoutId, achievedAt: latestSetAt };
    }
  }

  return { heaviestWeight, bestEstimatedOneRepMax, bestSessionVolume };
}
