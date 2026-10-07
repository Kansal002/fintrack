"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, getErrorMessage } from "@/lib/api";
import { loginSchema, type LoginValues } from "./schemas";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useMutation({ mutationFn: api.auth.logIn });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => login.mutate(values))}
      className="flex flex-col gap-4"
    >
      {login.isError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {getErrorMessage(login.error)}
        </div>
      )}
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
      <Field label="Password" error={errors.password?.message}>
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
        )}
      </Field>
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        loading={login.isPending}
        className="mt-1 w-full"
      >
        Log in
      </Button>
    </form>
  );
}
