// See the comment in workout-session.test.tsx re: wrapping fireEvent calls in
// act(async () => { ...; await Promise.resolve(); }) to reliably flush state
// before the next query/assertion, for this exact RN/RNTL version combo. And
// see sign-in.test.tsx re: one press-scenario per file.
import { act, fireEvent, renderWithProviders, waitFor } from "@/test-utils/render";

import NutritionScreen from "../../app/(tabs)/nutrition/index";

const mockLogSavedMealMutate = jest.fn();

jest.mock("@/features/auth/hooks", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

jest.mock("@/features/nutrition/hooks", () => ({
  useLatestGoal: () => ({ data: { calories_target: 2200 } }),
  useDailySummary: () => ({
    data: { total_calories: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0 },
  }),
  useDailyDiary: () => ({ data: [] }),
  useRemoveMealItem: () => ({ mutate: jest.fn() }),
  useFoodSearch: () => ({ data: [], isLoading: false }),
  useAddMealItem: () => ({ mutate: jest.fn(), isPending: false }),
  useCreateCustomFood: () => ({ mutate: jest.fn(), isPending: false }),
  useSavedMeals: () => ({
    data: [
      {
        id: "saved-1",
        name: "My Usual Breakfast",
        saved_meal_items: [
          { id: "smi-1", quantity: 2, food: { calories: 150 } },
          { id: "smi-2", quantity: 1, food: { calories: 90 } },
        ],
      },
    ],
    isLoading: false,
  }),
  useLogSavedMeal: () => ({ mutate: mockLogSavedMealMutate, isPending: false, isError: false }),
}));

it("logs a saved meal to breakfast in one action", async () => {
  const { getByLabelText, getByText } = await renderWithProviders(<NutritionScreen />);

  await act(async () => {
    fireEvent.press(getByLabelText("Add to Breakfast"));
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.press(getByText("Use a saved meal"));
    await Promise.resolve();
  });

  expect(getByText("My Usual Breakfast")).toBeTruthy();
  expect(getByText("2 items · 390 kcal")).toBeTruthy();

  fireEvent.press(getByText("My Usual Breakfast"));

  await waitFor(() => {
    expect(mockLogSavedMealMutate).toHaveBeenCalledWith(
      { mealType: "breakfast", savedMealId: "saved-1" },
      expect.any(Object)
    );
  });
});
