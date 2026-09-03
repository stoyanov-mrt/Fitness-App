import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

import type {
  Exercise,
  RoutineWithExercises,
  SetRow,
  WorkoutWithExercises,
} from "./types";

type RoutineInsert = Database["public"]["Tables"]["routines"]["Insert"];
type RoutineExerciseInsert = Database["public"]["Tables"]["routine_exercises"]["Insert"];
type WorkoutInsert = Database["public"]["Tables"]["workouts"]["Insert"];
type SetInsert = Database["public"]["Tables"]["sets"]["Insert"];
type SetUpdate = Database["public"]["Tables"]["sets"]["Update"];
type ExerciseInsert = Database["public"]["Tables"]["exercises"]["Insert"];

// ---- Exercise library -----------------------------------------------------

export async function searchExercises(query: string, category?: string) {
  let request = supabase.from("exercises").select("*").order("name");
  if (query.trim()) request = request.ilike("name", `%${query.trim()}%`);
  if (category) request = request.eq("category", category);
  const { data, error } = await request.limit(100);
  if (error) throw error;
  return data as Exercise[];
}

export async function createCustomExercise(
  userId: string,
  exercise: { name: string; category: string; primaryMuscle: string; equipment: string }
) {
  // exercises.slug is unique across every user's rows (seeded + custom
  // alike), so a name-derived slug needs a disambiguating suffix — two
  // people (or one person twice) naming an exercise "Cable Fly" shouldn't
  // collide.
  const slug = `${exercise.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;

  const insert: ExerciseInsert = {
    slug,
    name: exercise.name,
    category: exercise.category,
    primary_muscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
    is_custom: true,
    created_by: userId,
  };
  const { data, error } = await supabase.from("exercises").insert(insert).select("*").single();
  if (error) throw error;
  return data as Exercise;
}

export async function getExercise(exerciseId: string) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exerciseId)
    .single();
  if (error) throw error;
  return data as Exercise;
}

/** Every set the current user has ever logged for this exercise, for PR detection. */
export async function getExerciseSetHistory(exerciseId: string) {
  const { data, error } = await supabase
    .from("sets")
    .select("weight, reps, is_warmup, completed_at, workout_exercises!inner(exercise_id, workout_id)")
    .eq("workout_exercises.exercise_id", exerciseId)
    .order("completed_at", { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    weight: row.weight,
    reps: row.reps,
    isWarmup: row.is_warmup,
    completedAt: row.completed_at,
    workoutId: row.workout_exercises.workout_id,
  }));
}

// ---- Routines ---------------------------------------------------------------

export async function listRoutines(userId: string) {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRoutine(routineId: string): Promise<RoutineWithExercises> {
  const { data, error } = await supabase
    .from("routines")
    .select("*, routine_exercises(*, exercise:exercises(*))")
    .eq("id", routineId)
    .order("order_index", { referencedTable: "routine_exercises" })
    .single();
  if (error) throw error;
  return data as unknown as RoutineWithExercises;
}

export type NewRoutineExercise = {
  exerciseId: string;
  targetSets: number | null;
  targetReps: string | null;
};

export async function createRoutine(
  userId: string,
  routine: { name: string; description: string | null },
  exercises: NewRoutineExercise[]
) {
  const insert: RoutineInsert = { user_id: userId, ...routine };
  const { data: created, error } = await supabase
    .from("routines")
    .insert(insert)
    .select("*")
    .single();
  if (error) throw error;

  if (exercises.length > 0) {
    const rows: RoutineExerciseInsert[] = exercises.map((ex, index) => ({
      routine_id: created.id,
      exercise_id: ex.exerciseId,
      order_index: index,
      target_sets: ex.targetSets,
      target_reps: ex.targetReps,
    }));
    const { error: exercisesError } = await supabase.from("routine_exercises").insert(rows);
    if (exercisesError) throw exercisesError;
  }

  return created;
}

export async function deleteRoutine(routineId: string) {
  const { error } = await supabase.from("routines").delete().eq("id", routineId);
  if (error) throw error;
}

/** Copies a routine — name, description, and every exercise's target
 * sets/reps in the same order — as a starting point to tweak rather than
 * rebuilding one from scratch. */
export async function duplicateRoutine(userId: string, routineId: string) {
  const original = await getRoutine(routineId);
  return createRoutine(
    userId,
    { name: `${original.name} (Copy)`, description: original.description },
    original.routine_exercises.map((re) => ({
      exerciseId: re.exercise_id,
      targetSets: re.target_sets,
      targetReps: re.target_reps,
    }))
  );
}

// ---- Workout sessions ---------------------------------------------------------

export async function startWorkout(
  userId: string,
  options: { routineId?: string; name?: string } = {}
) {
  const insert: WorkoutInsert = {
    user_id: userId,
    routine_id: options.routineId ?? null,
    name: options.name ?? "Workout",
  };
  const { data: workout, error } = await supabase
    .from("workouts")
    .insert(insert)
    .select("*")
    .single();
  if (error) throw error;

  if (options.routineId) {
    const { data: routineExercises, error: routineError } = await supabase
      .from("routine_exercises")
      .select("exercise_id, order_index")
      .eq("routine_id", options.routineId)
      .order("order_index");
    if (routineError) throw routineError;

    if (routineExercises.length > 0) {
      const rows = routineExercises.map((re) => ({
        workout_id: workout.id,
        exercise_id: re.exercise_id,
        order_index: re.order_index,
      }));
      const { error: insertError } = await supabase.from("workout_exercises").insert(rows);
      if (insertError) throw insertError;
    }
  }

  return workout;
}

export async function getWorkout(workoutId: string): Promise<WorkoutWithExercises> {
  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_exercises(*, exercise:exercises(*), sets(*))")
    .eq("id", workoutId)
    .order("order_index", { referencedTable: "workout_exercises" })
    .single();
  if (error) throw error;
  return data as unknown as WorkoutWithExercises;
}

export async function listWorkoutHistory(userId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  orderIndex: number
) {
  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({ workout_id: workoutId, exercise_id: exerciseId, order_index: orderIndex })
    .select("*, exercise:exercises(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function logSet(workoutExerciseId: string, set: Omit<SetInsert, "workout_exercise_id">) {
  const { data, error } = await supabase
    .from("sets")
    .insert({ workout_exercise_id: workoutExerciseId, ...set })
    .select("*")
    .single();
  if (error) throw error;
  return data as SetRow;
}

export async function updateSet(setId: string, patch: SetUpdate) {
  const { data, error } = await supabase
    .from("sets")
    .update(patch)
    .eq("id", setId)
    .select("*")
    .single();
  if (error) throw error;
  return data as SetRow;
}

export async function deleteSet(setId: string) {
  const { error } = await supabase.from("sets").delete().eq("id", setId);
  if (error) throw error;
}

export async function finishWorkout(workoutId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", workoutId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
