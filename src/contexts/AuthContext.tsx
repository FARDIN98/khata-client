"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, clearToken, setToken } from "@/lib/api";

/**
 * Backend role enum values — intentionally NOT "Customer" / "Shopkeeper".
 * These travel over the wire; UI-facing labels are mapped at the view layer.
 */
export type UserRole = "GRAHOK" | "DOKANDAR" | "SUPER_ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate from localStorage token on mount.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }
      const token = window.localStorage.getItem("khata-token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Probe /auth/me without redirecting on 401 — stale token is expected.
        const me = await api.get<User>("/auth/me", { skipAuthRedirect: true });
        if (!cancelled) setUser(me);
      } catch {
        // Bad/expired token — drop it. Don't redirect; user is anonymous now.
        clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>(
        "/auth/login",
        { email, password },
        { skipAuth: true },
      );
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const signup = useCallback(async (input: SignupInput) => {
    const res = await api.post<AuthResponse>("/auth/register", input, {
      skipAuth: true,
    });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
