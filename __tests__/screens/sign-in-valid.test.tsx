// See the comment in sign-in.test.tsx for why this scenario has its own file.
import { fireEvent, renderWithProviders, waitFor } from "@/test-utils/render";

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

it("submits the entered credentials when the form is valid", async () => {
  const { getByLabelText, getByText } = await renderWithProviders(<SignInScreen />);

  fireEvent.changeText(getByLabelText("Email"), "test@example.com");
  fireEvent.changeText(getByLabelText("Password"), "password123");
  fireEvent.press(getByText("Sign In"));

  await waitFor(() => {
    expect(mockMutate).toHaveBeenCalledWith(
      { email: "test@example.com", password: "password123" },
      expect.any(Object)
    );
  });
});
