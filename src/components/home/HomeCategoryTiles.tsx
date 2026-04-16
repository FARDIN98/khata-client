import Link from "next/link";
import { DESIGN_CATEGORIES, type DesignCategory } from "@/lib/category-map";

export interface HomeCategoryTilesProps {
  counts: Record<DesignCategory, number>;
}

/**
 * 6 category tiles — typography-led, NOT icon-in-colored-circle (banned slop
 * pattern). Grid: 2×3 mobile, 3×2 tablet, 6×1 desktop. Tiles with 0 shops
 * still render (honest empty state per spec decision 16).
 */
export function HomeCategoryTiles({ counts }: HomeCategoryTilesProps) {
  return (
    <section className="bg-khata-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          Browse by category
        </h2>
        <p className="mt-2 max-w-xl text-sm text-khata-text-muted md:text-base">
          Follow shops across Dhaka — a ledger per shop, a tier per customer.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {DESIGN_CATEGORIES.map((cat) => {
            const n = counts[cat];
            return (
              <Link
                key={cat}
                href={`/dokan-jatra?category=${cat.toLowerCase()}`}
                className="group flex flex-col gap-1 rounded-lg border border-khata-border bg-khata-bg p-5 transition-colors hover:border-khata-border-strong hover:bg-khata-surface-muted"
              >
                <span className="font-display text-xl font-medium text-khata-text md:text-[22px]">
                  {cat}
                </span>
                <span className="text-xs text-khata-text-muted">
                  {n === 0 ? "0 shops yet" : n === 1 ? "1 shop" : `${n} shops`}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
