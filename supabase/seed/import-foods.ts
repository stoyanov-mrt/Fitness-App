/**
 * One-off import: transforms two USDA FoodData Central datasets (public
 * domain, https://fdc.nal.usda.gov) into this app's `foods` schema and
 * upserts them into the live Supabase project:
 *
 *   - Foundation Foods (supabase/seed/usda-foundation-foods.json) — whole/
 *     minimally-processed foods with analytically-measured nutrients.
 *   - SR Legacy (supabase/seed/usda-sr-legacy-foods.json) — the classic,
 *     much broader USDA reference set; this is what gives the library
 *     real coverage of common everyday foods. At ~200 MB uncompressed this
 *     one isn't committed (see .gitignore) — download it first:
 *       curl -L -o /tmp/sr_legacy.zip \
 *         https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2021-10-28.zip
 *       unzip -o /tmp/sr_legacy.zip -d /tmp/sr_legacy
 *       cp /tmp/sr_legacy/FoodData_Central_sr_legacy_food_json_2021-10-28.json \
 *         supabase/seed/usda-sr-legacy-foods.json
 *
 * Branded/packaged foods aren't seeded here on purpose — those are expected
 * to come from barcode scans (Open Food Facts, via an Edge Function) and
 * get upserted into the same table at that point instead.
 *
 * Not shipped in the app bundle — run manually, from the repo root:
 *
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_... \
 *   npx tsx supabase/seed/import-foods.ts
 *
 * Requires the project's *secret* key (Project Settings -> API), not the
 * anon key — seeding bypasses RLS on purpose (is_custom = false, which no
 * ordinary user is allowed to insert). Never put the secret key in
 * .env.local or anywhere the app itself reads from.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

// USDA's standard nutrient IDs (foodNutrients[].nutrient.id) for the four
// macros this app tracks. Amounts in both datasets are per 100 g.
const NUTRIENT_ID = {
  energyKcal: 1008,
  proteinG: 1003,
  fatG: 1004,
  carbsG: 1005,
} as const;

const DATASETS = [
  { file: "usda-foundation-foods.json", key: "FoundationFoods" },
  { file: "usda-sr-legacy-foods.json", key: "SRLegacyFoods" },
] as const;

type RawNutrient = { nutrient: { id: number }; amount?: number };
type RawFood = {
  fdcId: number;
  description: string;
  foodNutrients: RawNutrient[];
};

type FoodRow = {
  fdc_id: string;
  name: string;
  serving_size: 100;
  serving_unit: "g";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_custom: false;
};

function findAmount(nutrients: RawNutrient[], nutrientId: number): number | null {
  const match = nutrients.find((n) => n.nutrient.id === nutrientId);
  return typeof match?.amount === "number" ? match.amount : null;
}

function toRow(raw: RawFood): FoodRow | null {
  const calories = findAmount(raw.foodNutrients, NUTRIENT_ID.energyKcal);
  const proteinG = findAmount(raw.foodNutrients, NUTRIENT_ID.proteinG);
  const carbsG = findAmount(raw.foodNutrients, NUTRIENT_ID.carbsG);
  const fatG = findAmount(raw.foodNutrients, NUTRIENT_ID.fatG);

  // Skip anything missing a core macro rather than guess/zero-fill it.
  if (calories == null || proteinG == null || carbsG == null || fatG == null) {
    return null;
  }

  return {
    fdc_id: String(raw.fdcId),
    name: raw.description,
    serving_size: 100,
    serving_unit: "g",
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
    is_custom: false,
  };
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY environment variables.");
  }

  const supabase = createClient(supabaseUrl, secretKey);
  const BATCH_SIZE = 200;

  for (const dataset of DATASETS) {
    const dataPath = path.join(__dirname, dataset.file);
    const raw: Record<string, RawFood[]> = JSON.parse(readFileSync(dataPath, "utf-8"));
    const foods = raw[dataset.key];
    const rows = foods.map(toRow).filter((row): row is FoodRow => row !== null);

    console.log(
      `${dataset.file}: importing ${rows.length} foods (${foods.length - rows.length} skipped for missing macros)...`
    );

    let imported = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("foods").upsert(batch, { onConflict: "fdc_id" });
      if (error) throw error;
      imported += batch.length;
      console.log(`  ${imported}/${rows.length}`);
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
