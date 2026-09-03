// This screen's active-workout logger uses plain useState (not RHF), but
// hits the same React 19.2 / RN 0.86 / RNTL 14.0.1 quirk documented in
// sign-in.test.tsx: a bare `fireEvent.changeText` doesn't reliably flush its
// state update before the next queried element/assertion runs. Wrapping each
// interaction in `act(async () => { ...; await Promise.resolve(); })` forces
// the flush — confirmed by direct reproduction (querying the input's value
// right after a bare fireEvent.changeText read back the OLD value; wrapping
// it as below reads back the new one).
import { act, fireEvent, renderWithProviders, waitFor } from "@/test-utils/render";

import WorkoutSessionScreen from "../../app/(tabs)/workouts/session/[workoutId]";

const mockLogSetMutate = jest.fn();
const mockFinishWorkoutMutate = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ workoutId: "workout-1" }),
}));

jest.mock("@/features/auth/hooks", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

jest.mock("@/features/workouts/hooks", () => ({
  useWorkout: () => ({
    data: {
      id: "workout-1",
      name: "Push Day",
      ended_at: null,
      workout_exercises: [
        {
          id: "we-1",
          order_index: 0,
          exercise: { id: "e-1", name: "Bench Press" },
          sets: [],
        },
      ],
    },
    isLoading: false,
  }),
  useAddExerciseToWorkout: () => ({ mutate: jest.fn(), isPending: false }),
  useFinishWorkout: () => ({ mutate: mockFinishWorkoutMutate, isPending: false }),
  useLogSet: () => ({ mutate: mockLogSetMutate, isPending: false }),
  useExerciseSearch: () => ({ data: [], isLoading: false }),
  useCreateCustomExercise: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

it("logs a set for an exercise in the active workout", async () => {
  const { getByLabelText } = await renderWithProviders(<WorkoutSessionScreen />);

  await act(async () => {
    fireEvent.changeText(getByLabelText("Weight (kg) — Bench Press"), "60");
    await Promise.resolve();
  });
  await act(async () => {
    fireEvent.changeText(getByLabelText("Reps — Bench Press"), "8");
    await Promise.resolve();
  });
  fireEvent.press(getByLabelText("Log set — Bench Press"));

  await waitFor(() => {
    expect(mockLogSetMutate).toHaveBeenCalledWith(
      expect.objectContaining({ weight: 60, reps: 8, is_warmup: false }),
      expect.any(Object)
    );
  });
});
