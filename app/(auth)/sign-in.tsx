import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { TextField } from "@/components/TextField";
import { useSignIn } from "@/features/auth/hooks";
import { emailPasswordSchema, type EmailPasswordFormValues } from "@/features/auth/schemas";

export default function SignInScreen() {
  const signIn = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPasswordFormValues>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    signIn.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  return (
    <ScrollView
      className="flex-1 bg-ground"
      contentContainerClassName="flex-1 justify-center gap-6 px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <ThemedText variant="display" className="text-3xl text-ink">
          Welcome back
        </ThemedText>
        <ThemedText variant="body" className="text-base text-ink-dim">
          Sign in to keep tracking your workouts and nutrition.
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
              autoComplete="password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />
        {signIn.isError ? (
          <ThemedText variant="body" className="text-sm text-accent">
            {signIn.error instanceof Error ? signIn.error.message : "Sign in failed"}
          </ThemedText>
        ) : null}
      </View>

      <Button label="Sign In" onPress={onSubmit} loading={signIn.isPending} />

      <Link href="/sign-up" className="text-center text-sm text-ink-dim">
        Don&apos;t have an account?{" "}
        <ThemedText variant="bodyMedium" className="text-ink">
          Sign up
        </ThemedText>
      </Link>
    </ScrollView>
  );
}
