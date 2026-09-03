import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useRemoveProgressPhoto } from "@/features/metrics/hooks";

import { ProgressPhotoThumbnail } from "./ProgressPhotoThumbnail";

type ProgressPhotosModalProps = {
  visible: boolean;
  userId: string | undefined;
  date: string;
  photoUrls: string[];
  onClose: () => void;
};

// Photos are hidden by default on the Metrics screen (a "View Progress
// Photos" button opens this instead of them rendering inline) — they're
// the most sensitive thing this app stores, worth a deliberate tap to see
// rather than showing automatically every time the screen opens.
export function ProgressPhotosModal({
  visible,
  userId,
  date,
  photoUrls,
  onClose,
}: ProgressPhotosModalProps) {
  const removePhoto = useRemoveProgressPhoto(userId);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-ground pt-16">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <ThemedText variant="display" className="text-xl text-ink">
            Progress Photos
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText variant="bodyMedium" className="text-base text-ink-dim">
              Close
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
          {photoUrls.length === 0 ? (
            <ThemedText variant="body" className="text-sm text-ink-dim">
              No photos for this day.
            </ThemedText>
          ) : (
            photoUrls.map((path) => (
              <View key={path} className="gap-2 border border-border bg-ground-raised p-2">
                <ProgressPhotoThumbnail path={path} size="large" />
                <Button
                  label="Remove"
                  variant="secondary"
                  // One mutation instance for the whole list — scope the
                  // loading state to the specific photo being removed,
                  // rather than every "Remove" button spinning together.
                  loading={removePhoto.isPending && removePhoto.variables?.path === path}
                  onPress={() => removePhoto.mutate({ date, path })}
                />
              </View>
            ))
          )}
          {removePhoto.isError ? (
            <ThemedText variant="body" className="text-sm text-accent">
              Couldn&apos;t remove that photo.
            </ThemedText>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
