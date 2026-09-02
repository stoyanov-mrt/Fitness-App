import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
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
      className="flex-1 bg-white dark:bg-neutral-950"
      contentContainerClassName="flex-1 justify-center gap-6 px-6 py-12"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Welcome back
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Sign in to keep tracking your workouts and nutrition.
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
              autoComplete="password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />
        {signIn.isError ? (
          <Text className="text-sm text-red-600 dark:text-red-400">
            {signIn.error instanceof Error ? signIn.error.message : "Sign in failed"}
          </Text>
        ) : null}
      </View>

      <Button label="Sign In" onPress={onSubmit} loading={signIn.isPending} />

      <Link href="/sign-up" className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Don&apos;t have an account? <Text className="font-semibold">Sign up</Text>
      </Link>
    </ScrollView>
  );
}
