/**
 * One-off import: transforms free-exercise-db (public domain,
 * https://github.com/yuhonas/free-exercise-db, snapshotted at
 * supabase/seed/free-exercise-db.json) into this app's `exercises` schema
 * and upserts it into the live Supabase project.
 *
 * Not shipped in the app bundle — run manually, from the repo root:
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_... \
 *   npx tsx supabase/seed/import-exercises.ts
 *
 * Requires the project's *secret* key (Project Settings -> API), not the
 * anon key — seeding bypasses RLS on purpose (these rows have
 * is_custom = false, which no ordinary user is allowed to insert). Never
 * put the secret key in .env.local or anywhere the app itself reads from.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

type RawExercise = {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  instructions: string[];
  images: string[];
};

type ExerciseRow = {
  slug: string;
  name: string;
  category: "strength" | "cardio" | "mobility";
  primary_muscle: string | null;
  secondary_muscles: string[];
  equipment: string | null;
  instructions: string | null;
  image_urls: string[];
  is_custom: false;
};

// free-exercise-db's categories don't map 1:1 onto our simpler
// strength/cardio/mobility split — fold them down.
const CATEGORY_MAP: Record<string, ExerciseRow["category"]> = {
  strength: "strength",
  powerlifting: "strength",
  strongman: "strength",
  "olympic weightlifting": "strength",
  cardio: "cardio",
  plyometrics: "cardio",
  stretching: "mobility",
};

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

function toRow(raw: RawExercise): ExerciseRow {
  const category = CATEGORY_MAP[raw.category];
  if (!category) {
    throw new Error(`Unmapped category "${raw.category}" for exercise "${raw.id}"`);
  }

  const [primaryMuscle, ...extraPrimaryMuscles] = raw.primaryMuscles;

  return {
    slug: raw.id.toLowerCase(),
    name: raw.name,
    category,
    primary_muscle: primaryMuscle ?? null,
    secondary_muscles: [...extraPrimaryMuscles, ...raw.secondaryMuscles],
    equipment: raw.equipment,
    instructions: raw.instructions.length > 0 ? raw.instructions.join("\n") : null,
    image_urls: raw.images.map((image) => `${IMAGE_BASE_URL}/${image}`),
    is_custom: false,
  };
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY environment variables.");
  }

  const dataPath = path.join(__dirname, "free-exercise-db.json");
  const raw: RawExercise[] = JSON.parse(readFileSync(dataPath, "utf-8"));
  const rows = raw.map(toRow);

  console.log(`Importing ${rows.length} exercises...`);

  const supabase = createClient(supabaseUrl, secretKey);

  const BATCH_SIZE = 200;
  let imported = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("exercises").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
    imported += batch.length;
    console.log(`  ${imported}/${rows.length}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
