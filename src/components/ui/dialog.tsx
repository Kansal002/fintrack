"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
  /** Set to "alertdialog" for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
}

/**
 * Accessible modal built on the native <dialog> element:
 * - `showModal()` makes the rest of the page inert and renders a backdrop
 * - Tab / Shift+Tab are trapped inside the dialog
 * - Escape and backdrop clicks call `onClose`
 * - Focus moves to the first `[data-autofocus]` element (or first control) on
 *   open and is restored to the trigger on close
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  role = "dialog",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;

    const trigger = document.activeElement as HTMLElement | null;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    const target =
      dialog.querySelector<HTMLElement>("[data-autofocus]") ??
      dialog.querySelector<HTMLElement>(`[data-dialog-body] :is(${FOCUSABLE})`);
    target?.focus();

    return () => {
      if (dialog.open) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
      trigger?.focus?.();
    };
  }, [open]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <dialog
      ref={ref}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Escape key: keep React state as the source of truth.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the <dialog> itself (not its content) is a backdrop click.
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={trapFocus}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl",
        "transition duration-150 ease-out starting:open:translate-y-2 starting:open:opacity-0",
        size === "sm" ? "max-w-md" : "max-w-lg",
      )}
    >
      {open && (
        <div className="flex max-h-[min(85dvh,44rem)] flex-col">
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
            <div>
              <h2 id={titleId} className="text-base font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-2 size-8"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X aria-hidden />
            </Button>
          </header>
          <div data-dialog-body className="overflow-y-auto px-6 py-4">
            {children}
          </div>
          {footer && (
            <footer className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      role="alertdialog"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </Dialog>
  );
}
