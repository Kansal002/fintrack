"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Transaction } from "@/types";
import { useCreateTransaction, useUpdateTransaction } from "./hooks";
import { TRANSACTION_FORM_ID, TransactionForm } from "./transaction-form";

interface TransactionFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** When provided the dialog edits this transaction; otherwise it creates one. */
  transaction?: Transaction;
}

export function TransactionFormDialog({ open, onClose, transaction }: TransactionFormDialogProps) {
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const isEdit = Boolean(transaction);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit transaction" : "Add transaction"}
      description={
        isEdit ? "Update the details of this transaction." : "Record a new income or expense."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={TRANSACTION_FORM_ID}>
            {isEdit ? "Save changes" : "Add transaction"}
          </Button>
        </>
      }
    >
      <TransactionForm
        key={transaction?.id ?? "new"}
        transaction={transaction}
        onSubmit={(input) => {
          // Optimistic: the list updates instantly, so close right away. If the
          // request fails, the cache rolls back and a toast explains why.
          if (transaction) update.mutate({ id: transaction.id, input, previous: transaction });
          else create.mutate(input);
          onClose();
        }}
      />
    </Dialog>
  );
}
