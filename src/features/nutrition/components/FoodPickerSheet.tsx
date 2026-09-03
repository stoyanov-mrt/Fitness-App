import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import {
  useAddMealItem,
  useCreateCustomFood,
  useFoodSearch,
  useLogSavedMeal,
  useSavedMeals,
} from "@/features/nutrition/hooks";
import {
  customFoodSchema,
  type CustomFoodFormInput,
  type CustomFoodFormValues,
} from "@/features/nutrition/schemas";
import type { Food, MealType } from "@/features/nutrition/types";
import { useDesignTheme } from "@/theme/useDesignTheme";

type FoodPickerSheetProps = {
  visible: boolean;
  userId: string | undefined;
  date: string;
  mealType: MealType;
  onClose: () => void;
};

type Step = "search" | "quantity" | "custom" | "saved";

const customFoodDefaults: CustomFoodFormInput = {
  name: "",
  calories: "",
  proteinG: "",
  carbsG: "",
  fatG: "",
};

export function FoodPickerSheet({ visible, userId, date, mealType, onClose }: FoodPickerSheetProps) {
  const { tokens } = useDesignTheme();
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
  const { data: savedMeals, isLoading: savedMealsLoading } = useSavedMeals(userId);
  const logSavedMeal = useLogSavedMeal(userId, date);

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
      <View className="flex-1 bg-ground pt-16">
        <View className="flex-row items-center justify-between px-4 pb-3">
          <ThemedText variant="display" className="text-xl capitalize text-ink">
            Add to {mealType}
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={close}>
            <ThemedText variant="bodyMedium" className="text-base text-ink-dim">
              Close
            </ThemedText>
          </Pressable>
        </View>

        {step === "search" ? (
          <>
            <TextInput
              className="mx-4 mb-3 border border-border bg-ground-raised px-3 py-2.5 text-base text-ink"
              style={{ fontFamily: tokens.fonts.body }}
              placeholder="Search foods..."
              placeholderTextColor={tokens.swatch.inkDim}
              autoCapitalize="none"
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search foods"
              testID="Search foods"
            />
            {isLoading ? (
              <ThemedText variant="body" className="px-4 text-ink-dim">
                Loading...
              </ThemedText>
            ) : (
              <FlatList
                data={foods ?? []}
                keyExtractor={(item) => item.id}
                contentContainerClassName="px-4 pb-4"
                ListEmptyComponent={
                  <ThemedText variant="body" className="px-1 py-4 text-ink-dim">
                    No foods found.
                  </ThemedText>
                }
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedFood(item);
                      setStep("quantity");
                    }}
                    className="border-b border-border py-3"
                  >
                    <ThemedText variant="bodyMedium" className="text-base text-ink">
                      {item.name}
                    </ThemedText>
                    <ThemedText variant="body" className="text-sm text-ink-dim">
                      {item.calories} kcal · {item.protein_g}g protein per {item.serving_size}
                      {item.serving_unit}
                    </ThemedText>
                  </Pressable>
                )}
              />
            )}
            <View className="gap-2 border-t border-border p-4">
              <Button
                label="Use a saved meal"
                variant="secondary"
                onPress={() => setStep("saved")}
              />
              <Button
                label="Can't find it? Add a custom food"
                variant="secondary"
                onPress={() => setStep("custom")}
              />
            </View>
          </>
        ) : null}

        {step === "saved" ? (
          <>
            {savedMealsLoading ? (
              <ThemedText variant="body" className="px-4 text-ink-dim">
                Loading...
              </ThemedText>
            ) : (
              <FlatList
                data={savedMeals ?? []}
                keyExtractor={(item) => item.id}
                contentContainerClassName="px-4 pb-4"
                ListEmptyComponent={
                  <ThemedText variant="body" className="px-1 py-4 text-ink-dim">
                    No saved meals yet — save one from the diary after logging it.
                  </ThemedText>
                }
                renderItem={({ item }) => {
                  const totalCalories = item.saved_meal_items.reduce(
                    (sum, mealItem) => sum + mealItem.quantity * mealItem.food.calories,
                    0
                  );
                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={logSavedMeal.isPending}
                      onPress={() =>
                        logSavedMeal.mutate({ mealType, savedMealId: item.id }, { onSuccess: close })
                      }
                      className="border-b border-border py-3"
                    >
                      <ThemedText variant="bodyMedium" className="text-base text-ink">
                        {item.name}
                      </ThemedText>
                      <ThemedText variant="body" className="text-sm text-ink-dim">
                        {item.saved_meal_items.length} item
                        {item.saved_meal_items.length === 1 ? "" : "s"} · {Math.round(totalCalories)}{" "}
                        kcal
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            )}
            {logSavedMeal.isError ? (
              <ThemedText variant="body" className="px-4 text-sm text-accent">
                Couldn&apos;t log that meal.
              </ThemedText>
            ) : null}
            <View className="border-t border-border p-4">
              <Button label="Back to search" variant="secondary" onPress={() => setStep("search")} />
            </View>
          </>
        ) : null}

        {step === "quantity" && selectedFood ? (
          <View className="gap-4 px-4">
            <ThemedText variant="display" className="text-lg text-ink">
              {selectedFood.name}
            </ThemedText>
            <ThemedText variant="body" className="text-sm text-ink-dim">
              {selectedFood.calories} kcal · {selectedFood.protein_g}g protein ·{" "}
              {selectedFood.carbs_g}g carbs · {selectedFood.fat_g}g fat per{" "}
              {selectedFood.serving_size}
              {selectedFood.serving_unit}
            </ThemedText>
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
          <ScrollView contentContainerClassName="gap-4 px-4 pb-8" keyboardShouldPersistTaps="handled">
            <ThemedText variant="body" className="text-sm text-ink-dim">
              Values are per 100 g / 100 ml.
            </ThemedText>
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
              <ThemedText variant="body" className="text-sm text-accent">
                Couldn&apos;t save this food.
              </ThemedText>
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
