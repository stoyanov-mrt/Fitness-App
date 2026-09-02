import { z } from "zod";

// Mirrors the string->number pipe pattern in features/onboarding/schemas.ts:
// a controlled TextInput can only hold a string, so numeric fields take a
// string input and transform+validate into a number, keeping the form's
// input type distinct from its submit-time output.
function numericStringField(message: string) {
  return z
    .string()
    .min(1, "Required")
    .transform((value) => Number(value))
    .pipe(z.number().min(0, message));
}

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  calories: numericStringField("Enter calories (0 or more)"),
  proteinG: numericStringField("Enter protein in grams (0 or more)"),
  carbsG: numericStringField("Enter carbs in grams (0 or more)"),
  fatG: numericStringField("Enter fat in grams (0 or more)"),
});

export type CustomFoodFormInput = z.input<typeof customFoodSchema>;
export type CustomFoodFormValues = z.output<typeof customFoodSchema>;
