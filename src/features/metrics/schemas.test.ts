import { logBodyMetricSchema } from "./schemas";

const empty = { weightKg: "", waistCm: "", chestCm: "", armCm: "" };

describe("logBodyMetricSchema", () => {
  it("accepts weight only and coerces it to a number", () => {
    const result = logBodyMetricSchema.safeParse({ ...empty, weightKg: "75.5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        weightKg: 75.5,
        waistCm: undefined,
        chestCm: undefined,
        armCm: undefined,
      });
    }
  });

  it("accepts measurements only, with weight left out", () => {
    const result = logBodyMetricSchema.safeParse({ ...empty, waistCm: "82", chestCm: "100" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weightKg).toBeUndefined();
      expect(result.data.waistCm).toBe(82);
      expect(result.data.chestCm).toBe(100);
    }
  });

  it("rejects a submission with every field empty", () => {
    expect(logBodyMetricSchema.safeParse(empty).success).toBe(false);
  });

  it("rejects a negative or zero value", () => {
    expect(logBodyMetricSchema.safeParse({ ...empty, weightKg: "-40" }).success).toBe(false);
    expect(logBodyMetricSchema.safeParse({ ...empty, weightKg: "0" }).success).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(logBodyMetricSchema.safeParse({ ...empty, weightKg: "abc" }).success).toBe(false);
  });
});
