import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  /** Lucide icon component. Renders at 32px with stroke 1.5. */
  icon?: LucideIcon;
  /** Warm one-liner that reframes emptiness as a start point. */
  title: string;
  /** Optional supporting sentence. */
  description?: string;
  /** Primary CTA slot — pass a Button, Link, or anchor. */
  cta?: React.ReactNode;
  /** Secondary CTA slot (rarely used). */
  secondaryCta?: React.ReactNode;
  className?: string;
}

/**
 * Empty-state card. Follows the doc's rule:
 *   [Warm one-liner that reframes emptiness as a start point]
 *   [One clear primary CTA]
 *
 * Uses a card surface with the warm border — matches the rest of the chrome.
 * Text is centered because empty states are hero-adjacent, not body content.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  secondaryCta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-khata-border bg-khata-surface px-6 py-10 text-center",
        "sm:px-10 sm:py-14",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-khata-surface-muted text-khata-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      <h2 className="max-w-md font-display text-2xl font-semibold leading-tight text-khata-text">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-md text-[15px] leading-6 text-khata-text-muted">
          {description}
        </p>
      )}
      {(cta || secondaryCta) && (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          {cta}
          {secondaryCta}
        </div>
      )}
    </div>
  );
}
