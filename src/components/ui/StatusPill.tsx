import { cn } from "@/lib/cn";

export type BookingStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "BANNED";

export type StatusPillSize = "sm" | "md";

export interface StatusPillProps {
  status: BookingStatus;
  size?: StatusPillSize;
  className?: string;
}

// Human-readable labels (English-only per copy override).
const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  PAYMENT_PENDING: "Payment pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BANNED: "Banned",
};

// Color choices documented inline. Design doc didn't lock these — judgment call:
// neutral chrome for awaiting-action states, semantic green/red for terminal states.
const statusStyles: Record<BookingStatus, string> = {
  // Awaiting shopkeeper review — neutral, calm.
  PENDING: "bg-khata-surface-muted text-khata-text border border-khata-border",
  // Stripe in flight — warning palette (same gold as VIP, deliberate per doc).
  PAYMENT_PENDING:
    "bg-khata-warning/15 text-khata-text border border-khata-warning/40",
  // Confirmed — warm olive success.
  APPROVED: "bg-khata-success/15 text-khata-success border border-khata-success/40",
  // Soft danger — they were declined but not banned.
  REJECTED: "bg-khata-danger/10 text-khata-danger border border-khata-danger/30",
  // Strong danger — banned is terminal and visible.
  BANNED: "bg-khata-danger text-khata-text-on-dark border border-khata-danger",
};

const sizeStyles: Record<StatusPillSize, string> = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-6 px-2.5 text-[11px]",
};

/**
 * Booking status badge. Mapped to the BookingStatus enum from the data model.
 * Backend enum strings UNCHANGED; the visible label is English.
 */
export function StatusPill({ status, size = "md", className }: StatusPillProps) {
  return (
    <span
      role="status"
      aria-label={`Booking status: ${statusLabels[status]}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium uppercase tracking-[0.08em]",
        statusStyles[status],
        sizeStyles[size],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
