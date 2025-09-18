import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SessionUser = {
  id?: number;
  username: string;
  name?: string;
};

type AuthState = {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth@jtech-tasklist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
