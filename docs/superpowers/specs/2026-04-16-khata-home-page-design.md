---
title: Khata Home page (`/`) — design spec
date: 2026-04-16
status: approved-for-implementation
related:
  - ~/.gstack/projects/B6A6/hasan-khata-design-20260415-161526.md (master design doc)
  - ~/.gstack/projects/B6A6/checkpoints/20260416-162211-khata-home-brainstorm-mid-section-2.md
---

## Goal

Build the public Home page at `/` — the course-demo viewer's first impression of Khata. Must render all 10 sections from the master design doc (§`/` Home, lines 524-539), wired to real backend data, with graceful degradation when backend is down or empty.

## Non-goals

- No auth-aware nav (deferred until dashboards ship — inline minimal nav only).
- No real images/photos (typography + pattern backgrounds only per anti-slop rules).
- No analytics, no newsletter, no chatbot.
- No new backend endpoints (reuse existing `/dokans` and `/dokan-events`).
- Category tiles link to `/dokan-jatra` which will 404 until that page ships. Expected.

## Demo flow (the thing we are building toward)

Course reviewer lands at `https://khata.vercel.app/` (or localhost:3000). They see:

1. A wordmark + proposition sentence (English, Fraunces serif).
2. One featured event card, full-bleed.
3. Six category tiles with live shop counts.
4. A strip of upcoming events (horizontal scroll on mobile).
5. "How Khata works" — 3 vignettes.
6. Loyalty tier bars (NEW → REGULAR → VIP).
7. A grid of 6 featured shops.
8. One testimonial quote.
9. A "Try as demo" button block.
10. A minimal footer with About / GitHub / Credit.

They click "Try as Demo Customer" → they're auto-logged-in, toast confirms, they stay on Home. Page doesn't redirect to a dashboard (those don't exist yet). Everything scrolls smoothly; nothing looks broken.

---

## Locked decisions

1. **SSR via Server Components.** `src/app/page.tsx` becomes an `async` Server Component. No client-side data fetching on Home.
2. **Page is `force-dynamic`.** `export const dynamic = 'force-dynamic'` prevents Vercel's build step from trying to reach the backend. Fetches happen per request at runtime.
3. **Parallel fetches.** Three `GET`s wrapped in `Promise.all`:
   - `GET /dokans` — for shop grid, category counts, "Shops on Khata"
   - `GET /dokan-events?upcoming=true` — for upcoming events slider
   - `GET /dokan-events?upcoming=true&featured=true` — for hero featured event

   > **Verified 2026-04-16:** `upcoming=true` and `featured=true` are the correct param names per `khata-server/src/modules/dokan-events/dokan-events.controller.ts` lines 89-90 (both use `ParseBoolPipe`). `@Get()` list endpoint on `dokans` and `dokan-events` controllers have no `@UseGuards(JwtAuthGuard)` — both are public and work without tokens.
4. **New fetcher: `src/lib/public-api.ts`.** Plain `fetch()`-based helper, not the existing `src/lib/api.ts` (which is client-only and reads localStorage). Signature:
   ```ts
   export async function fetchPublic<T>(
     path: string,
     init?: RequestInit
   ): Promise<T | null>
   ```
   Returns `null` on any failure (network error, non-2xx, JSON parse error). Logs to `console.error`. Never throws. Every caller must handle `null`.
5. **Cache hint preserved.** Even with `force-dynamic` on the page, the fetcher passes `{ next: { revalidate: 60 } }`. Harmless now, useful later if we drop `force-dynamic`.
6. **Categories are client-derived.** No new backend endpoint. We reduce over `/dokans` response to count per category. Current seed has only 2 shops (Fashion, Food) — tiles for Restaurants / Boutiques / Salons / Bakeries / Electronics / Tailors will mostly show `0 shops`. Acceptable for MVP; tiles with 0 still render. Design doc's "10 shops" assumption is aspirational.
7. **Category mapping.** Seed uses free-text (`'Fashion'`, `'Food'`). Design doc's 6 English buckets: Restaurants, Boutiques, Salons, Bakeries, Electronics, Tailors. Lookup table in `src/lib/category-map.ts`:
   ```ts
   export const CATEGORY_MAP: Record<string, DesignCategory> = {
     Fashion: 'Boutiques',
     Food: 'Restaurants',
     Cafe: 'Restaurants',
     Apparel: 'Boutiques',
     Salon: 'Salons',
     Bakery: 'Bakeries',
     Electronics: 'Electronics',
     Tailor: 'Tailors',
   };
   ```
   Unknown seed values fall into `'Other'` and are **not rendered** as tiles. The 6 English buckets always render, even with `0` count.
8. **Component-per-file layout.** Each of the 10 sections gets its own file under `src/components/home/*.tsx`. Matches existing `src/components/ui/*` convention. Keeps review diffs small.
9. **Demo button behavior.** `useAuth().login()` → stay on `/` → show toast "Signed in as <role>@khata.com". Does **not** redirect to any dashboard (those 404 today).
10. **Nav strip is inline + minimal.** Just Khata wordmark (left) + "Sign in" / "Sign up" links (right). No auth-awareness. Full app-shell nav ships with dashboards.
11. **Testimonial is hardcoded English.** One quote attributed to Maya (seeded shopkeeper). Copy: "VIP customers come back more often — now I know who they are." — Maya, Maya's Boutique.
12. **Footer GitHub link = `https://github.com/FARDIN98/khata-client`.**
13. **Hero proposition copy:** "Your shop's ledger. Your tier. Your events." (English-only per copy override line 500-508. The original "Your shop's খাতা…" in master doc §Hero is overridden by the copy-direction rule.)
14. **Seed rename prerequisite.** `khata-server/src/seed.ts` currently uses `'Aisha Rahman'` + `'Aisha's Boutique'`. Design doc canonically uses "Maya" throughout. Rename seed (Aisha → Maya) is **Step 0 of the implementation plan** — separate backend commit before any frontend work. This keeps the Home page's testimonial, demo button tooltip, and any future pages' narrative aligned with the design doc without drift.
15. **HowItWorks is typography-only.** No custom SVG illustrations. Each vignette gets a distinct typographic treatment (different accent color, different text weight, varied layout shape) to satisfy the anti-slop "varied illustration" rule without requiring generated assets. Ships tonight without asset-generation risk.
16. **Seed coverage ships as-is (2 shops).** 4 of 6 category tiles will show "0 shops yet" count. Honest early-stage state. Copy on empty tiles stays neutral: "0 shops yet" (no "coming soon" filler).

---

## Architecture

```
GET /
 └─ src/app/page.tsx  (async Server Component, force-dynamic)
     └─ Promise.all([
         fetchPublic<Dokan[]>('/dokans'),
         fetchPublic<DokanEvent[]>('/dokan-events?upcoming=true'),
         fetchPublic<DokanEvent[]>('/dokan-events?upcoming=true&featured=true')
       ])
     └─ Derive: categoryCounts, featuredEvent, upcomingEvents, featuredShops
     └─ Render:
         <HomeNav />
         <HomeHero proposition=... />
         <HomeFeaturedEvent event={featuredEvent} />
         <HomeCategoryTiles counts={categoryCounts} />
         <HomeUpcomingEvents events={upcomingEvents} />
         <HomeHowItWorks />
         <HomeLoyaltyTiers />
         <HomeFeaturedShops shops={featuredShops} />
         <HomeTestimonial />
         <HomeDemoBlock />   ← "use client" for login handler
         <HomeFooter />
```

**Why this shape:** Server Component for data fetching = zero client-side waterfalls, SEO-friendly, no hydration of 10 sections. Only the `HomeDemoBlock` needs client reactivity (button clicks + toast), so it opts into `"use client"`. The nav strip is static server-rendered but its sign-in/sign-up links are plain `<Link>`s — no client JS needed.

---

## File layout (new files)

```
khata-client/src/
  lib/
    public-api.ts          ← fetchPublic<T>() helper
    category-map.ts        ← CATEGORY_MAP + DesignCategory type
  components/home/
    HomeNav.tsx            ← wordmark + Sign in/Sign up
    HomeHero.tsx           ← proposition + dual CTA
    HomeFeaturedEvent.tsx  ← one featured event card, full-bleed
    HomeCategoryTiles.tsx  ← 6 tiles with live counts
    HomeUpcomingEvents.tsx ← horizontal-scroll event strip
    HomeHowItWorks.tsx     ← 3 vignettes
    HomeLoyaltyTiers.tsx   ← NEW/REGULAR/VIP stacked bars
    HomeFeaturedShops.tsx  ← 6-shop grid
    HomeTestimonial.tsx    ← hardcoded quote
    HomeDemoBlock.tsx      ← "use client", 3 demo buttons
    HomeFooter.tsx         ← About/GitHub/Credit
  app/
    page.tsx               ← REPLACE existing content
```

No changes outside these paths for this phase.

---

## Types

Shared on Home (will live in component files or a shared `types.ts` — defer the decision to the implementation plan):

```ts
type Dokan = {
  id: string;
  name: string;
  category: string;
  address: string;
  description: string;
  // + whatever else /dokans returns; will confirm against controller
};

type DokanEvent = {
  id: string;
  title: string;
  type: string;
  venue: string;
  scheduledAt: string; // ISO
  description: string;
  visibility: 'PUBLIC' | 'LOYALTY';
  minTier?: 'NEW' | 'REGULAR' | 'VIP';
  feeInPaisa: number;
  capacity: number;
  isFeatured: boolean;
  dokan: { id: string; name: string };
};

type DesignCategory =
  | 'Restaurants'
  | 'Boutiques'
  | 'Salons'
  | 'Bakeries'
  | 'Electronics'
  | 'Tailors';
```

> Types will be verified against the actual NestJS DTOs during implementation. If the controller returns a paginated envelope (e.g. `{ data: Dokan[], total: number }`), adapt the fetcher and callers.

---

## Component specs

### 1. `HomeNav` (server component)

**Layout:** flex row, space-between, max-w-6xl mx-auto, px-6 py-4.
**Left:** Khata wordmark in Fraunces serif, 24px, weight 600, color `var(--khata-fg)`.
**Right:** `<Link href="/login">Sign in</Link>` + `<Link href="/signup">Sign up</Link>`, 14px, gap-6.
**Mobile:** same layout, reduce padding to px-4. No hamburger (only 2 links).
**Props:** none.

### 2. `HomeHero` (server component)

**Background:** warm cream (`--khata-bg`) with subtle terra-cotta + teal geometric pattern. Pattern is an SVG asset placed in `public/patterns/khata-weave.svg` — abstract grid, not illustrative. **NOT a stock photo.**
**Layout:** left-aligned text block (max-w-3xl), 80vh min-height on desktop, padding scales down on mobile.
**Headline:** "Your shop's ledger. Your tier. Your events." Fraunces 600, clamp(32px, 6vw, 64px), line-height 1.1.
**Sub:** one sentence, 18px, `--khata-muted`: "The loyalty ledger Bangladeshi shops never had."
**CTAs:** two buttons side-by-side (mobile: stacked).
  - Primary: "Sign up as Customer" → `/signup?role=grahok`
  - Secondary: "Sign up as Shopkeeper" → `/signup?role=dokandar`
**NOT:** "Get started in seconds", "Trusted by", percentage stats, rockets.
**Props:** none (copy is hardcoded, matches design doc override).

### 3. `HomeFeaturedEvent` (server component)

**Input:** `event: DokanEvent | null` (first item from `?upcoming=true&featured=true` response).
**Null behavior:** render nothing (`return null`). Don't show empty state.
**Layout:** full-bleed section, background-color `--khata-fg` (dark), white text. No decorative gradients.
**Content:**
  - Small eyebrow label: "Featured this week"
  - Title (h2, Fraunces 600, 40px)
  - Shop name + date (meta row)
  - Badge: either "LOYALTY • VIP only" (if `visibility === 'LOYALTY'` and `minTier === 'VIP'`), "LOYALTY • REGULAR+" (if `minTier === 'REGULAR'`), or "Open to all" (if `PUBLIC`)
  - Click area → `Link href={`/events/${event.id}`}` (will 404 until event-detail page ships; acceptable)

### 4. `HomeCategoryTiles` (server component)

**Input:** `counts: Record<DesignCategory, number>`.
**Layout:** grid with gap-3.
  - Mobile: 2 cols × 3 rows
  - Tablet (md): 3 cols × 2 rows
  - Desktop (lg): 6 cols × 1 row
**Tile:** left-aligned text (NOT icon-in-colored-circle). Category name (Fraunces 500, 22px), count line below (e.g. "3 shops" or "0 shops yet"). Border radius 12px (cards scale from design doc). Hover: subtle shift in background tint.
**Click:** `Link href={`/dokan-jatra?category=${categoryLower}`}`.
**No icons in colored circles. No centered text.**

### 5. `HomeUpcomingEvents` (server component)

**Input:** `events: DokanEvent[] | null` (up to 9 from `?upcoming=true`, minus the featured one if it's the same id).
**Null/empty behavior:** render nothing.
**Layout:**
  - Mobile: horizontal scroll-snap, `overflow-x-auto`, cards are 280px wide.
  - Desktop: 3-column grid.
**Card:** type pill (rounded-full bg-accent text-xs uppercase), shop name, date (formatted "Wed, Apr 23 · 7:00 pm"), fee badge ("Free" / "৳1,500" / "VIP only" based on `feeInPaisa` and `visibility`).
**Section heading:** "Upcoming on Khata" — Fraunces 600, 32px, left-aligned.
**Click each card:** `/events/${event.id}`.

### 6. `HomeHowItWorks` (server component)

**Input:** none (static).
**Layout:** 3 vignettes, vertically stacked on mobile, 3-col grid on desktop. **Each vignette has a different visual treatment** — not 3 identical icon-in-circle cards (that's the banned AI slop pattern).
**Approach (locked per decision 15): typography-only, NO custom SVG assets.** Each vignette has a different typographic treatment so they read as varied moments, not three symmetric cards.
**Vignettes:**
  1. **"Follow a shop"** — huge Fraunces numeral "01" as a visual anchor, left-aligned. Title + 60-word blurb. Accent color: terra cotta.
  2. **"Spend or attend"** — vignette 2 drops the numeral and uses a wide horizontal rule above the title (the tier-bar motif pre-echoed). Title + 60-word blurb. Accent color: teal.
  3. **"Unlock tier-gated events"** — vignette 3 uses a small vertical stack of 3 short bars on the left (tier shapes: NEW/REGULAR/VIP) rendered in pure CSS (no SVG). Title + 60-word blurb. Accent color: saffron.
**No assets required.** Every visual element above is HTML + Tailwind utility classes. Zero generation risk.

### 7. `HomeLoyaltyTiers` (server component)

**Input:** none (static).
**Layout:** stacked horizontal bars filling full page width. **NOT three side-by-side pricing tier columns** (that's banned slop).
**Bar rows (top to bottom):**
  - NEW: short bar (25% width), muted color, label "NEW — Follow a shop to start."
  - REGULAR: medium bar (60% width), secondary color, label "REGULAR — First purchase unlocks member events."
  - VIP: full bar (100% width), primary accent, label "VIP — Unlock private previews and limited iftar tastings."
**Heading:** "How loyalty works."

### 8. `HomeFeaturedShops` (server component)

**Input:** `shops: Dokan[]` — take first 6 from `/dokans`.
**Empty behavior:** render "No shops on Khata yet — be the first." with a Sign-up-as-Shopkeeper CTA.
**Layout:** 
  - Mobile: 1 col.
  - Tablet: 2 cols.
  - Desktop: 3 cols.
**Card:** shop wordmark (text-based, derived from `dokan.name`), category pill, address line, description truncated to 2 lines. NO logos (we don't have them). NO colored left-borders.
**Click:** `Link href={`/dokan/${shop.id}`}` (404s until shop-detail page ships).

### 9. `HomeTestimonial` (server component)

**Input:** none (hardcoded).
**Layout:** centered block (the only centered section on the page — acceptable for single quote per design rules), max-w-2xl mx-auto.
**Quote:** "VIP customers come back more often — now I know who they are."
**Attribution:** "Maya, Maya's Boutique" (seed rename from Aisha → Maya is Step 0 of the implementation plan — see decision 14).
**Visual:** large serif opening quote mark, Fraunces 400.
**NO photo of smiling person.**

### 10. `HomeDemoBlock` (`"use client"`)

**Layout:** full-width section with warm background (`--khata-accent-soft`), centered content block, max-w-3xl.
**Heading:** "Try Khata in one tap."
**Buttons (3):** arranged in a row on desktop, stacked on mobile.
  - "Demo Customer" → `login('demo@khata.com', 'demo1234')`
  - "Demo Shopkeeper" → `login('shop-one@khata.bd', 'dokan123')`
  - "Demo Admin" → `login('admin@khata.com', 'admin1234')`
**On click:**
  1. Call `useAuth().login(email, password)`
  2. On success: toast "Signed in as <role>" + stay on `/`
  3. On failure: toast error + stay on `/`
**Do NOT redirect** to any dashboard route (they 404 today).
**Verified 2026-04-16:** all three credential pairs match `khata-server/src/seed.ts` (admin: line 68-69; demo customer: line 134; dokandar: line 106 + `dokan123` password line 84).

### 11. `HomeFooter` (server component)

**Layout:** 3-column flex, mobile: stacked.
**Columns:**
  - Left: Khata wordmark + tagline line + "Built for BRACU CSE470"
  - Middle: "About" (anchor), "GitHub" → `https://github.com/FARDIN98/khata-client`, "Contact" → `mailto:hasan@delineate.pro` (or whatever user prefers)
  - Right: small © line, date.
**No newsletter signup.** No social icons.

---

## Edge cases (summary — see Section 3 of brainstorm)

| Scenario | Behavior |
|---|---|
| All 3 fetches fail | Hero + static sections render; event/shop sections render empty states (no error page) |
| Partial fetch failure | Each section handles its own `null` independently |
| Empty seed (0 shops / 0 events) | Shop grid: "No shops yet" CTA. Events strip: hidden. Category tiles: all show 0. |
| Unknown category in seed | Falls to `'Other'` bucket, not rendered as a tile |
| Cache boundary at 60s | `force-dynamic` overrides — every request fetches fresh. Revalidate hint dormant. |
| Demo button while signed in | Idempotent. Token overwritten. Toast same. |
| Mobile viewport | 1-col or 2-col grids, no horizontal scroll except events strip |

---

## Testing plan (pre-ship verification)

1. `npm run dev` in both repos → navigate `/` → all 10 sections render.
2. Stop khata-server → reload `/` → empty states appear, no error boundary.
3. Click every CTA → confirm href correctness (even if destination 404s).
4. Click Demo Customer → confirm auto-login toast + stay on `/`, localStorage has token.
5. Resize 375px → 768px → 1280px → no layout breaks, no horizontal scroll except events strip.
6. `npm run build` → zero SSR errors (force-dynamic bypasses build-time fetches).
7. DevTools console on `/` → zero errors or warnings.
8. Keyboard tab through → reach Sign in, Sign up, every CTA, footer links in order.

---

## Anti-slop self-check

- [x] No purple / violet / indigo gradients (warm earth tones only)
- [x] No 3-icon-in-colored-circle feature grid (vignettes have varied illustration)
- [x] No centered everything (left-aligned body; only hero + testimonial centered, hero being a left-aligned block)
- [x] No uniform bubbly border-radius (scale: 8/12/16/999)
- [x] No decorative blobs / wavy dividers
- [x] No emoji in UI chrome
- [x] No colored left-border on cards
- [x] No generic hero copy ("unlock the power", "all-in-one")
- [x] No cookie-cutter section rhythm (varied heights, content types, densities)
- [x] No stock photos of smiling people
- [x] No "99% uptime / Trusted by / 10x faster" filler
- [x] No side-by-side pricing tier cards (loyalty tiers are stacked bars)
- [x] No mailing list popup, chatbot, social proof row

---

## Open questions — resolved this brainstorm

- Demo button behavior → auto-login + stay on Home + toast (no dashboard redirect)
- Hero copy → "Your shop's ledger. Your tier. Your events." (English-only override)
- Testimonial direction → English-only
- Footer GitHub link → `https://github.com/FARDIN98/khata-client`
- Category count strategy → client-derived from `/dokans` response
- Page rendering strategy → SSR via Server Components, `force-dynamic`

## Out of scope (deferred)

- Auth-aware nav (full app-shell ships with dashboards)
- Real shop logos / photography
- Actual illustration assets beyond the weave pattern (fallback to typography if generating 3 vignette SVGs is expensive)
- Category detail page `/dokan-jatra` (tiles link to it; it will 404 for now)
- Shop detail page `/dokan/[id]` (cards link to it; will 404)
- Event detail page `/events/[id]` (featured event + upcoming cards link; will 404)
- Pagination, filtering, search

## Next step

After approval, invoke `superpowers:writing-plans` to turn this spec into a numbered implementation plan. The plan's Step 0 will be the seed rename (Aisha → Maya) in `khata-server`, after which the khata-client Home page work proceeds in dependency order: `public-api.ts` + `category-map.ts` → individual component files → `page.tsx` replacement → verification.
