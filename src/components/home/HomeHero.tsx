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
