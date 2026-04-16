/**
 * Maps free-text seed categories to the 6 English design-doc categories.
 * Unknown seed values fall into 'Other' and are not rendered as tiles.
 *
 * Design doc §`/` Home section 3 locks the 6 English buckets.
 * Seed (khata-server/src/seed.ts) currently uses 'Fashion' and 'Food'.
 */

export type DesignCategory =
  | "Restaurants"
  | "Boutiques"
  | "Salons"
  | "Bakeries"
  | "Electronics"
  | "Tailors";

/** Ordered as they appear in the tile grid (top-left → bottom-right). */
export const DESIGN_CATEGORIES: readonly DesignCategory[] = [
  "Restaurants",
  "Boutiques",
  "Salons",
  "Bakeries",
  "Electronics",
  "Tailors",
] as const;

/**
 * Seed's free-text values → canonical design categories. Case-insensitive
 * matching is handled by mapCategory() below.
 */
const CATEGORY_MAP: Record<string, DesignCategory> = {
  fashion: "Boutiques",
  food: "Restaurants",
  cafe: "Restaurants",
  restaurant: "Restaurants",
  apparel: "Boutiques",
  boutique: "Boutiques",
  salon: "Salons",
  bakery: "Bakeries",
  electronics: "Electronics",
  tailor: "Tailors",
};

/**
 * Look up a seed category. Returns null for unknown values (caller drops
 * them from tile counts).
 */
export function mapCategory(raw: string | null | undefined): DesignCategory | null {
  if (!raw) return null;
  return CATEGORY_MAP[raw.toLowerCase().trim()] ?? null;
}

/**
 * Count shops per design category. Always returns a record with all 6
 * categories present (unmapped categories counted as 0). Unknown seed values
 * are silently dropped.
 */
export function countByCategory(
  shops: ReadonlyArray<{ category: string }>,
): Record<DesignCategory, number> {
  const counts: Record<DesignCategory, number> = {
    Restaurants: 0,
    Boutiques: 0,
    Salons: 0,
    Bakeries: 0,
    Electronics: 0,
    Tailors: 0,
  };
  for (const shop of shops) {
    const mapped = mapCategory(shop.category);
    if (mapped) counts[mapped] += 1;
  }
  return counts;
}
