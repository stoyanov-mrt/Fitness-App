// See the comment in screens/sign-in.test.tsx re: one fireEvent.press
// scenario per file (RHF+Zod async validation + this exact RN/RNTL version
// combo).
import { fireEvent, renderWithProviders } from "@/test-utils/render";

import OnboardingScreen from "../../app/(onboarding)/welcome";

const mockMutate = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/features/auth/hooks", () => ({
  useSession: () => ({ data: { user: { id: "test-user-id" } } }),
}));

jest.mock("@/features/onboarding/hooks", () => ({
  useCompleteOnboarding: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

it("shows validation errors and does not submit when the form is empty", async () => {
  const { getByText, findByText } = await renderWithProviders(<OnboardingScreen />);

  fireEvent.press(getByText("Finish"));

  expect(await findByText("Name is required")).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();
});
