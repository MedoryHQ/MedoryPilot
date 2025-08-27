import { LoginResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: LoginResponse["user"] | null;
  otpSentAt: number | null;
  setOtpSent: () => void;
  clearOtp: () => void;
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
        refreshToken: null,
        currentUser: null,
        otpSentAt: null,
        setOtpSent: () => set({ otpSentAt: Date.now() }),
        clearOtp: () => set({ otpSentAt: null }),
        login: ({ data }) => {
          set(() => ({
            isLoggedIn: true,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            currentUser: data.user,
            updatedAt: new Date().toISOString()
          }));
        },
        logout: () => {
          set(() => ({
            isLoggedIn: false,
            accessToken: null,
            refreshToken: null,
            currentUser: null,
            otpSentAt: null
          }));
        }
      };
    },
    {
      name: "portfolio-auth-store"
    }
  )
);
