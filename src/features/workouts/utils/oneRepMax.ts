/**
 * Epley formula: estimates the max weight liftable for one rep, from a set
 * actually performed at a lighter weight for more reps.
 */
export function estimateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
