import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
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
      <View className="flex-1 items-center justify-center gap-3 bg-ground px-8">
        <ThemedText variant="displaySecondary" className="text-2xl text-ink">
          Check your email
        </ThemedText>
        <ThemedText variant="body" className="text-center text-base text-ink-dim">
          We sent a confirmation link to your email address. Confirm it, then sign in to finish
          setting up your account.
        </ThemedText>
        <Link href="/sign-in" className="mt-2 text-sm text-ink">
          <ThemedText variant="bodyMedium" className="text-ink">
            Back to sign in
          </ThemedText>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerClassName="flex-1 justify-center gap-6 px-6 py-12"
    >
      <View className="gap-1">
        <ThemedText variant="display" className="text-3xl text-ink">
          Create your account
        </ThemedText>
        <ThemedText variant="body" className="text-base text-ink-dim">
          Track your workouts and nutrition in one place.
        </ThemedText>
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
          <ThemedText variant="body" className="text-sm text-accent">
            {signUp.error instanceof Error ? signUp.error.message : "Sign up failed"}
          </ThemedText>
        ) : null}
      </View>

      <Button label="Sign Up" onPress={onSubmit} loading={signUp.isPending} />

      <Link href="/sign-in" className="text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <ThemedText variant="bodyMedium" className="text-ink">
          Sign in
        </ThemedText>
      </Link>
    </ScrollView>
  );
}
