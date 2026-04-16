import { cn } from "@/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind sizing classes (e.g. "h-4 w-32"). Caller controls shape. */
  className?: string;
}

/**
 * Loading placeholder block. Matches final layout shape — never a spinner.
 * Uses warm cream/border palette + slow shimmer that respects reduced-motion.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "rounded-md bg-khata-surface-muted",
        "bg-[linear-gradient(90deg,var(--khata-surface-muted)_0%,var(--khata-border)_50%,var(--khata-surface-muted)_100%)]",
        "bg-[length:200%_100%]",
        "animate-khata-shimmer",
        className,
      )}
      {...props}
    />
  );
}
