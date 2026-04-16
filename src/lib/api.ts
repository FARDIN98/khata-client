/**
 * Typed fetch wrapper for the Khata backend.
 *
 * - Reads JWT from localStorage under `khata-token`.
 * - Injects Bearer token on every request.
 * - On 401: clears token + redirects to /auth/login.
 * - Base URL from NEXT_PUBLIC_API_URL (e.g. http://localhost:3001).
 *
 * Client-only — every accessor guards `typeof window` because Next.js may
 * import this transitively from a server component during type-checking.
 */

export const TOKEN_STORAGE_KEY = "khata-token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  /** Skip JWT injection (e.g. for /auth/login + /auth/register). */
  skipAuth?: boolean;
  /** Skip the 401-redirect side effect (e.g. /auth/me hydration probe). */
  skipAuthRedirect?: boolean;
  signal?: AbortSignal;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!options.skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  // 401 — clear token + redirect, unless caller opts out (auth probes).
  if (response.status === 401) {
    if (!options.skipAuthRedirect && typeof window !== "undefined") {
      clearToken();
      // Avoid loop if user is already on the login page.
      if (!window.location.pathname.startsWith("/auth/login")) {
        window.location.assign("/auth/login");
      }
    }
  }

  // Surface non-2xx as ApiError with parsed JSON body where possible.
  if (!response.ok) {
    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch {
      parsed = undefined;
    }
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : undefined) ?? response.statusText ?? "Request failed";
    throw new ApiError(message, response.status, parsed);
  }

  // 204 No Content — return undefined cast to T (caller's responsibility).
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
