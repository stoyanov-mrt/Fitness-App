import { detectPersonalRecords, type SetForPR } from "./prDetection";

function set(overrides: Partial<SetForPR>): SetForPR {
  return {
    weight: 100,
    reps: 5,
    isWarmup: false,
    workoutId: "workout-1",
    completedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("detectPersonalRecords", () => {
  it("returns nulls for an empty history", () => {
    const result = detectPersonalRecords([]);
    expect(result.heaviestWeight).toBeNull();
    expect(result.bestEstimatedOneRepMax).toBeNull();
    expect(result.bestSessionVolume).toBeNull();
  });

  it("ignores warm-up sets entirely", () => {
    const result = detectPersonalRecords([
      set({ weight: 999, isWarmup: true }),
      set({ weight: 100, isWarmup: false }),
    ]);
    expect(result.heaviestWeight?.value).toBe(100);
  });

  it("picks the heaviest single-set weight regardless of reps", () => {
    const result = detectPersonalRecords([
      set({ weight: 80, reps: 10, workoutId: "w1" }),
      set({ weight: 120, reps: 1, workoutId: "w2" }),
    ]);
    expect(result.heaviestWeight?.value).toBe(120);
    expect(result.heaviestWeight?.workoutId).toBe("w2");
  });

  it("picks the best estimated 1RM, which can come from a lighter, higher-rep set", () => {
    const result = detectPersonalRecords([
      // 1RM ~= 100 * (1 + 10/30) = 133.3
      set({ weight: 100, reps: 10, workoutId: "w1" }),
      // 1RM = 120 (single rep)
      set({ weight: 120, reps: 1, workoutId: "w2" }),
    ]);
    expect(result.bestEstimatedOneRepMax?.workoutId).toBe("w1");
    expect(result.bestEstimatedOneRepMax?.value).toBeCloseTo(133.33, 1);
  });

  it("sums volume per workout session and picks the best session, not the best single set", () => {
    const result = detectPersonalRecords([
      set({ weight: 100, reps: 5, workoutId: "w1" }), // 500
      set({ weight: 100, reps: 5, workoutId: "w1" }), // 500 -> session total 1000
      set({ weight: 150, reps: 5, workoutId: "w2" }), // 750, single session
    ]);
    expect(result.bestSessionVolume?.workoutId).toBe("w1");
    expect(result.bestSessionVolume?.value).toBe(1000);
  });
});
