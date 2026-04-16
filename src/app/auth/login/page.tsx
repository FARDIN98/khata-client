"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { ErrorCard } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

// Demo credentials for the course-submission video viewer. Password mirrors
// whatever the seed script sets on the backend — kept in one place here so
// changing it later is a single edit.
interface DemoAccount {
  label: string; // UI label (English-only per copy override).
  email: string;
  password: string;
  role: UserRole; // for the success toast only.
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Login as Shopkeeper",
    email: "shop-one@khata.bd",
    password: "dokan123",
    role: "DOKANDAR",
  },
  {
    label: "Login as Customer",
    email: "demo@khata.com",
    password: "demo1234",
    role: "GRAHOK",
  },
  {
    label: "Login as Admin",
    email: "admin@khata.com",
    password: "admin1234",
    role: "SUPER_ADMIN",
  },
];

const roleDashboard: Record<UserRole, string> = {
  GRAHOK: "/dashboard/grahok",
  DOKANDAR: "/dashboard/dokandar",
  SUPER_ADMIN: "/admin",
};

const roleDisplayName: Record<UserRole, string> = {
  GRAHOK: "Customer",
  DOKANDAR: "Shopkeeper",
  SUPER_ADMIN: "Admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Logged in as ${roleDisplayName[user.role]} ${user.name}.`);
      router.push(roleDashboard[user.role]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError("Email or password doesn't match.");
      } else if (err instanceof TypeError) {
        // fetch TypeError == network error.
        toast.error("Network error. Check your connection.");
      } else {
        setFormError("Couldn't sign you in. Try again.");
      }
    }
  };

  const handleDemoFill = (account: DemoAccount) => {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    setFormError(null);
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold leading-tight text-khata-text">
            Khata
          </h1>
          <p className="text-[15px] text-khata-text-muted">
            Your shop&apos;s customer ledger.
          </p>
        </header>

        <section
          aria-labelledby="demo-heading"
          className="rounded-xl border border-khata-border bg-khata-surface-muted p-5"
        >
          <h2
            id="demo-heading"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-khata-text-muted"
          >
            For the demo — login as
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoFill(account)}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-between rounded-md px-4 text-sm font-medium",
                  "bg-khata-surface text-khata-text border border-khata-border",
                  "hover:border-khata-border-strong hover:bg-khata-bg",
                  "transition-colors duration-[120ms] ease-out",
                )}
              >
                <span>{account.label}</span>
                <span className="text-xs text-khata-text-muted">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-khata-text-muted">
            Tap a button to pre-fill the form, then sign in.
          </p>
        </section>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {formError && <ErrorCard message={formError} />}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-khata-text"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={cn(
                "h-10 rounded-md border px-3 text-[15px]",
                "bg-khata-surface text-khata-text placeholder:text-khata-text-soft",
                errors.email ? "border-khata-danger" : "border-khata-border",
                "focus:outline-none focus:border-khata-primary",
              )}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-khata-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-khata-text"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={cn(
                "h-10 rounded-md border px-3 text-[15px]",
                "bg-khata-surface text-khata-text placeholder:text-khata-text-soft",
                errors.password ? "border-khata-danger" : "border-khata-border",
                "focus:outline-none focus:border-khata-primary",
              )}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-khata-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "mt-2 inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium",
              "bg-khata-primary text-khata-text-on-dark",
              "hover:bg-khata-primary-hover",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "transition-colors duration-[120ms] ease-out",
              "active:scale-[0.98]",
            )}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-khata-text-muted">
          New?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-khata-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
