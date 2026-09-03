import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/types/database";

import {
  addExerciseToWorkout,
  createCustomExercise,
  createRoutine,
  deleteRoutine,
  deleteSet,
  duplicateRoutine,
  finishWorkout,
  getExercise,
  getExerciseSetHistory,
  getRoutine,
  getWorkout,
  listRoutines,
  listWorkoutHistory,
  logSet,
  searchExercises,
  startWorkout,
  updateSet,
  type NewRoutineExercise,
} from "./api";
import type { SetRow, WorkoutWithExercises } from "./types";

type SetInsert = Database["public"]["Tables"]["sets"]["Insert"];

export function useExerciseSearch(query: string, category?: string) {
  return useQuery({
    queryKey: ["exercises", "search", query, category ?? null],
    queryFn: () => searchExercises(query, category),
  });
}

export function useCreateCustomExercise(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: {
      name: string;
      category: string;
      primaryMuscle: string;
      equipment: string;
    }) => createCustomExercise(userId as string, exercise),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] }),
  });
}

export function useExercise(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: () => getExercise(exerciseId as string),
    enabled: !!exerciseId,
  });
}

export function useExerciseHistory(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ["exercise-history", exerciseId],
    queryFn: () => getExerciseSetHistory(exerciseId as string),
    enabled: !!exerciseId,
  });
}

export function useRoutines(userId: string | undefined) {
  return useQuery({
    queryKey: ["routines", userId],
    queryFn: () => listRoutines(userId as string),
    enabled: !!userId,
  });
}

export function useRoutine(routineId: string | undefined) {
  return useQuery({
    queryKey: ["routine", routineId],
    queryFn: () => getRoutine(routineId as string),
    enabled: !!routineId,
  });
}

export function useCreateRoutine(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      routine,
      exercises,
    }: {
      routine: { name: string; description: string | null };
      exercises: NewRoutineExercise[];
    }) => createRoutine(userId as string, routine, exercises),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routines", userId] }),
  });
}

export function useDeleteRoutine(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => deleteRoutine(routineId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routines", userId] }),
  });
}

export function useDuplicateRoutine(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => duplicateRoutine(userId as string, routineId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routines", userId] }),
  });
}

export function useWorkoutHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["workout-history", userId],
    queryFn: () => listWorkoutHistory(userId as string),
    enabled: !!userId,
  });
}

export function useWorkout(workoutId: string | undefined) {
  return useQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => getWorkout(workoutId as string),
    enabled: !!workoutId,
  });
}

export function useStartWorkout(userId: string | undefined) {
  return useMutation({
    mutationFn: (options: { routineId?: string; name?: string } = {}) =>
      startWorkout(userId as string, options),
  });
}

export function useAddExerciseToWorkout(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, orderIndex }: { exerciseId: string; orderIndex: number }) =>
      addExerciseToWorkout(workoutId, exerciseId, orderIndex),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout", workoutId] }),
  });
}

/**
 * Optimistic per CLAUDE.md's offline strategy: a logged set appears in the
 * active workout instantly, then rolls back if the write actually fails.
 */
export function useLogSet(workoutId: string, workoutExerciseId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["workout", workoutId] as const;

  return useMutation({
    mutationFn: (set: Omit<SetInsert, "workout_exercise_id">) => logSet(workoutExerciseId, set),
    onMutate: async (set) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WorkoutWithExercises>(queryKey);

      const optimisticSet: SetRow = {
        id: `optimistic-${Date.now()}`,
        workout_exercise_id: workoutExerciseId,
        set_index: set.set_index ?? 0,
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe ?? null,
        is_warmup: set.is_warmup ?? false,
        completed_at: new Date().toISOString(),
      };

      if (previous) {
        queryClient.setQueryData<WorkoutWithExercises>(queryKey, {
          ...previous,
          workout_exercises: previous.workout_exercises.map((we) =>
            we.id === workoutExerciseId ? { ...we, sets: [...we.sets, optimisticSet] } : we
          ),
        });
      }

      return { previous };
    },
    onError: (_error, _set, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useUpdateSet(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ setId, patch }: { setId: string; patch: Database["public"]["Tables"]["sets"]["Update"] }) =>
      updateSet(setId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout", workoutId] }),
  });
}

export function useDeleteSet(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (setId: string) => deleteSet(setId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout", workoutId] }),
  });
}

export function useFinishWorkout(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workoutId: string) => finishWorkout(workoutId),
    onSuccess: (_data, workoutId) => {
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
      queryClient.invalidateQueries({ queryKey: ["workout-history", userId] });
    },
  });
}
