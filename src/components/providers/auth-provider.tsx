"use client";

import { useEffect, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!hydrated || !token || user) {
      return;
    }

    let cancelled = false;

    apiClient
      .get<AuthUser>("/users/me")
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuth, hydrated, setUser, token, user]);

  return children;
}
