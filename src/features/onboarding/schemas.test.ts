import { ageFromDateOfBirth, onboardingSchema } from "./schemas";

// Local-date formatter (not toISOString, which converts to UTC and can
// shift the date by a day depending on the machine's timezone).
function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("ageFromDateOfBirth", () => {
  it("computes age correctly when the birthday has already passed this year", () => {
    const today = new Date();
    const dob = toDateOnlyString(
      new Date(today.getFullYear() - 30, today.getMonth(), today.getDate() - 1)
    );
    expect(ageFromDateOfBirth(dob)).toBe(30);
  });

  it("computes age correctly when the birthday hasn't happened yet this year", () => {
    const today = new Date();
    const dob = toDateOnlyString(
      new Date(today.getFullYear() - 30, today.getMonth(), today.getDate() + 1)
    );
    expect(ageFromDateOfBirth(dob)).toBe(29);
  });
});

describe("onboardingSchema", () => {
  const validPayload = {
    fullName: "Jane Doe",
    sex: "female" as const,
    dateOfBirth: "1995-06-15",
    heightCm: "170",
    currentWeightKg: "65",
    activityLevel: "moderate" as const,
    goal: "maintain" as const,
    unitSystem: "metric" as const,
  };

  it("accepts a valid payload", () => {
    expect(onboardingSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects someone under 13", () => {
    const result = onboardingSchema.safeParse({ ...validPayload, dateOfBirth: "2020-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range height", () => {
    const result = onboardingSchema.safeParse({ ...validPayload, heightCm: "30" });
    expect(result.success).toBe(false);
  });
});
