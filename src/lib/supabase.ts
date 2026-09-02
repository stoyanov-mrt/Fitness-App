import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Non-fatal at import time: lets the app boot (and the QA gate inspect
  // screens) before a Supabase project is wired up. Any actual call through
  // this client will fail loudly once auth/data features start using it.
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set — " +
      "Supabase calls will fail until supabase/.env is configured."
  );
}

// Expo Router's web build renders each route once on the server (Node) as
// well as in the browser. AsyncStorage — and session persistence/refresh in
// general — only make sense in the browser; on the server they reach for
// `window`/`document` and crash the render. Guard on that, not on platform,
// since the *same* web bundle runs in both places.
const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      storage: isBrowser ? AsyncStorage : undefined,
      autoRefreshToken: isBrowser,
      persistSession: isBrowser,
      detectSessionInUrl: false,
    },
  }
);
