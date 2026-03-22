import { create } from "zustand";

export interface AuthUser {
  id: number;
  username: string;
  sustech_email: string;
  avatar_url?: string | null;
  bio?: string | null;
  role?: string;
  status?: string;
  reputation_trade?: number;
  reputation_skill?: number;
  trade_count?: number;
  skill_count?: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True until we finish checking localStorage token against /users/me */
  isHydrating: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setHydrating: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  isHydrating: true,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true, isHydrating: false });
  },

  setUser: (user) => set({ user }),

  setHydrating: (v) => set({ isHydrating: v }),

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isHydrating: false });
  },
}));
