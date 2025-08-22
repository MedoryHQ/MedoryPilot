import { LoginResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isLoggedIn: boolean;
  accessToken: string | null;
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
        accessToken: null,
        currentUser: null,
        login: ({ data }) => {
          set(() => ({
            isLoggedIn: true,
            accessToken: data.accessToken,
            currentUser: data.user,
            updatedAt: new Date().toISOString()
          }));
        },
        logout: () => {
          set(() => ({
            isLoggedIn: false,
            accessToken: null,
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
