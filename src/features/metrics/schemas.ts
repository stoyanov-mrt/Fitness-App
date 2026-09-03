import { z } from "zod";

// Every field here is optional (a user might log just weight, just
// measurements, or both) but must be a valid positive number if they do
// enter something — same string-input/number-output split as
// features/nutrition/schemas.ts's numericStringField, adapted for
// "optional, but validated when present."
function optionalPositiveNumberField(message: string) {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) > 0), {
      message,
    })
    .transform((value) => (value === "" ? undefined : Number(value)));
}

export const logBodyMetricSchema = z
  .object({
    weightKg: optionalPositiveNumberField("Enter a positive weight"),
    waistCm: optionalPositiveNumberField("Enter a positive measurement"),
    chestCm: optionalPositiveNumberField("Enter a positive measurement"),
    armCm: optionalPositiveNumberField("Enter a positive measurement"),
  })
  .refine(
    (values) =>
      values.weightKg !== undefined ||
      values.waistCm !== undefined ||
      values.chestCm !== undefined ||
      values.armCm !== undefined,
    { message: "Enter at least one value", path: ["weightKg"] }
  );

export type LogBodyMetricFormInput = z.input<typeof logBodyMetricSchema>;
export type LogBodyMetricFormValues = z.output<typeof logBodyMetricSchema>;
