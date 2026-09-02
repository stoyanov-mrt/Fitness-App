import { z } from "zod";

// Source of truth for both the sign-in/sign-up forms (React Hook Form) and
// any server-side validation that needs the same shape — see CLAUDE.md.
export const emailPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type EmailPasswordFormValues = z.infer<typeof emailPasswordSchema>;
