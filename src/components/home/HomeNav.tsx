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
