import { Image, View } from "react-native";

import { useProgressPhotoUrl } from "@/features/metrics/hooks";

export function ProgressPhotoThumbnail({ path }: { path: string }) {
  const { data: url } = useProgressPhotoUrl(path);

  if (!url) {
    return <View className="h-20 w-20 border border-border bg-ground-raised" />;
  }

  return <Image source={{ uri: url }} className="h-20 w-20 border border-border" resizeMode="cover" />;
}
