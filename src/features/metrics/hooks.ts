import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getLatestBodyMetric,
  getProgressPhotoUrl,
  listBodyMetrics,
  upsertBodyMetric,
  uploadProgressPhoto,
} from "./api";
import type { Measurements } from "./types";

function metricsQueryKey(userId: string | undefined) {
  return ["body-metrics", userId] as const;
}

export function useBodyMetrics(userId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: [...metricsQueryKey(userId), limit ?? "default"],
    queryFn: () => listBodyMetrics(userId as string, limit),
    enabled: !!userId,
  });
}

export function useLatestBodyMetric(userId: string | undefined) {
  return useQuery({
    queryKey: ["body-metrics-latest", userId],
    queryFn: () => getLatestBodyMetric(userId as string),
    enabled: !!userId,
  });
}

export function useLogBodyMetric(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      weightKg,
      measurements,
    }: {
      date: string;
      weightKg?: number;
      measurements?: Measurements;
    }) => upsertBodyMetric(userId as string, date, { weightKg, measurements }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: metricsQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: ["body-metrics-latest", userId] });
    },
  });
}

export function useUploadProgressPhoto(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, localUri }: { date: string; localUri: string }) =>
      uploadProgressPhoto(userId as string, date, localUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: metricsQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: ["body-metrics-latest", userId] });
    },
  });
}

export function useProgressPhotoUrl(path: string | undefined) {
  return useQuery({
    queryKey: ["progress-photo-url", path],
    queryFn: () => getProgressPhotoUrl(path as string),
    enabled: !!path,
    staleTime: 30 * 60 * 1000, // signed URLs are valid for 1h; refetch well before that
  });
}
