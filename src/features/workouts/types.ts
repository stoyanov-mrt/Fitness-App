import type { Database } from "@/types/database";

export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type Routine = Database["public"]["Tables"]["routines"]["Row"];
export type RoutineExercise = Database["public"]["Tables"]["routine_exercises"]["Row"];
export type Workout = Database["public"]["Tables"]["workouts"]["Row"];
export type WorkoutExercise = Database["public"]["Tables"]["workout_exercises"]["Row"];
export type SetRow = Database["public"]["Tables"]["sets"]["Row"];

export type RoutineWithExercises = Routine & {
  routine_exercises: (RoutineExercise & { exercise: Exercise })[];
};

export type WorkoutExerciseWithSets = WorkoutExercise & {
  exercise: Exercise;
  sets: SetRow[];
};

export type WorkoutWithExercises = Workout & {
  workout_exercises: WorkoutExerciseWithSets[];
};
