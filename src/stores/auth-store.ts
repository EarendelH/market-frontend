import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  logout: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.token),
        })),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      markHydrated: () =>
        set({
          hydrated: true,
        }),
    }),
    {
      name: "sustech-market-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate auth store", error);
        }
        state?.markHydrated();
      },
    }
  )
);
