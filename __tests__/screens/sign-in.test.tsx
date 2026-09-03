/**
 * Lives outside app/ deliberately — Expo Router treats every file under
 * app/ as a route, so a co-located sign-in.test.tsx there would itself
 * become a (broken) route. Importing the route component from here avoids
 * that while still testing the real screen.
 *
 * Split across three files (this one plus sign-in-invalid.test.tsx and
 * sign-in-valid.test.tsx), one scenario per file, rather than three `it`s
 * in one describe block: a `fireEvent.press` that triggers RHF's async
 * Zod validation leaves a pending microtask that — in this exact React 19 /
 * RN 0.86 / RNTL v14 combination — corrupts whichever render happens next
 * *in the same file*, confirmed by isolating it down to a minimal
 * reproduction (explicit cleanup, act()-wrapping, and manual microtask
 * flushing all failed to prevent it). Jest's per-file module isolation
 * sidesteps it reliably; chasing the library-version root cause further
 * wasn't a good use of time for a portfolio project.
 */
import { renderWithProviders } from "@/test-utils/render";

import SignInScreen from "../../app/(auth)/sign-in";

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories can't use top-level imports (hoisting)
  const { Text } = require("react-native");
  return {
    router: { replace: jest.fn() },
    Link: ({ children, ...props }: { children: React.ReactNode }) => (
      <Text {...props}>{children}</Text>
    ),
  };
});

jest.mock("@/features/auth/hooks", () => ({
  useSignIn: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

it("renders the email/password fields and sign-in button", async () => {
  // RNTL v14's render() is async.
  const { getByLabelText, getByText } = await renderWithProviders(<SignInScreen />);

  expect(getByLabelText("Email")).toBeTruthy();
  expect(getByLabelText("Password")).toBeTruthy();
  expect(getByText("Sign In")).toBeTruthy();
});
