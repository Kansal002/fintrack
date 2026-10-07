"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { categoriesFor } from "@/lib/categories";
import { todayISO } from "@/lib/dates";
import type { Transaction, TransactionInput } from "@/types";
import {
  toFormValues,
  toTransactionInput,
  transactionFormSchema,
  type TransactionFormInput,
  type TransactionFormValues,
} from "./schema";

export const TRANSACTION_FORM_ID = "transaction-form";

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (input: TransactionInput) => void;
}

export function TransactionForm({ transaction, onSubmit }: TransactionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: toFormValues(transaction),
  });

  const type = useWatch({ control, name: "type" });
  const categories = categoriesFor(type);

  return (
    <form
      id={TRANSACTION_FORM_ID}
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(toTransactionInput(values)))}
      className="grid gap-4 sm:grid-cols-2"
    >
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-sm font-medium">Type</legend>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SegmentedControl
              label="Transaction type"
              className="w-full"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                // Categories are type-specific; clear an incompatible choice.
                if (!categoriesFor(value).some((c) => c.id === getValues("category"))) {
                  setValue("category", "");
                }
              }}
              options={[
                { value: "expense", label: "Expense", icon: <ArrowUpRight aria-hidden /> },
                { value: "income", label: "Income", icon: <ArrowDownLeft aria-hidden /> },
              ]}
            />
          )}
        />
      </fieldset>

      <Field label="Amount (₹)" error={errors.amount?.message}>
        {(props) => (
          <Input
            {...props}
            inputMode="decimal"
            placeholder="0.00"
            data-autofocus
            {...register("amount")}
          />
        )}
      </Field>

      <Field label="Date" error={errors.date?.message}>
        {(props) => <Input {...props} type="date" max={todayISO()} {...register("date")} />}
      </Field>

      <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
        {(props) => (
          <Input {...props} placeholder="e.g. Groceries at DMart" {...register("description")} />
        )}
      </Field>

      <Field label="Category" error={errors.category?.message} className="sm:col-span-2">
        {(props) => (
          <Select {...props} {...register("category")}>
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Note" hint="Optional" error={errors.note?.message} className="sm:col-span-2">
        {(props) => <Textarea {...props} rows={2} {...register("note")} />}
      </Field>
    </form>
  );
}
