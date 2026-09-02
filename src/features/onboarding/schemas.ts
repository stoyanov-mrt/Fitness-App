import { z } from "zod";

// A controlled TextInput can only hold a string, so numeric fields take a
// string input and transform+validate into a number — keeping the form's
// TFieldValues (input) distinct from its submit-time output, per RHF's
// resolver typing (see onboardingSchema usages: z.input vs z.output).
function numericStringField(min: number, max: number, message: string) {
  return z
    .string()
    .min(1, "Required")
    .transform((value) => Number(value))
    .pipe(z.number().min(min, message).max(max, message));
}

// Source of truth for the onboarding form (React Hook Form) and the shape
// sent to Supabase. Height/weight are always collected in metric (cm/kg) —
// `unitSystem` is stored purely as a *display* preference for other screens
// to convert against, not a re-parametrization of these inputs.
export const onboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  sex: z.enum(["male", "female", "other"]),
  dateOfBirth: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => ageFromDateOfBirth(value) >= 13, "Must be at least 13 years old")
    .refine((value) => ageFromDateOfBirth(value) <= 100, "Enter a valid date of birth"),
  heightCm: numericStringField(100, 250, "Enter a height in cm (100-250)"),
  currentWeightKg: numericStringField(30, 300, "Enter a weight in kg (30-300)"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["cut", "maintain", "bulk"]),
  unitSystem: z.enum(["metric", "imperial"]).default("metric"),
});

// What the form fields actually hold before submit (numeric fields are
// still strings) vs. what `handleSubmit`'s callback receives after the
// resolver parses/transforms them.
export type OnboardingFormInput = z.input<typeof onboardingSchema>;
export type OnboardingFormValues = z.output<typeof onboardingSchema>;

export function ageFromDateOfBirth(dateOfBirth: string): number {
  // Parse as local calendar date, not UTC: `new Date("YYYY-MM-DD")` parses
  // as UTC midnight per the ISO 8601 date-only spec, which is off by a day
  // from `today` (local) for anyone west of UTC — a real bug, not just a
  // test artifact.
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const dob = new Date(year, (month ?? 1) - 1, day ?? 1);
  if (Number.isNaN(dob.getTime())) return NaN;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}
