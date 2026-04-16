import clsx, { type ClassValue } from "clsx";

/**
 * Conditional className helper. Thin wrapper around clsx so callers don't
 * need to import it directly across every component.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
