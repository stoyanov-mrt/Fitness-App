import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAddMealItem, useCreateCustomFood, useFoodSearch } from "@/features/nutrition/hooks";
import {
  customFoodSchema,
  type CustomFoodFormInput,
  type CustomFoodFormValues,
} from "@/features/nutrition/schemas";
import type { Food, MealType } from "@/features/nutrition/types";

type FoodPickerSheetProps = {
  visible: boolean;
  userId: string | undefined;
  date: string;
  mealType: MealType;
  onClose: () => void;
};

type Step = "search" | "quantity" | "custom";

const customFoodDefaults: CustomFoodFormInput = {
  name: "",
  calories: "",
  proteinG: "",
  carbsG: "",
  fatG: "",
};

export function FoodPickerSheet({ visible, userId, date, mealType, onClose }: FoodPickerSheetProps) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");

  const {
    control,
    handleSubmit,
    reset: resetCustomForm,
    formState: { errors },
  } = useForm<CustomFoodFormInput, unknown, CustomFoodFormValues>({
    resolver: zodResolver(customFoodSchema),
    defaultValues: customFoodDefaults,
  });

  const { data: foods, isLoading } = useFoodSearch(query);
  const addMealItem = useAddMealItem(userId, date);
  const createCustomFood = useCreateCustomFood(userId);

  const reset = () => {
    setStep("search");
    setQuery("");
    setSelectedFood(null);
    setQuantity("1");
    resetCustomForm(customFoodDefaults);
  };

  const close = () => {
    reset();
    onClose();
  };

  const onAdd = () => {
    if (!selectedFood) return;
    const quantityValue = Number(quantity);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) return;
    addMealItem.mutate({ mealType, food: selectedFood, quantity: quantityValue }, { onSuccess: close });
  };

  const onCreateCustom = handleSubmit((values) => {
    createCustomFood.mutate(
      {
        name: values.name,
        serving_size: 100,
        serving_unit: "g",
        calories: values.calories,
        protein_g: values.proteinG,
        carbs_g: values.carbsG,
        fat_g: values.fatG,
      },
      {
        onSuccess: (food) => {
          setSelectedFood(food);
          setStep("quantity");
        },
      }
    );
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View className="flex-1 bg-white pt-16 dark:bg-neutral-950">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <Text className="text-xl font-bold capitalize text-neutral-900 dark:text-neutral-50">
            Add to {mealType}
          </Text>
          <Pressable accessibilityRole="button" onPress={close}>
            <Text className="text-base font-medium text-neutral-500 dark:text-neutral-400">
              Close
            </Text>
          </Pressable>
        </View>

        {step === "search" ? (
          <>
            <TextInput
              className="mx-4 mb-3 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
              placeholder="Search foods..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              value={query}
              onChangeText={setQuery}
            />
            {isLoading ? (
              <Text className="px-4 text-neutral-500 dark:text-neutral-400">Loading...</Text>
            ) : (
              <FlatList
                data={foods ?? []}
                keyExtractor={(item) => item.id}
                contentContainerClassName="px-4 pb-4"
                ListEmptyComponent={
                  <Text className="px-1 py-4 text-neutral-500 dark:text-neutral-400">
                    No foods found.
                  </Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedFood(item);
                      setStep("quantity");
                    }}
                    className="border-b border-neutral-100 py-3 dark:border-neutral-900"
                  >
                    <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                      {item.calories} kcal · {item.protein_g}g protein per {item.serving_size}
                      {item.serving_unit}
                    </Text>
                  </Pressable>
                )}
              />
            )}
            <View className="border-t border-neutral-100 p-4 dark:border-neutral-900">
              <Button
                label="Can't find it? Add a custom food"
                variant="secondary"
                onPress={() => setStep("custom")}
              />
            </View>
          </>
        ) : null}

        {step === "quantity" && selectedFood ? (
          <View className="gap-4 px-4">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {selectedFood.name}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {selectedFood.calories} kcal · {selectedFood.protein_g}g protein ·{" "}
              {selectedFood.carbs_g}g carbs · {selectedFood.fat_g}g fat per{" "}
              {selectedFood.serving_size}
              {selectedFood.serving_unit}
            </Text>
            <TextField
              label="Servings"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <Button label="Add to diary" onPress={onAdd} loading={addMealItem.isPending} />
            <Button
              label="Back to search"
              variant="secondary"
              onPress={() => {
                setSelectedFood(null);
                setStep("search");
              }}
            />
          </View>
        ) : null}

        {step === "custom" ? (
          <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Values are per 100 g / 100 ml.
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  label="Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="calories"
              render={({ field }) => (
                <TextField
                  label="Calories"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.calories?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="proteinG"
              render={({ field }) => (
                <TextField
                  label="Protein (g)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.proteinG?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="carbsG"
              render={({ field }) => (
                <TextField
                  label="Carbs (g)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.carbsG?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="fatG"
              render={({ field }) => (
                <TextField
                  label="Fat (g)"
                  keyboardType="numeric"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.fatG?.message}
                />
              )}
            />
            {createCustomFood.isError ? (
              <Text className="text-sm text-red-600 dark:text-red-400">
                Couldn&apos;t save this food.
              </Text>
            ) : null}
            <Button
              label="Save & continue"
              onPress={onCreateCustom}
              loading={createCustomFood.isPending}
            />
            <Button label="Back to search" variant="secondary" onPress={() => setStep("search")} />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}
