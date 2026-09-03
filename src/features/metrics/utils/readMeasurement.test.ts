import type { BodyMetric } from "@/features/metrics/types";

import { readMeasurement } from "./readMeasurement";

function metric(measurements: BodyMetric["measurements"]): BodyMetric {
  return {
    id: "m1",
    user_id: "u1",
    date: "2026-09-01",
    weight_kg: null,
    measurements,
    photo_urls: [],
    created_at: "2026-09-01T00:00:00Z",
  };
}

describe("readMeasurement", () => {
  it("reads a numeric value for the given key", () => {
    expect(readMeasurement(metric({ waist_cm: 80.5 }), "waist_cm")).toBe(80.5);
  });

  it("returns null when the key is absent", () => {
    expect(readMeasurement(metric({ waist_cm: 80.5 }), "chest_cm")).toBeNull();
  });

  it("returns null when measurements is null", () => {
    expect(readMeasurement(metric(null), "waist_cm")).toBeNull();
  });

  it("returns null when the value at the key isn't a number", () => {
    expect(readMeasurement(metric({ waist_cm: "80.5" }), "waist_cm")).toBeNull();
  });

  it("returns null when measurements is an array (defensive against the loose Json type)", () => {
    expect(readMeasurement(metric([1, 2, 3]), "waist_cm")).toBeNull();
  });
});
