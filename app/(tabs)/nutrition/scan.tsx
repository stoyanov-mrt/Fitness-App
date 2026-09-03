import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/features/auth/hooks";
import { useAddMealItem, useBarcodeLookup } from "@/features/nutrition/hooks";
import type { Food } from "@/features/nutrition/types";

function todayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

export default function ScanScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const date = todayDateString();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [foundFood, setFoundFood] = useState<Food | null | undefined>(undefined);

  const barcodeLookup = useBarcodeLookup();
  const addMealItem = useAddMealItem(userId, date);

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    barcodeLookup.mutate(data, {
      onSuccess: (food) => setFoundFood(food),
      onError: () => setFoundFood(null),
    });
  };

  const rescan = () => {
    setScanned(false);
    setFoundFood(undefined);
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-ground">
        <ThemedText variant="body" className="text-ink-dim">
          Loading...
        </ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-ground px-8">
        <ThemedText variant="body" className="text-center text-base text-ink-dim">
          Camera access is needed to scan barcodes.
        </ThemedText>
        <Button label="Grant Camera Access" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {!scanned ? (
        <CameraView
          className="flex-1"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={onBarcodeScanned}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-4 bg-ground px-8">
          {barcodeLookup.isPending ? (
            <ThemedText variant="body" className="text-ink-dim">
              Looking up...
            </ThemedText>
          ) : foundFood ? (
            <>
              <ThemedText variant="display" className="text-xl text-ink">
                {foundFood.name}
              </ThemedText>
              <ThemedText variant="body" className="text-sm text-ink-dim">
                {foundFood.calories} kcal per {foundFood.serving_size}
                {foundFood.serving_unit}
              </ThemedText>
              <Button
                label="Add to Diary"
                loading={addMealItem.isPending}
                onPress={() =>
                  addMealItem.mutate(
                    { mealType: "snack", food: foundFood, quantity: 1 },
                    { onSuccess: () => router.replace("/nutrition") }
                  )
                }
              />
              <Button label="Scan Another" variant="secondary" onPress={rescan} />
            </>
          ) : (
            <>
              <ThemedText variant="body" className="text-center text-base text-ink-dim">
                Couldn&apos;t find that product.
              </ThemedText>
              <Button label="Try Again" onPress={rescan} />
            </>
          )}
        </View>
      )}
    </View>
  );
}
