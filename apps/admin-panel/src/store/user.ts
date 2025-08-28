import { LoginResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isLoggedIn: boolean;
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
        currentUser: null,
        otpSentAt: null,
        setOtpSent: () => {
          const now = Date.now();
          set({ otpSentAt: now });
        },
        clearOtp: () => set({ otpSentAt: null }),
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
