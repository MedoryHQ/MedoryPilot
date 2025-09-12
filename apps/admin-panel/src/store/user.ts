import { LoginResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  isLoggedIn: boolean;
  currentUser: LoginResponse["user"] | null;
  otpSentAt: number | null;
  setOtpSent: (email?: string) => void;
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
        setOtpSent: (email?: string) => {
          const now = Date.now();
          try {
            sessionStorage.setItem("auth_stage_login", "verify-otp");
            sessionStorage.setItem("otpSentAt", String(now));
            if (email)
              sessionStorage.setItem("auth_email_login", String(email));
          } catch (e) {
            console.warn("sessionStorage not available", e);
          }
          set({ otpSentAt: now });
        },
        clearOtp: () => {
          try {
            sessionStorage.removeItem("auth_stage_login");
            sessionStorage.removeItem("auth_email_login");
            sessionStorage.removeItem("otpSentAt");
          } catch (e) {
            // noop
          }
          set({ otpSentAt: null });
        },
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
