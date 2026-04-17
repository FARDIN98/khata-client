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
