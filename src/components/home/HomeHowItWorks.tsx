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
