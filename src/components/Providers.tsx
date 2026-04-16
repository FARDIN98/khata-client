"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Client-side provider stack. Server layout can't host AuthProvider or the
 * Sonner Toaster directly, so they live here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-hind-siliguri), system-ui, sans-serif",
          },
        }}
      />
    </AuthProvider>
  );
}
