"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, getErrorMessage } from "@/lib/api";
import { signupSchema, type SignupValues } from "./schemas";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signup = useMutation({
    mutationFn: ({ name, email, password }: SignupValues) =>
      api.auth.signUp({ name, email, password }),
    onSuccess: (user) => toast.success(`Welcome to FinTrack, ${user.name.split(" ")[0]}!`),
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => signup.mutate(values))}
      className="flex flex-col gap-4"
    >
      {signup.isError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {getErrorMessage(signup.error)}
        </div>
      )}
      <Field label="Full name" error={errors.name?.message}>
        {(control) => (
          <Input {...control} autoComplete="name" placeholder="Priya Patel" {...register("name")} />
        )}
      </Field>
      <Field label="Email" error={errors.email?.message}>
        {(control) => (
          <Input
            {...control}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
        )}
      </Field>
      <Field
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters, with a letter and a number."
      >
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        )}
      </Field>
      <Field label="Confirm password" error={errors.confirmPassword?.message}>
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        )}
      </Field>
      <Button type="submit" size="lg" loading={signup.isPending} className="mt-1 w-full">
        Create account
      </Button>
    </form>
  );
}
