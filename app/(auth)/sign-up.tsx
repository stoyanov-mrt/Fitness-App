import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useSignUp } from "@/features/auth/hooks";
import { signUpSchema, type SignUpFormValues } from "@/features/auth/signUpSchema";

export default function SignUpScreen() {
  const signUp = useSignUp();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit((values) => {
    signUp.mutate(values, {
      onSuccess: (session) => {
        // Supabase's default project config requires confirming the signup
        // email before a session is issued — signUp() then succeeds but
        // returns no session. Navigating to /welcome in that case just gets
        // silently bounced back here by the route guard (no session), so
        // show the user what's actually happening instead.
        if (session) {
          router.replace("/welcome");
        } else {
          setNeedsEmailConfirmation(true);
        }
      },
    });
  });

  if (needsEmailConfirmation) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-white px-8 dark:bg-neutral-950">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Check your email
        </Text>
        <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
          We sent a confirmation link to your email address. Confirm it, then sign in to finish
          setting up your account.
        </Text>
        <Link href="/sign-in" className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Back to sign in
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="flex-1 justify-center gap-6 px-6 py-12"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Create your account
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Track your workouts and nutrition in one place.
        </Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="Password"
              secureTextEntry
              autoComplete="new-password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <TextField
              label="Confirm Password"
              secureTextEntry
              autoComplete="new-password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        {signUp.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {signUp.error instanceof Error ? signUp.error.message : "Sign up failed"}
          </Text>
        ) : null}
      </View>

      <Button label="Sign Up" onPress={onSubmit} loading={signUp.isPending} />

      <Link href="/sign-in" className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account? <Text className="font-semibold">Sign in</Text>
      </Link>
    </ScrollView>
  );
}
