import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
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
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text className="text-neutral-500 dark:text-neutral-400">Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white px-8 dark:bg-neutral-950">
        <Text className="text-center text-base text-neutral-700 dark:text-neutral-300">
          Camera access is needed to scan barcodes.
        </Text>
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
        <View className="flex-1 items-center justify-center gap-4 bg-white px-8 dark:bg-neutral-950">
          {barcodeLookup.isPending ? (
            <Text className="text-neutral-500 dark:text-neutral-400">Looking up...</Text>
          ) : foundFood ? (
            <>
              <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                {foundFood.name}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                {foundFood.calories} kcal per {foundFood.serving_size}
                {foundFood.serving_unit}
              </Text>
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
              <Text className="text-center text-base text-neutral-700 dark:text-neutral-300">
                Couldn&apos;t find that product.
              </Text>
              <Button label="Try Again" onPress={rescan} />
            </>
          )}
        </View>
      )}
    </View>
  );
}
