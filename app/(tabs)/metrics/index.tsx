import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useSession } from "@/features/auth/hooks";
import { ProgressPhotoThumbnail } from "@/features/metrics/components/ProgressPhotoThumbnail";
import { WeightChart } from "@/features/metrics/components/WeightChart";
import { useBodyMetrics, useLatestBodyMetric, useLogBodyMetric, useUploadProgressPhoto } from "@/features/metrics/hooks";
import {
  logBodyMetricSchema,
  type LogBodyMetricFormInput,
  type LogBodyMetricFormValues,
} from "@/features/metrics/schemas";

function todayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

const formDefaults: LogBodyMetricFormInput = {
  weightKg: "",
  waistCm: "",
  chestCm: "",
  armCm: "",
};

export default function MetricsScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const date = todayDateString();

  const { data: metrics } = useBodyMetrics(userId);
  const { data: latest } = useLatestBodyMetric(userId);
  const logMetric = useLogBodyMetric(userId);
  const uploadPhoto = useUploadProgressPhoto(userId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogBodyMetricFormInput, unknown, LogBodyMetricFormValues>({
    resolver: zodResolver(logBodyMetricSchema),
    defaultValues: formDefaults,
  });

  const todayEntry = metrics?.find((m) => m.date === date);

  const onSave = handleSubmit((values) => {
    const measurements: Record<string, number> = {};
    if (values.waistCm !== undefined) measurements.waist_cm = values.waistCm;
    if (values.chestCm !== undefined) measurements.chest_cm = values.chestCm;
    if (values.armCm !== undefined) measurements.arm_cm = values.armCm;

    logMetric.mutate(
      {
        date,
        weightKg: values.weightKg,
        measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
      },
      { onSuccess: () => reset(formDefaults) }
    );
  });

  const onAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    uploadPhoto.mutate({ date, localUri: result.assets[0].uri });
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
        Body Metrics
      </Text>

      <View className="gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Weight Trend
          </Text>
          {latest?.weight_kg != null ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Latest: {latest.weight_kg} kg
            </Text>
          ) : null}
        </View>
        <WeightChart metrics={metrics ?? []} />
      </View>

      <View className="gap-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Log Today
        </Text>
        <Controller
          control={control}
          name="weightKg"
          render={({ field }) => (
            <TextField
              label="Weight (kg)"
              keyboardType="numeric"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.weightKg?.message}
            />
          )}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="waistCm"
              render={({ field }) => (
                <TextField
                  label="Waist (cm)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.waistCm?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="chestCm"
              render={({ field }) => (
                <TextField
                  label="Chest (cm)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.chestCm?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="armCm"
              render={({ field }) => (
                <TextField
                  label="Arm (cm)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.armCm?.message}
                />
              )}
            />
          </View>
        </View>
        {logMetric.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            Couldn&apos;t save — please try again.
          </Text>
        ) : null}
        <Button label="Save" onPress={onSave} loading={logMetric.isPending} />

        {todayEntry?.photo_urls && todayEntry.photo_urls.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {todayEntry.photo_urls.map((path) => (
              <ProgressPhotoThumbnail key={path} path={path} />
            ))}
          </View>
        ) : null}
        {uploadPhoto.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            Couldn&apos;t upload that photo — please try again.
          </Text>
        ) : null}
        <Button
          label="+ Add Progress Photo"
          variant="secondary"
          onPress={onAddPhoto}
          loading={uploadPhoto.isPending}
        />
      </View>
    </ScrollView>
  );
}
