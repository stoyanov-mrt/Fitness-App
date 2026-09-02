import { customFoodSchema } from "./schemas";

describe("customFoodSchema", () => {
  const validPayload = {
    name: "My Protein Shake",
    calories: "150",
    proteinG: "25",
    carbsG: "10",
    fatG: "3",
  };

  it("accepts a valid payload and coerces numeric strings to numbers", () => {
    const result = customFoodSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "My Protein Shake",
        calories: 150,
        proteinG: 25,
        carbsG: 10,
        fatG: 3,
      });
    }
  });

  it("rejects an empty name", () => {
    expect(customFoodSchema.safeParse({ ...validPayload, name: "  " }).success).toBe(false);
  });

  it("rejects an empty or non-numeric macro field", () => {
    expect(customFoodSchema.safeParse({ ...validPayload, calories: "" }).success).toBe(false);
    expect(customFoodSchema.safeParse({ ...validPayload, proteinG: "abc" }).success).toBe(false);
  });

  it("rejects a negative macro value", () => {
    expect(customFoodSchema.safeParse({ ...validPayload, fatG: "-1" }).success).toBe(false);
  });
});
