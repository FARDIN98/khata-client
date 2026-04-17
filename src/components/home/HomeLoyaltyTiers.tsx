interface TierRow {
  name: string;
  widthPercent: number;
  barClass: string;
  copy: string;
}

const TIER_ROWS: TierRow[] = [
  {
    name: "NEW",
    widthPercent: 25,
    barClass: "bg-khata-tier-new",
    copy: "Follow a shop to start. Your ledger opens at NEW.",
  },
  {
    name: "REGULAR",
    widthPercent: 60,
    barClass: "bg-khata-tier-regular",
    copy: "First purchase unlocks member events at that shop.",
  },
  {
    name: "VIP",
    widthPercent: 100,
    barClass: "bg-khata-tier-vip",
    copy: "Private previews, limited tastings, shop-chosen VIP moments.",
  },
];

/**
 * Loyalty tier explainer as stacked horizontal bars (NEW < REGULAR < VIP).
 * Each bar's width encodes its "reach" — VIP fills the full width.
 * NOT 3-column pricing cards (banned slop pattern).
 */
export function HomeLoyaltyTiers() {
  return (
    <section className="bg-khata-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          How loyalty works
        </h2>
        <p className="mt-2 max-w-xl text-sm text-khata-text-muted md:text-base">
          Not a points system. A relationship ledger per shop-customer pair.
        </p>
        <div className="mt-10 flex flex-col gap-6">
          {TIER_ROWS.map((row) => (
            <div key={row.name}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-medium text-khata-text">
                  {row.name}
                </span>
              </div>
              <div
                className={`mt-2 h-3 rounded-full ${row.barClass}`}
                style={{ width: `${row.widthPercent}%` }}
                aria-hidden
              />
              <p className="mt-3 max-w-xl text-sm text-khata-text-muted">
                {row.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
