import Link from "next/link";
import type { DokanEvent } from "./HomeFeaturedEvent";

export interface HomeUpcomingEventsProps {
  events: DokanEvent[];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatFee(event: DokanEvent): string {
  if (event.visibility === "LOYALTY" && event.minTier === "VIP") return "VIP only";
  if (event.feeInPaisa === 0) return "Free";
  const taka = (event.feeInPaisa / 100).toLocaleString("en-US");
  return `৳${taka}`;
}

/**
 * Upcoming events strip. Renders nothing if events list is empty — don't
 * show an empty section. Mobile: horizontal scroll-snap. Desktop: 3-col grid.
 */
export function HomeUpcomingEvents({ events }: HomeUpcomingEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="bg-khata-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          Upcoming on Khata
        </h2>
        <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group flex min-w-[280px] snap-start flex-col gap-3 rounded-xl border border-khata-border bg-khata-surface p-5 transition-colors hover:border-khata-border-strong md:min-w-0"
            >
              <span className="inline-flex h-6 w-fit items-center rounded-full bg-khata-primary-soft px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-khata-primary">
                {event.type.replaceAll("_", " ")}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium leading-snug text-khata-text transition-colors group-hover:text-khata-primary">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-khata-text-muted">
                  {event.dokan.name}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-khata-text-muted">
                <span>{formatShortDate(event.scheduledAt)}</span>
                <span className="font-medium text-khata-text">
                  {formatFee(event)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
