"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth/auth-provider";
import { api, getErrorMessage } from "@/lib/api";
import { SettingsSection } from "./settings-section";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be 50 characters or fewer"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileSection() {
  const user = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const save = useMutation({
    mutationFn: (values: ProfileValues) => api.auth.updateProfile({ name: values.name }),
    onSuccess: (updated) => {
      reset({ name: updated.name });
      toast.success("Profile updated");
    },
    onError: (error) =>
      toast.error("Couldn't update profile", { description: getErrorMessage(error) }),
  });

  return (
    <SettingsSection title="Profile" description="How you appear across FinTrack.">
      <form
        noValidate
        onSubmit={handleSubmit((values) => save.mutate(values))}
        className="flex flex-col gap-4"
      >
        <Field label="Display name" error={errors.name?.message}>
          {(props) => <Input {...props} autoComplete="name" {...register("name")} />}
        </Field>
        <Field
          label="Email"
          hint={
            user.isDemo
              ? "The demo account's email can't be changed."
              : "Email changes aren't supported in this demo."
          }
        >
          {(props) => <Input {...props} value={user.email} readOnly disabled />}
        </Field>
        <div>
          <Button type="submit" loading={save.isPending} disabled={!isDirty}>
            Save profile
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
