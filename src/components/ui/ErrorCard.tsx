"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ErrorCardProps {
  /** Main message shown to user. Keep it human — no stack traces. */
  message: string;
  /** Retry handler. If omitted, the retry button is hidden. */
  onRetry?: () => void;
  /** Label for the retry action. Defaults to "Try again". */
  retryLabel?: string;
  className?: string;
}

/**
 * Inline retry card for fetch-level errors. Renders where content would.
 * Warm red tint (not alert-red) + muted border + primary-teal retry button.
 */
export function ErrorCard({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorCardProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border p-4",
        "border-khata-danger/30 bg-khata-danger/5 text-khata-text",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-khata-danger"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="text-[15px] leading-6">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-md px-4 text-sm font-medium",
            "bg-khata-primary text-khata-text-on-dark",
            "hover:bg-khata-primary-hover",
            "transition-colors duration-[120ms] ease-out",
            "active:scale-[0.98]",
          )}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
