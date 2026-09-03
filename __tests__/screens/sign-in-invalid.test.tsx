// See the comment in sign-in.test.tsx for why this scenario has its own file.
import { fireEvent, renderWithProviders } from "@/test-utils/render";

import SignInScreen from "../../app/(auth)/sign-in";

const mockMutate = jest.fn();

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
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

it("shows a validation error and does not submit for an invalid email", async () => {
  const { getByLabelText, getByText, findByText } = await renderWithProviders(
    <SignInScreen />
  );

  fireEvent.changeText(getByLabelText("Email"), "not-an-email");
  fireEvent.changeText(getByLabelText("Password"), "password123");
  fireEvent.press(getByText("Sign In"));

  expect(await findByText("Enter a valid email")).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();
});
