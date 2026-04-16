# Khata Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public Home page at `/` with 10 sections wired to real backend data, SSR via async Server Components, graceful degradation when backend is down or empty.

**Architecture:** Single async Server Component at `src/app/page.tsx` performs `Promise.all` of 3 public GETs (`/dokans`, `/dokan-events?upcoming=true`, `/dokan-events?upcoming=true&featured=true`) via a new `fetchPublic<T>()` helper. Derives data for 11 child components (1 nav + 10 sections). Only `HomeDemoBlock` is `"use client"` for login handler. Page is `force-dynamic` to avoid build-time backend dependency on Vercel.

**Tech Stack:** Next.js 16.2.3 App Router + React 19 Server Components, Tailwind v4 (theme tokens in `globals.css`), TypeScript 5, `sonner` for toasts, `lucide-react` for icons, `clsx` via `@/lib/cn`.

**Spec:** `docs/superpowers/specs/2026-04-16-khata-home-page-design.md` — 16 locked decisions, 11 component specs, edge cases, anti-slop check.

**Working directories:** Spans two repos.
- `/Users/fardin/Documents/Projects/B6A6/khata-server/` — Task 0 only (seed rename)
- `/Users/fardin/Documents/Projects/B6A6/khata-client/` — Tasks 1-16

**Testing approach:** No test framework installed (no vitest/jest/testing-library). Per `khata-client/CLAUDE.md` § Simplicity First and tonight's ship deadline, we **do not introduce a test framework for this plan**. Verification = (a) TypeScript type-check `tsc --noEmit`, (b) `next build` succeeds, (c) dev-server visual render per section, (d) manual responsive + console checks at Task 16. Plan is written so components are small and pure enough to cover with Vitest retroactively if the team adopts one.

**Category tiles note:** Seed ships with 2 shops (Fashion, Food). 4 of 6 category tiles will show "0 shops yet". This is intentional (decision 16 of the spec).

---

## File Structure

### khata-server (1 file modified)
| Path | Responsibility | Action |
|---|---|---|
| `src/seed.ts` | Seed data. Aisha → Maya rename for narrative alignment with design doc. | Modify |

### khata-client (14 files created, 1 modified)
| Path | Responsibility | Action |
|---|---|---|
| `.env.local` | Dev-only env: `NEXT_PUBLIC_API_URL=http://localhost:3003/api` (backend has `app.setGlobalPrefix('api')`) | Create (gitignored) |
| `src/lib/public-api.ts` | Server-safe `fetchPublic<T>()` — plain fetch, returns `T \| null`, never throws | Create |
| `src/lib/category-map.ts` | Seed→design category lookup + `DesignCategory` type + `DESIGN_CATEGORIES` ordered list | Create |
| `src/components/home/HomeNav.tsx` | Minimal inline nav: wordmark + Sign in/Sign up links | Create |
| `src/components/home/HomeHero.tsx` | Left-aligned headline + sub + dual CTA (Customer / Shopkeeper) | Create |
| `src/components/home/HomeFeaturedEvent.tsx` | One full-bleed featured event card. Null-safe: renders nothing if no event. | Create |
| `src/components/home/HomeCategoryTiles.tsx` | 6-tile grid, typography-led (no icons-in-circles), live counts | Create |
| `src/components/home/HomeUpcomingEvents.tsx` | Horizontal scroll strip (mobile) / 3-col grid (desktop) of up to 9 event cards | Create |
| `src/components/home/HomeHowItWorks.tsx` | 3 typographically-varied vignettes (decision 15: NO SVG) | Create |
| `src/components/home/HomeLoyaltyTiers.tsx` | Stacked horizontal bars NEW/REGULAR/VIP (NOT 3-column pricing cards) | Create |
| `src/components/home/HomeFeaturedShops.tsx` | 6-shop grid, text-based (no logos in seed) | Create |
| `src/components/home/HomeTestimonial.tsx` | Hardcoded "Maya, Maya's Boutique" quote, centered | Create |
| `src/components/home/HomeDemoBlock.tsx` | `"use client"` — 3 auto-login buttons, stay on `/` after login | Create |
| `src/components/home/HomeFooter.tsx` | 3-column footer: brand/credit, links, copyright | Create |
| `src/app/page.tsx` | **REPLACE** — async Server Component, `force-dynamic`, Promise.all, compose sections | Modify |

---

## Task 0: Rename seed Aisha → Maya (khata-server)

**Working dir:** `/Users/fardin/Documents/Projects/B6A6/khata-server/`

**Files:**
- Modify: `src/seed.ts`

- [ ] **Step 1: Locate the Aisha references**

Run: `cd /Users/fardin/Documents/Projects/B6A6/khata-server && grep -n "Aisha" src/seed.ts`

Expected: 4 lines referencing `'Aisha Rahman'`, `'Aisha\u2019s Boutique'`, `'Aisha\u2019s Boutique, Dhanmondi 27'`, `'Aisha\u2019s Studio, Dhanmondi'`, `'Aisha\u2019s Boutique'` (event 3 venue).

- [ ] **Step 2: Replace all Aisha → Maya**

Use Edit tool with `replace_all: true` on `src/seed.ts`:
- Replace `Aisha Rahman` → `Maya Rahman`
- Replace `Aisha\u2019s Boutique` → `Maya\u2019s Boutique` (note: the unicode-escape form in the file)
- Replace `Aisha\u2019s Studio` → `Maya\u2019s Studio`

If the file uses a real `'` apostrophe (not `\u2019`), use that form instead. Verify with `grep -n "Aisha\|Maya" src/seed.ts` after editing.

- [ ] **Step 3: Re-run the seed to verify no syntax errors**

Run: `cd /Users/fardin/Documents/Projects/B6A6/khata-server && npm run seed` (or whichever script the repo uses — check `package.json` scripts).

If no seed script exists, run `npx ts-node src/seed.ts` or `npm run db:reset && npm run db:seed`. Expected output includes `> seeded: 1 admin, 2 dokandars, 4 grahoks, 7 events, 2 khatas, 2 historical bookings` with Maya in the output.

- [ ] **Step 4: Grep to confirm no stray Aisha references**

Run: `grep -rn "Aisha" src/ 2>/dev/null`

Expected: zero matches. If any appear, edit them (likely in comments or unrelated files — verify each).

- [ ] **Step 5: Commit**

```bash
cd /Users/fardin/Documents/Projects/B6A6/khata-server
git add src/seed.ts
git commit -m "chore(seed): rename shop owner Aisha → Maya to match design doc narrative"
```

---

## Task 1: Configure client env + verify backend reachable

**Working dir:** `/Users/fardin/Documents/Projects/B6A6/khata-client/`

**Files:**
- Create: `.env.local` (gitignored by Next.js default)

- [ ] **Step 1: Check if backend is running on 3003**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/api/dokans`

Expected: `200`. Note the `/api/` prefix — `khata-server/src/main.ts:41` has `app.setGlobalPrefix('api', ...)`, so every endpoint is served under `/api`. If `connection refused`, start backend in another terminal: `cd /Users/fardin/Documents/Projects/B6A6/khata-server && npm run start:dev`. Wait ~5 seconds, retry.

- [ ] **Step 2: Create .env.local**

Write `/Users/fardin/Documents/Projects/B6A6/khata-client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

The `/api` prefix is baked into `NEXT_PUBLIC_API_URL` so every `fetchPublic("/dokans")` call resolves to `http://localhost:3003/api/dokans`. Matches existing `src/lib/api.ts` convention (`api.get("/auth/me")` → `/api/auth/me`). Single line, no quotes.

- [ ] **Step 3: Verify .env.local is gitignored**

Run: `cat .gitignore | grep -i env`

Expected: `.env*` or `.env*.local` or similar line present. Next.js default gitignore includes this. If not, add `.env.local` to `.gitignore` and commit that separately.

- [ ] **Step 4: No commit yet**

`.env.local` is gitignored. Nothing to commit this task.

---

## Task 2: Create `fetchPublic<T>()` server-safe fetcher

**Working dir:** `/Users/fardin/Documents/Projects/B6A6/khata-client/`

**Files:**
- Create: `src/lib/public-api.ts`

- [ ] **Step 1: Write the file**

Write `src/lib/public-api.ts`:

```ts
/**
 * Server-safe fetcher for public Khata backend endpoints.
 *
 * Why not src/lib/api.ts? That one reads localStorage for the JWT and is
 * client-only. This module runs in Server Components (page.tsx), has no
 * window/localStorage access, and only hits endpoints that don't require auth
 * (/dokans list, /dokan-events list). On any failure returns null — callers
 * check for null and render empty state. Never throws.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch a public endpoint. Returns parsed JSON as T on 2xx, null on:
 *  - network error
 *  - non-2xx response
 *  - JSON parse failure
 *
 * Logs to console.error for observability. Caller must handle T | null.
 */
export async function fetchPublic<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | null> {
  if (!BASE_URL) {
    console.error("[public-api] NEXT_PUBLIC_API_URL is not set");
    return null;
  }

  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      next: { revalidate: 60, ...(init.next ?? {}) },
    });

    if (!res.ok) {
      console.error(`[public-api] ${path} → ${res.status} ${res.statusText}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`[public-api] ${path} failed:`, err);
    return null;
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors. If there's a pre-existing type error elsewhere (unlikely — baseline was clean), fix the one you introduced in this file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/public-api.ts
git commit -m "feat(home): add fetchPublic helper for server-side public API calls"
```

---

## Task 3: Create category map

**Working dir:** `/Users/fardin/Documents/Projects/B6A6/khata-client/`

**Files:**
- Create: `src/lib/category-map.ts`

- [ ] **Step 1: Write the file**

Write `src/lib/category-map.ts`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/category-map.ts
git commit -m "feat(home): add category map + count helper for 6 English buckets"
```

---

## Task 4: Create `HomeNav` component

**Working dir:** `/Users/fardin/Documents/Projects/B6A6/khata-client/`

**Files:**
- Create: `src/components/home/HomeNav.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeNav.tsx`:

```tsx
import Link from "next/link";

/**
 * Minimal inline nav for the public Home page. No auth awareness — full
 * app-shell nav ships with the dashboards. Only 2 links; no hamburger needed.
 */
export function HomeNav() {
  return (
    <header className="w-full border-b border-khata-border bg-khata-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-khata-text"
        >
          Khata
        </Link>
        <nav className="flex items-center gap-6 text-sm text-khata-text-muted">
          <Link
            href="/auth/login"
            className="transition-colors hover:text-khata-text"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-khata-primary px-3 py-1.5 text-khata-text-on-dark transition-colors hover:bg-khata-primary-hover"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeNav.tsx
git commit -m "feat(home): add HomeNav — wordmark + Sign in/Sign up inline nav"
```

---

## Task 5: Create `HomeHero` component

**Files:**
- Create: `src/components/home/HomeHero.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeHero.tsx`:

```tsx
import Link from "next/link";

/**
 * Hero section — left-aligned headline + sub + dual CTA. English copy
 * override from design doc line 500-508. Background is warm cream
 * (khata-bg) with a subtle CSS grid pattern (no stock photo, no gradient).
 */
export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-khata-bg"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(45, 95, 91, 0.08) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-khata-text md:text-6xl lg:text-7xl">
            Your shop&rsquo;s ledger.
            <br />
            Your tier. Your events.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-khata-text-muted md:text-xl">
            The loyalty ledger Bangladeshi shops never had. Track customers,
            reward regulars, host tier-gated events — without a spreadsheet.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/signup?role=grahok"
              className="inline-flex h-12 items-center justify-center rounded-md bg-khata-primary px-6 text-sm font-medium text-khata-text-on-dark transition-colors hover:bg-khata-primary-hover"
            >
              Sign up as Customer
            </Link>
            <Link
              href="/auth/signup?role=dokandar"
              className="inline-flex h-12 items-center justify-center rounded-md border border-khata-border-strong bg-khata-surface px-6 text-sm font-medium text-khata-text transition-colors hover:bg-khata-surface-muted"
            >
              Sign up as Shopkeeper
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeHero.tsx
git commit -m "feat(home): add HomeHero — headline, sub, dual CTA (Customer/Shopkeeper)"
```

---

## Task 6: Create `HomeFeaturedEvent` component

**Files:**
- Create: `src/components/home/HomeFeaturedEvent.tsx`

Defines the shared `DokanEvent` type used by this + `HomeUpcomingEvents` (Task 7). Both files import from here so the type lives with its first consumer.

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeFeaturedEvent.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeFeaturedEvent.tsx
git commit -m "feat(home): add HomeFeaturedEvent — full-bleed featured event card"
```

---

## Task 7: Create `HomeCategoryTiles` component

**Files:**
- Create: `src/components/home/HomeCategoryTiles.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeCategoryTiles.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeCategoryTiles.tsx
git commit -m "feat(home): add HomeCategoryTiles — 6 typography-led tiles with live counts"
```

---

## Task 8: Create `HomeUpcomingEvents` component

**Files:**
- Create: `src/components/home/HomeUpcomingEvents.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeUpcomingEvents.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeUpcomingEvents.tsx
git commit -m "feat(home): add HomeUpcomingEvents — horizontal-scroll strip / 3-col grid"
```

---

## Task 9: Create `HomeHowItWorks` component

**Files:**
- Create: `src/components/home/HomeHowItWorks.tsx`

Per spec decision 15: typography-only, no SVG. Each vignette has a distinct typographic treatment.

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeHowItWorks.tsx`:

```tsx
/**
 * 3 vignettes with varied typographic treatments. NOT 3 symmetric icon-in-
 * circle cards (banned slop). Each vignette uses a different visual anchor:
 *   1. Large numeral "01" (terra cotta accent)
 *   2. Horizontal bar above title (teal accent)
 *   3. Vertical 3-bar tier stack (saffron accent)
 */
export function HomeHowItWorks() {
  return (
    <section className="bg-khata-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          How Khata works
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Vignette 1: big numeral, terra cotta */}
          <div>
            <span className="font-display text-6xl font-semibold leading-none text-khata-tier-regular md:text-7xl">
              01
            </span>
            <h3 className="mt-4 font-display text-xl font-medium text-khata-text">
              Follow a shop
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-khata-text-muted">
              Browse Dhaka shops by category. Tap Follow on any boutique,
              restaurant, or salon to start a ledger with them. Your tier
              begins at NEW.
            </p>
          </div>

          {/* Vignette 2: horizontal rule anchor, teal */}
          <div>
            <div className="h-[3px] w-16 bg-khata-primary" aria-hidden />
            <h3 className="mt-4 font-display text-xl font-medium text-khata-text">
              Spend or attend
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-khata-text-muted">
              Every purchase or event booking the shopkeeper records lifts
              your tier. REGULAR unlocks member events. VIP unlocks the
              private previews and limited tastings.
            </p>
          </div>

          {/* Vignette 3: 3-bar vertical tier stack, saffron */}
          <div>
            <div className="flex items-end gap-1" aria-hidden>
              <div className="h-3 w-2 bg-khata-tier-new" />
              <div className="h-5 w-2 bg-khata-tier-regular" />
              <div className="h-8 w-2 bg-khata-tier-vip" />
            </div>
            <h3 className="mt-4 font-display text-xl font-medium text-khata-text">
              Unlock tier-gated events
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-khata-text-muted">
              Shops run their own loyalty events — sample sales, iftar
              nights, tastings. Your tier decides what&rsquo;s visible and
              what&rsquo;s locked with a progress nudge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeHowItWorks.tsx
git commit -m "feat(home): add HomeHowItWorks — 3 typographically-varied vignettes"
```

---

## Task 10: Create `HomeLoyaltyTiers` component

**Files:**
- Create: `src/components/home/HomeLoyaltyTiers.tsx`

Per spec: stacked horizontal bars. NOT side-by-side pricing cards (banned slop).

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeLoyaltyTiers.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeLoyaltyTiers.tsx
git commit -m "feat(home): add HomeLoyaltyTiers — stacked horizontal tier bars"
```

---

## Task 11: Create `HomeFeaturedShops` component

**Files:**
- Create: `src/components/home/HomeFeaturedShops.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeFeaturedShops.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeFeaturedShops.tsx
git commit -m "feat(home): add HomeFeaturedShops — text-based 6-shop grid with empty CTA"
```

---

## Task 12: Create `HomeTestimonial` component

**Files:**
- Create: `src/components/home/HomeTestimonial.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeTestimonial.tsx`:

```tsx
/**
 * Single hardcoded testimonial. English-only per copy-direction override.
 * Depends on Task 0 seed rename: Maya Rahman / Maya's Boutique.
 * Centered layout is acceptable here — single quote, not a carousel.
 */
export function HomeTestimonial() {
  return (
    <section className="bg-khata-bg">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6 md:py-20">
        <span
          aria-hidden
          className="font-display text-6xl leading-none text-khata-tier-regular"
        >
          &ldquo;
        </span>
        <blockquote className="mt-2 font-display text-2xl font-normal leading-snug text-khata-text md:text-3xl">
          VIP customers come back more often &mdash; now I know who they are.
        </blockquote>
        <footer className="mt-6 text-sm text-khata-text-muted">
          Maya, Maya&rsquo;s Boutique
        </footer>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeTestimonial.tsx
git commit -m "feat(home): add HomeTestimonial — single English-only shopkeeper quote"
```

---

## Task 13: Create `HomeDemoBlock` component (client)

**Files:**
- Create: `src/components/home/HomeDemoBlock.tsx`

Only `"use client"` component on the page. Handles auto-login buttons.

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeDemoBlock.tsx`:

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: UserRole;
  roleLabel: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Try as Customer",
    email: "demo@khata.com",
    password: "demo1234",
    role: "GRAHOK",
    roleLabel: "Customer",
  },
  {
    label: "Try as Shopkeeper",
    email: "shop-one@khata.bd",
    password: "dokan123",
    role: "DOKANDAR",
    roleLabel: "Shopkeeper",
  },
  {
    label: "Try as Admin",
    email: "admin@khata.com",
    password: "admin1234",
    role: "SUPER_ADMIN",
    roleLabel: "Admin",
  },
];

/**
 * One-tap demo login block. After login, stay on / (dashboard routes 404
 * until later phases). Toast confirms the signed-in role.
 */
export function HomeDemoBlock() {
  const { login } = useAuth();
  const [pending, setPending] = useState<string | null>(null);

  const handleLogin = async (account: DemoAccount) => {
    setPending(account.email);
    try {
      await login(account.email, account.password);
      toast.success(`Signed in as ${account.roleLabel}`, {
        description: account.email,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="bg-khata-primary-soft">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          Try Khata in one tap.
        </h2>
        <p className="mt-2 text-sm text-khata-text-muted md:text-base">
          Demo accounts for the course-submission viewer. No signup needed.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => {
            const isPending = pending === account.email;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => handleLogin(account)}
                disabled={pending !== null}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-md border border-khata-border-strong bg-khata-surface px-4 text-sm font-medium text-khata-text transition-colors",
                  "hover:bg-khata-bg disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {isPending ? "Signing in…" : account.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeDemoBlock.tsx
git commit -m "feat(home): add HomeDemoBlock — 3 auto-login buttons, stay on /"
```

---

## Task 14: Create `HomeFooter` component

**Files:**
- Create: `src/components/home/HomeFooter.tsx`

- [ ] **Step 1: Write the file**

Write `src/components/home/HomeFooter.tsx`:

```tsx
import Link from "next/link";

/**
 * Minimal footer. 3-column on desktop, stacked on mobile.
 * GitHub URL and BRACU CSE470 credit per design doc §/ Home section 10.
 */
export function HomeFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-khata-border bg-khata-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <span className="font-display text-xl font-semibold text-khata-text">
              Khata
            </span>
            <p className="mt-3 max-w-xs text-sm text-khata-text-muted">
              Loyalty ledger for BD shops. Built for BRACU CSE470.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.12em] text-khata-text-soft">
              Links
            </span>
            <a
              href="https://github.com/FARDIN98/khata-client"
              target="_blank"
              rel="noopener noreferrer"
              className="text-khata-text-muted transition-colors hover:text-khata-text"
            >
              GitHub
            </a>
            <Link
              href="/auth/login"
              className="text-khata-text-muted transition-colors hover:text-khata-text"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-khata-text-muted transition-colors hover:text-khata-text"
            >
              Sign up
            </Link>
          </nav>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.12em] text-khata-text-soft">
              Contact
            </span>
            <a
              href="mailto:hasan@delineate.pro"
              className="text-khata-text-muted transition-colors hover:text-khata-text"
            >
              hasan@delineate.pro
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-khata-border pt-6 text-xs text-khata-text-soft">
          &copy; {year} Khata. Course project — BRACU CSE470.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeFooter.tsx
git commit -m "feat(home): add HomeFooter — 3-column footer with GitHub + contact"
```

---

## Task 15: Rewrite `src/app/page.tsx` — compose all sections

**Files:**
- Modify: `src/app/page.tsx` (full replacement — existing template content goes)

- [ ] **Step 1: Replace the file**

Write `src/app/page.tsx` (overwriting current template content):

```tsx
import { fetchPublic } from "@/lib/public-api";
import { countByCategory } from "@/lib/category-map";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFeaturedEvent, type DokanEvent } from "@/components/home/HomeFeaturedEvent";
import { HomeCategoryTiles } from "@/components/home/HomeCategoryTiles";
import { HomeUpcomingEvents } from "@/components/home/HomeUpcomingEvents";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeLoyaltyTiers } from "@/components/home/HomeLoyaltyTiers";
import { HomeFeaturedShops, type Dokan } from "@/components/home/HomeFeaturedShops";
import { HomeTestimonial } from "@/components/home/HomeTestimonial";
import { HomeDemoBlock } from "@/components/home/HomeDemoBlock";
import { HomeFooter } from "@/components/home/HomeFooter";

// Prevent build-time backend fetches on Vercel. Every request fetches fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [shops, upcoming, featured] = await Promise.all([
    fetchPublic<Dokan[]>("/dokans"),
    fetchPublic<DokanEvent[]>("/dokan-events?upcoming=true"),
    fetchPublic<DokanEvent[]>("/dokan-events?upcoming=true&featured=true"),
  ]);

  const shopList = shops ?? [];
  const upcomingList = upcoming ?? [];
  const featuredEvent = featured?.[0] ?? null;

  // Drop the featured event from the upcoming strip so it doesn't appear twice.
  const upcomingFiltered = featuredEvent
    ? upcomingList.filter((e) => e.id !== featuredEvent.id).slice(0, 9)
    : upcomingList.slice(0, 9);

  const categoryCounts = countByCategory(shopList);

  return (
    <>
      <HomeNav />
      <main className="flex-1">
        <HomeHero />
        <HomeFeaturedEvent event={featuredEvent} />
        <HomeCategoryTiles counts={categoryCounts} />
        <HomeUpcomingEvents events={upcomingFiltered} />
        <HomeHowItWorks />
        <HomeLoyaltyTiers />
        <HomeFeaturedShops shops={shopList} />
        <HomeTestimonial />
        <HomeDemoBlock />
      </main>
      <HomeFooter />
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 3: Start dev server**

Run (in a separate terminal or via run_in_background): `cd /Users/fardin/Documents/Projects/B6A6/khata-client && npm run dev`

Wait ~5 seconds for Next.js to compile.

- [ ] **Step 4: Visually verify in browser**

Open `http://localhost:3000/` in a browser. Expected sections top-to-bottom:
1. Nav (Khata wordmark + Sign in + Sign up)
2. Hero (3-line headline + sub + 2 CTAs)
3. Featured event (dark section — shows IF a featured upcoming event exists in seed)
4. Category tiles (6 tiles, most showing "0 shops yet")
5. Upcoming events (horizontal strip on mobile, grid on desktop)
6. How it works (3 vignettes)
7. Loyalty tiers (3 stacked bars)
8. Featured shops (2 cards: Maya's Boutique + Karim's Iftar House)
9. Testimonial (Maya quote)
10. Demo block (3 buttons)
11. Footer

Open DevTools console. Expected: zero errors or warnings. If the backend isn't running, `[public-api] /dokans → ...` errors will log to the **server** console (Next.js terminal), and sections 3/4/5/8 will be empty. That's correct behavior — not a bug.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): wire Home page — Promise.all + 11 sections, force-dynamic"
```

---

## Task 16: End-to-end verification

**Files:** No new files. Verification only.

- [ ] **Step 1: Backend-down test**

Stop the backend (Ctrl-C in the khata-server terminal). In the browser, hard reload `/` (Cmd-Shift-R).

Expected:
- Nav, Hero, Category tiles (all 0), How it works, Loyalty tiers, Testimonial, Demo block, Footer all render.
- Featured event section is missing (null).
- Upcoming events section is missing (empty).
- Featured shops shows the "No shops yet — be the first" empty-state CTA.
- No error boundary / error page — just missing sections.
- Server console (Next.js terminal) logs `[public-api] /dokans → 0` or `ECONNREFUSED` errors. This is correct.

Restart the backend: `cd /Users/fardin/Documents/Projects/B6A6/khata-server && npm run start:dev`. Wait for it to come up, hard reload browser, confirm sections come back.

- [ ] **Step 2: Demo button test**

Click "Try as Customer". Expected:
- Toast appears top-right: "Signed in as Customer" + "demo@khata.com".
- URL stays at `/`.
- DevTools → Application → Local Storage → `khata-token` is set.

Click "Try as Shopkeeper". Token overwrites. Toast confirms. Still on `/`.
Click "Try as Admin". Same. Then manually clear `khata-token` in DevTools.

- [ ] **Step 3: Responsive check**

DevTools → Toggle device toolbar. Test 3 widths:
- **375px (mobile):** Nav fits, Hero readable, category tiles in 2 columns, events scroll horizontally, shops stacked 1-col, demo buttons stacked, footer stacked.
- **768px (tablet):** 3-col category tiles, 2-col shop grid.
- **1280px (desktop):** 6-col category tiles in single row, 3-col shops, 3-col how-it-works, nav at full width.

At every width: no horizontal scrollbar on `<body>`, no overflowing text.

- [ ] **Step 4: Keyboard tab-through**

Click the URL bar, then press Tab repeatedly from `/`. Verify focus ring is visible (per `globals.css` `*:focus-visible`). Expected order: Khata wordmark → Sign in → Sign up → Customer CTA → Shopkeeper CTA → (featured event link if present) → each category tile → each upcoming event card → each shop card → each demo button → footer links.

- [ ] **Step 5: Production build**

Run: `cd /Users/fardin/Documents/Projects/B6A6/khata-client && npm run build`

Expected:
- Build completes without errors.
- Output shows `/` as `ƒ (Dynamic)` — NOT `○ (Static)`. (`force-dynamic` is working.)
- No "Failed to fetch" warnings from public-api (since `force-dynamic` skips build-time fetches).

- [ ] **Step 6: Lint pass**

Run: `cd /Users/fardin/Documents/Projects/B6A6/khata-client && npm run lint`

Expected: zero errors. Warnings OK if from pre-existing code.

- [ ] **Step 7: Final commit (if any cleanup needed)**

If steps 1-6 surfaced any bugs (typos, wrong hrefs, missing imports), fix them and commit:

```bash
git add <files>
git commit -m "fix(home): address verification findings"
```

Otherwise, no commit this step — the feature is done.

- [ ] **Step 8: Merge-ready check**

Run:
```bash
cd /Users/fardin/Documents/Projects/B6A6/khata-client && git status && git log --oneline -20
cd /Users/fardin/Documents/Projects/B6A6/khata-server && git status && git log --oneline -3
```

Expected: trees clean in both repos. khata-server has the Maya rename commit on top. khata-client has Tasks 2-15 commits plus any Task 16.7 fix commit.

---

## Self-review (done by plan author)

**Spec coverage:**
- 16 spec decisions → covered across Tasks 0 (seed rename), 1 (env), 2 (public-api), 3 (category-map), 4-14 (11 components), 15 (wiring), 16 (verification). Every decision is implemented.
- 11 component specs → Tasks 4-14 each map 1:1 to a component.
- Edge cases (backend down, empty seed, category mismatch, 60s cache, demo while signed in, mobile) → Task 16 Step 1 and Step 3 cover these explicitly.
- Anti-slop self-check → component code uses varied layouts (Task 9 vignettes different, Task 10 bars not cards, no icons in circles, no stock photos, no gradients).
- 8-step testing plan from spec → Task 16 steps 1-7 cover all 8.

**No placeholders:** Every step has real code or real commands with expected output. No "TBD", no "similar to X", no "add validation".

**Type consistency:**
- `DokanEvent` type defined in Task 6 (`HomeFeaturedEvent.tsx`), imported by Task 8 and Task 15.
- `Dokan` type defined in Task 11 (`HomeFeaturedShops.tsx`), imported by Task 15.
- `DesignCategory` defined in Task 3 (`category-map.ts`), imported by Tasks 7 and 15.
- `UserRole` reused from existing `@/contexts/AuthContext`.
- `fetchPublic` signature `<T>(path, init?) => Promise<T | null>` used consistently across Task 2 definition and Task 15 callers.

**Risk flagged:**
- `.env.local` must exist before Task 2 onward or SSR returns null for everything. Task 1 handles this.
- If backend isn't running during dev (Task 15 Step 4), the verification step will show empty sections. The plan calls this out — it's expected, not a failure.
- Task 0 seed rename requires re-running the seed against a reset DB. If the DB is not reset, old Aisha rows may persist. If issues appear, run `npm run db:reset && npm run seed` on khata-server (or manually truncate tables).

---

## Ready for execution

Plan is self-contained and executable. Backend (khata-server) change is isolated to Task 0; all other tasks are in khata-client with no cross-repo dependencies after that.
