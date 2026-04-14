"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((s) => s.logout);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setHydrating(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await apiClient.get<AuthUser>("/users/me");
        if (cancelled) return;
        setUser(me);
        useAuthStore.setState({ isAuthenticated: true, token, user: me, isHydrating: false });
      } catch {
        if (cancelled) return;
        logout();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logout, setHydrating, setUser]);

  return <>{children}</>;
}
