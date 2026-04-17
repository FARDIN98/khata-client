import Link from "next/link";

export interface Dokan {
  id: string;
  name: string;
  category: string;
  address: string;
  description: string;
}

export interface HomeFeaturedShopsProps {
  shops: Dokan[];
}

/**
 * 6-shop grid. Text-based tiles (no logos — seed doesn't ship them).
 * Empty state encourages shopkeeper signup instead of showing empty grid.
 */
export function HomeFeaturedShops({ shops }: HomeFeaturedShopsProps) {
  const display = shops.slice(0, 6);

  return (
    <section className="bg-khata-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          Shops on Khata
        </h2>

        {display.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-khata-border-strong bg-khata-bg p-10 text-center">
            <p className="text-sm text-khata-text-muted">
              No shops on Khata yet. Be the first.
            </p>
            <Link
              href="/auth/signup?role=dokandar"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-khata-primary px-5 text-sm font-medium text-khata-text-on-dark transition-colors hover:bg-khata-primary-hover"
            >
              Sign up as Shopkeeper
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {display.map((shop) => (
              <Link
                key={shop.id}
                href={`/dokan/${shop.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-khata-border bg-khata-bg p-6 transition-colors hover:border-khata-border-strong"
              >
                <span className="inline-flex h-6 w-fit items-center rounded-full bg-khata-surface-muted px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-khata-text-muted">
                  {shop.category}
                </span>
                <h3 className="font-display text-xl font-medium leading-snug text-khata-text transition-colors group-hover:text-khata-primary">
                  {shop.name}
                </h3>
                <p className="text-xs text-khata-text-muted">{shop.address}</p>
                <p className="line-clamp-2 text-sm leading-relaxed text-khata-text-muted">
                  {shop.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
