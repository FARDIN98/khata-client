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
