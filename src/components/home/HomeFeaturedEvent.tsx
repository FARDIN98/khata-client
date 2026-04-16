import Link from "next/link";

export type LoyaltyTier = "NEW" | "REGULAR" | "VIP";
export type Visibility = "PUBLIC" | "LOYALTY";

export interface DokanEvent {
  id: string;
  title: string;
  type: string;
  venue: string;
  scheduledAt: string;
  description: string;
  visibility: Visibility;
  minTier?: LoyaltyTier;
  feeInPaisa: number;
  capacity: number;
  isFeatured: boolean;
  dokan: { id: string; name: string };
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function eventBadge(event: DokanEvent): string {
  if (event.visibility === "PUBLIC") return "Open to all";
  if (event.minTier === "VIP") return "Loyalty · VIP only";
  if (event.minTier === "REGULAR") return "Loyalty · REGULAR+";
  return "Loyalty · Members";
}

/**
 * Null-safe: renders nothing if no featured event. Don't show empty state
 * for this section — it's a bonus slot, not a core navigation surface.
 */
export function HomeFeaturedEvent({ event }: { event: DokanEvent | null }) {
  if (!event) return null;

  return (
    <section className="bg-khata-text text-khata-text-on-dark">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-khata-tier-vip">
          Featured this week
        </p>
        <Link href={`/events/${event.id}`} className="group mt-3 block">
          <h2 className="font-display text-3xl font-semibold leading-tight text-khata-text-on-dark transition-colors group-hover:text-khata-tier-vip md:text-5xl">
            {event.title}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-khata-text-on-dark/70">
            <span>{event.dokan.name}</span>
            <span aria-hidden>·</span>
            <span>{formatEventDate(event.scheduledAt)}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex h-6 items-center rounded-full border border-khata-tier-vip/40 px-2.5 text-xs font-medium uppercase tracking-[0.08em] text-khata-tier-vip">
              {eventBadge(event)}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
