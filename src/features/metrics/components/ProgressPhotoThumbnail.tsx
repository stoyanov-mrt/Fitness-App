import { Image, View } from "react-native";

import { useProgressPhotoUrl } from "@/features/metrics/hooks";

type ProgressPhotoThumbnailProps = {
  path: string;
  /** "small" (default) for the compact list, "large" for the photos modal. */
  size?: "small" | "large";
};

const SIZE_CLASSES = {
  small: "h-20 w-20",
  large: "h-64 w-full",
};

export function ProgressPhotoThumbnail({ path, size = "small" }: ProgressPhotoThumbnailProps) {
  const { data: url } = useProgressPhotoUrl(path);
  const sizeClassName = SIZE_CLASSES[size];

  if (!url) {
    return <View className={`${sizeClassName} border border-border bg-ground-raised`} />;
  }

  return (
    <Image source={{ uri: url }} className={`${sizeClassName} border border-border`} resizeMode="cover" />
  );
}
