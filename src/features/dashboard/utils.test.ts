import {
  lastSevenDays,
  toDateKey,
  weightTrend,
  workoutDayKeys,
  workoutsWithinDays,
} from "./utils";

describe("lastSevenDays", () => {
  it("returns 7 days, oldest first, ending on the reference date", () => {
    const reference = new Date("2026-09-10T12:00:00");
    const days = lastSevenDays(reference);

    expect(days).toHaveLength(7);
    expect(toDateKey(days[0])).toBe("2026-09-04");
    expect(toDateKey(days[6])).toBe("2026-09-10");
  });
});

describe("workoutDayKeys", () => {
  it("dedupes multiple sessions on the same day into one key", () => {
    const keys = workoutDayKeys([
      { started_at: "2026-09-10T08:00:00Z" },
      { started_at: "2026-09-10T18:00:00Z" },
      { started_at: "2026-09-09T08:00:00Z" },
    ]);

    expect(keys.size).toBe(2);
  });
});

describe("workoutsWithinDays", () => {
  it("counts every session in the window, including multiple in one day", () => {
    const days = lastSevenDays(new Date("2026-09-10T12:00:00"));
    const count = workoutsWithinDays(
      [
        { started_at: "2026-09-10T08:00:00" },
        { started_at: "2026-09-10T18:00:00" },
        { started_at: "2026-08-01T08:00:00" }, // well outside the window
      ],
      days
    );

    expect(count).toBe(2);
  });
});

describe("weightTrend", () => {
  it("returns null with fewer than 2 recent entries", () => {
    expect(weightTrend([{ weight_kg: 80 }], 80)).toBeNull();
    expect(weightTrend([], 80)).toBeNull();
  });

  it("returns null when the latest weight is missing", () => {
    expect(weightTrend([{ weight_kg: 79 }, { weight_kg: 80 }], null)).toBeNull();
  });

  it("returns null when the oldest entry in the window has no weight", () => {
    expect(weightTrend([{ weight_kg: null }, { weight_kg: 80 }], 81)).toBeNull();
  });

  it("computes the change from the oldest entry in the window to the latest weight", () => {
    expect(weightTrend([{ weight_kg: 79 }, { weight_kg: 80 }], 80.5)).toBeCloseTo(1.5);
  });
});
