import { calculateTargets } from "./calculateTargets";

describe("calculateTargets", () => {
  it("computes a maintenance target close to hand-calculated Mifflin-St Jeor TDEE", () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    // TDEE = 1780 * 1.55 (moderate) = 2759
    const result = calculateTargets({
      sex: "male",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: "moderate",
      goal: "maintain",
    });
    expect(result.caloriesTarget).toBe(2759);
    expect(result.proteinGTarget).toBe(160); // 2g/kg * 80kg
  });

  it("subtracts ~500 calories for a cut and adds ~300 for a bulk relative to maintenance", () => {
    const base = { sex: "female", age: 28, heightCm: 165, weightKg: 60, activityLevel: "light" } as const;
    const maintain = calculateTargets({ ...base, goal: "maintain" });
    const cut = calculateTargets({ ...base, goal: "cut" });
    const bulk = calculateTargets({ ...base, goal: "bulk" });

    expect(maintain.caloriesTarget - cut.caloriesTarget).toBe(500);
    expect(bulk.caloriesTarget - maintain.caloriesTarget).toBe(300);
  });

  it("never returns a calorie target below the safety floor, even for a low-weight aggressive cut", () => {
    const result = calculateTargets({
      sex: "female",
      age: 65,
      heightCm: 150,
      weightKg: 45,
      activityLevel: "sedentary",
      goal: "cut",
    });
    expect(result.caloriesTarget).toBeGreaterThanOrEqual(1200);
  });

  it("splits macros so protein + fat + carb calories add up to (approximately) the calorie target", () => {
    const result = calculateTargets({
      sex: "other",
      age: 40,
      heightCm: 170,
      weightKg: 70,
      activityLevel: "active",
      goal: "maintain",
    });
    const macroCalories =
      result.proteinGTarget * 4 + result.carbsGTarget * 4 + result.fatGTarget * 9;
    expect(Math.abs(macroCalories - result.caloriesTarget)).toBeLessThanOrEqual(4);
  });
});
