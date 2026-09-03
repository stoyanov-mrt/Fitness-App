import { supabase } from "@/lib/supabase";

import type { BodyMetric, Measurements } from "./types";

const PROGRESS_PHOTOS_BUCKET = "progress-photos";

export async function listBodyMetrics(userId: string, limit = 90) {
  // Order descending + limit to actually get the most recent `limit`
  // entries (an ascending order+limit would return the user's *oldest*
  // ones instead once they have more than `limit` total), then reverse
  // back to ascending — every caller (the weight trend chart, the
  // dashboard's recent-trend widget) expects oldest-of-the-window first.
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as BodyMetric[]).reverse();
}

export async function getLatestBodyMetric(userId: string) {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as BodyMetric | null;
}

/** One row per user/date — logging again on the same day updates it. */
export async function upsertBodyMetric(
  userId: string,
  date: string,
  patch: { weightKg?: number; measurements?: Measurements }
) {
  const { data, error } = await supabase
    .from("body_metrics")
    .upsert(
      {
        user_id: userId,
        date,
        ...(patch.weightKg !== undefined ? { weight_kg: patch.weightKg } : {}),
        ...(patch.measurements !== undefined ? { measurements: patch.measurements } : {}),
      },
      { onConflict: "user_id,date" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as BodyMetric;
}

/** Uploads a local image URI to the private progress-photos bucket and
 * appends its path to that day's body_metrics row (creating the row if
 * today has no entry yet). */
export async function uploadProgressPhoto(userId: string, date: string, localUri: string) {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${userId}/${date}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg" });
  if (uploadError) throw uploadError;

  const existing = await supabase
    .from("body_metrics")
    .select("photo_urls")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const photoUrls = [...(existing.data?.photo_urls ?? []), path];

  const { data, error } = await supabase
    .from("body_metrics")
    .upsert({ user_id: userId, date, photo_urls: photoUrls }, { onConflict: "user_id,date" })
    .select("*")
    .single();
  if (error) throw error;
  return data as BodyMetric;
}

/** Deletes a progress photo from Storage and drops its path from that
 * day's body_metrics row. */
export async function removeProgressPhoto(userId: string, date: string, path: string) {
  const { error: removeError } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .remove([path]);
  if (removeError) throw removeError;

  const existing = await supabase
    .from("body_metrics")
    .select("photo_urls")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (existing.error) throw existing.error;

  const photoUrls = (existing.data?.photo_urls ?? []).filter((p) => p !== path);

  const { data, error } = await supabase
    .from("body_metrics")
    .update({ photo_urls: photoUrls })
    .eq("user_id", userId)
    .eq("date", date)
    .select("*")
    .single();
  if (error) throw error;
  return data as BodyMetric;
}

/** Progress photos live in a private bucket — reading one back needs a
 * short-lived signed URL, not a public URL. */
export async function getProgressPhotoUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
