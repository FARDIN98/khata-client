"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type ConfirmDialogTone = "default" | "destructive";

export interface ConfirmDialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Called when the dialog closes by any means (confirm, cancel, escape). */
  onClose: () => void;
  /** Called when the primary action is confirmed. Parent also gets onClose after. */
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive tone uses the danger button (reject, ban, delete). */
  tone?: ConfirmDialogTone;
  /** Disable the confirm button while the parent is handling the action. */
  busy?: boolean;
}

/**
 * Modal confirmation dialog built on the native <dialog> element.
 * - Escape closes (browser-native).
 * - Backdrop click closes (handled manually via click target check).
 * - No trap/library — native dialog handles focus + inert background.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync imperative dialog API with declarative `open` prop.
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  // Native <dialog> fires "close" when Escape is pressed or close() is called.
  // Wire it back to onClose so parent stays in sync.
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const handleClose = () => onClose();
    node.addEventListener("close", handleClose);
    return () => node.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // If the actual dialog element is the click target, the user clicked the backdrop.
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        "m-auto w-[90vw] max-w-md rounded-xl border border-khata-border bg-khata-surface p-0 text-khata-text",
        "backdrop:bg-black/40 backdrop:backdrop-blur-[2px]",
      )}
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-desc" : undefined}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2
          id="confirm-dialog-title"
          className="font-display text-xl font-semibold leading-tight"
        >
          {title}
        </h2>
        {description && (
          <p
            id="confirm-dialog-desc"
            className="text-[15px] leading-6 text-khata-text-muted"
          >
            {description}
          </p>
        )}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
              "bg-khata-surface-muted text-khata-text",
              "hover:bg-khata-border",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "transition-colors duration-[120ms] ease-out",
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
              "text-khata-text-on-dark",
              tone === "destructive"
                ? "bg-khata-danger hover:brightness-95"
                : "bg-khata-primary hover:bg-khata-primary-hover",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "transition-colors duration-[120ms] ease-out",
              "active:scale-[0.98]",
            )}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
