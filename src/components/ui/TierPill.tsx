import { cn } from "@/lib/cn";

export type Tier = "NEW" | "REGULAR" | "VIP";
export type TierPillSize = "sm" | "md" | "lg";

export interface TierPillProps {
  tier: Tier;
  size?: TierPillSize;
  /** True if the tier was set via shopkeeper manual override — uses amethyst. */
  manualOverride?: boolean;
  className?: string;
}

const tierLabels: Record<Tier, string> = {
  NEW: "NEW",
  REGULAR: "REGULAR",
  VIP: "VIP",
};

// Each tier has its own background + text color combo chosen for contrast.
// NEW (cream) and VIP (saffron) need dark text; REGULAR (terra cotta) needs light text.
const tierStyles: Record<Tier, string> = {
  NEW: "bg-khata-tier-new text-khata-text",
  REGULAR: "bg-khata-tier-regular text-khata-text-on-dark",
  VIP: "bg-khata-tier-vip text-khata-text",
};

const sizeStyles: Record<TierPillSize, string> = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-6 px-2.5 text-[11px]",
  lg: "h-7 px-3 text-xs",
};

/**
 * Loyalty tier badge. Functional segmentation, not gamification.
 * Always uppercase + tracked, per the micro/uppercase type token.
 */
export function TierPill({
  tier,
  size = "md",
  manualOverride = false,
  className,
}: TierPillProps) {
  const palette = manualOverride
    ? "bg-khata-tier-override text-khata-text-on-dark"
    : tierStyles[tier];

  return (
    <span
      role="status"
      aria-label={`Loyalty tier: ${tierLabels[tier]}${manualOverride ? " (manual override)" : ""}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium uppercase tracking-[0.08em]",
        "transition-colors duration-[200ms] ease-out",
        palette,
        sizeStyles[size],
        className,
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}
