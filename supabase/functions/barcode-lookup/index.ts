// Barcode -> food lookup. Called from the app (src/features/nutrition/api.ts
// lookupBarcode) only after the client has already checked for a local
// `foods` row with this barcode and found none.
//
// Queries Open Food Facts (free, public, no API key) for the product, and —
// if it has the four macros we need — upserts it into `foods` using the
// service role (bypassing RLS the same way the seed scripts do, since a
// barcode-resolved food is effectively new reference data, not user data)
// so every user benefits from the lookup, not just whoever scanned first.
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OpenFoodFactsProduct = {
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, number>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    if (!barcode || typeof barcode !== "string") {
      return new Response(JSON.stringify({ error: "barcode is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offResponse = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`);
    const offData = await offResponse.json();

    if (offData.status !== 1 || !offData.product) {
      return new Response(JSON.stringify({ food: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product: OpenFoodFactsProduct = offData.product;
    const nutriments = product.nutriments ?? {};
    const calories = nutriments["energy-kcal_100g"];
    const protein = nutriments["proteins_100g"];
    const carbs = nutriments["carbohydrates_100g"];
    const fat = nutriments["fat_100g"];

    // Same rule as the seed scripts: don't guess/zero-fill missing macros.
    if (
      typeof calories !== "number" ||
      typeof protein !== "number" ||
      typeof carbs !== "number" ||
      typeof fat !== "number" ||
      !product.product_name
    ) {
      return new Response(JSON.stringify({ food: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: food, error } = await supabase
      .from("foods")
      .upsert(
        {
          barcode,
          name: product.product_name,
          brand: product.brands ?? null,
          serving_size: 100,
          serving_unit: "g",
          calories,
          protein_g: protein,
          carbs_g: carbs,
          fat_g: fat,
          is_custom: false,
        },
        { onConflict: "barcode" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ food }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
