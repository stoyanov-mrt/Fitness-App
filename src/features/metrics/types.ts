import type { Database } from "@/types/database";

export type BodyMetric = Database["public"]["Tables"]["body_metrics"]["Row"];

// Free-form on purpose (jsonb column) — the UI only exposes a handful of
// preset keys for now, but nothing stops richer data being stored later.
export type Measurements = Record<string, number>;
