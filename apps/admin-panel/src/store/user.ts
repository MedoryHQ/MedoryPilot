import { LoginResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isLoggedIn: boolean;
  currentUser: LoginResponse["user"] | null;
  login: (data: { data: LoginResponse }) => void;
  logout: () => void;
  updatedAt?: string;
}

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => {
      return {
        isLoggedIn: false,
        currentUser: null,
        login: ({ data }) => {
          set(() => ({
            isLoggedIn: true,
            currentUser: data.user,
            updatedAt: new Date().toISOString()
          }));
        },
        logout: () => {
          set(() => ({
            isLoggedIn: false,
            currentUser: null
          }));
        }
      };
    },
    {
      name: "portfolio-auth-store"
    }
  )
);
