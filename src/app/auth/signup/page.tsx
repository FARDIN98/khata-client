"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Store, User as UserIcon } from "lucide-react";

import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { ErrorCard } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";

// Only Customer / Shopkeeper signup. Admins are seeded server-side.
const signupSchema = z.object({
  name: z.string().min(2, "Tell us your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  role: z.enum(["GRAHOK", "DOKANDAR"]),
});

type SignupValues = z.infer<typeof signupSchema>;

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

interface RoleTile {
  value: "GRAHOK" | "DOKANDAR";
  label: string;
  description: string;
  icon: typeof Store;
}

const ROLE_TILES: RoleTile[] = [
  {
    value: "GRAHOK",
    label: "Customer",
    description: "Follow shops, earn tiers, book events.",
    icon: UserIcon,
  },
  {
    value: "DOKANDAR",
    label: "Shopkeeper",
    description: "Keep a customer ledger, run loyalty events.",
    icon: Store,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "GRAHOK",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: SignupValues) => {
    setFormError(null);
    try {
      const user = await signup(values);
      toast.success(`Welcome to Khata, ${user.name}.`);
      router.push(roleDashboard[user.role]);
    } catch (err) {
      if (err instanceof ApiError) {
        // 409 == email already taken (most common 4xx on register).
        setFormError(
          err.status === 409
            ? "That email is already in use. Try signing in instead."
            : err.message,
        );
      } else if (err instanceof TypeError) {
        toast.error("Network error. Check your connection.");
      } else {
        setFormError("Couldn't create your account. Try again.");
      }
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold leading-tight text-khata-text">
            Create your Khata account
          </h1>
          <p className="text-[15px] text-khata-text-muted">
            One ledger for every shop you love — or every customer you serve.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {formError && <ErrorCard message={formError} />}

          {/* Role tiles — Customer default. */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-khata-text">
              I am a…
            </legend>
            <div
              role="radiogroup"
              aria-label="Account type"
              className="grid grid-cols-2 gap-3"
            >
              {ROLE_TILES.map((tile) => {
                const active = selectedRole === tile.value;
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() =>
                      setValue("role", tile.value, { shouldValidate: true })
                    }
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left",
                      "transition-colors duration-[120ms] ease-out",
                      active
                        ? "border-khata-primary bg-khata-primary-soft"
                        : "border-khata-border bg-khata-surface hover:border-khata-border-strong",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        active ? "text-khata-primary" : "text-khata-text-muted",
                      )}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-khata-text">
                        {tile.label}
                      </span>
                      <span className="text-xs leading-5 text-khata-text-muted">
                        {tile.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Hidden actual input keeps RHF in sync; tiles drive setValue. */}
            <input type="hidden" {...register("role")} />
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-khata-text"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={cn(
                "h-10 rounded-md border px-3 text-[15px]",
                "bg-khata-surface text-khata-text placeholder:text-khata-text-soft",
                errors.name ? "border-khata-danger" : "border-khata-border",
                "focus:outline-none focus:border-khata-primary",
              )}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-khata-danger">
                {errors.name.message}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
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
            {isSubmitting
              ? "Creating account…"
              : `Create ${roleDisplayName[selectedRole]} account`}
          </button>
        </form>

        <p className="text-sm text-khata-text-muted">
          Have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-khata-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
