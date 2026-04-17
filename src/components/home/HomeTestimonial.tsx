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
