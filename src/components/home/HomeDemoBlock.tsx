"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: UserRole;
  roleLabel: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Try as Customer",
    email: "demo@khata.com",
    password: "demo1234",
    role: "GRAHOK",
    roleLabel: "Customer",
  },
  {
    label: "Try as Shopkeeper",
    email: "shop-one@khata.bd",
    password: "dokan123",
    role: "DOKANDAR",
    roleLabel: "Shopkeeper",
  },
  {
    label: "Try as Admin",
    email: "admin@khata.com",
    password: "admin1234",
    role: "SUPER_ADMIN",
    roleLabel: "Admin",
  },
];

/**
 * One-tap demo login block. After login, stay on / (dashboard routes 404
 * until later phases). Toast confirms the signed-in role.
 */
export function HomeDemoBlock() {
  const { login } = useAuth();
  const [pending, setPending] = useState<string | null>(null);

  const handleLogin = async (account: DemoAccount) => {
    setPending(account.email);
    try {
      await login(account.email, account.password);
      toast.success(`Signed in as ${account.roleLabel}`, {
        description: account.email,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="bg-khata-primary-soft">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-display text-2xl font-semibold text-khata-text md:text-3xl">
          Try Khata in one tap.
        </h2>
        <p className="mt-2 text-sm text-khata-text-muted md:text-base">
          Demo accounts for the course-submission viewer. No signup needed.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => {
            const isPending = pending === account.email;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => handleLogin(account)}
                disabled={pending !== null}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-md border border-khata-border-strong bg-khata-surface px-4 text-sm font-medium text-khata-text transition-colors",
                  "hover:bg-khata-bg disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {isPending ? "Signing in…" : account.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
