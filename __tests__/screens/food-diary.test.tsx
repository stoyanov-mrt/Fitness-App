// See the comment in workout-session.test.tsx re: wrapping fireEvent.changeText
// in `act(async () => { ...; await Promise.resolve(); })` to reliably flush
// state before the next query/assertion, for this exact RN/RNTL version combo.
import { act, fireEvent, renderWithProviders, waitFor } from "@/test-utils/render";

import NutritionScreen from "../../app/(tabs)/nutrition/index";

const mockCreateCustomFoodMutate = jest.fn((_values, options) => {
  options?.onSuccess?.({
    id: "food-1",
    name: "Maestro Test Oats",
    calories: 350,
    protein_g: 12,
    carbs_g: 60,
    fat_g: 6,
    serving_size: 100,
    serving_unit: "g",
  });
});
const mockAddMealItemMutate = jest.fn();

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
  useAddMealItem: () => ({ mutate: mockAddMealItemMutate, isPending: false }),
  useCreateCustomFood: () => ({ mutate: mockCreateCustomFoodMutate, isPending: false }),
  useSavedMeals: () => ({ data: [], isLoading: false }),
  useLogSavedMeal: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

it("adds a custom food to today's breakfast", async () => {
  const { getByLabelText, getByText } = await renderWithProviders(<NutritionScreen />);

  await act(async () => {
    fireEvent.press(getByLabelText("Add to Breakfast"));
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.press(getByText("Can't find it? Add a custom food"));
    await Promise.resolve();
  });

  await act(async () => {
    fireEvent.changeText(getByLabelText("Name"), "Maestro Test Oats");
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.changeText(getByLabelText("Calories"), "350");
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.changeText(getByLabelText("Protein (g)"), "12");
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.changeText(getByLabelText("Carbs (g)"), "60");
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.changeText(getByLabelText("Fat (g)"), "6");
    await Promise.resolve();
  });

  fireEvent.press(getByText("Save & continue"));

  await waitFor(() => {
    expect(mockCreateCustomFoodMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Maestro Test Oats", calories: 350 }),
      expect.any(Object)
    );
  });

  fireEvent.press(getByText("Add to diary"));

  await waitFor(() => {
    expect(mockAddMealItemMutate).toHaveBeenCalledWith(
      expect.objectContaining({ mealType: "breakfast", quantity: 1 }),
      expect.any(Object)
    );
  });
});
