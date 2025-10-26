import { LoginResponse } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_OTP_TTL_MS = 5 * 60 * 1000;

type AuthStore = {
  isLoggedIn: boolean;
  currentUser: LoginResponse["user"] | null;
  otpSentAt: string | null;
  otpExpiresAt?: string | null;
  phoneNumber?: string;
  updatedAt?: string | null;

  login: (data: { data: LoginResponse }) => void;
  logout: () => void;
  verify: () => void;
  setOtpSentAt: (timestamp: string | null) => void;
  setPhoneNumber: (phone: string) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      currentUser: null,
      otpSentAt: null,
      otpExpiresAt: null,
      phoneNumber: undefined,
      updatedAt: null,

      login: ({ data }) => {
        const rawExpires: string | undefined = data?.user?.smsCodeExpiresAt;

        let otpSentIso: string | null = null;
        let otpExpiresIso: string | null = null;

        if (rawExpires) {
          try {
            otpExpiresIso = new Date(rawExpires).toISOString();
          } catch {
            otpExpiresIso = null;
          }
        }
        if (!otpSentIso && otpExpiresIso) {
          const expiresTs = new Date(otpExpiresIso).getTime();
          const sentTs = expiresTs - DEFAULT_OTP_TTL_MS;
          otpSentIso = new Date(sentTs).toISOString();
        }

        set(() => ({
          isLoggedIn: true,
          currentUser: data.user,
          otpSentAt: otpSentIso,
          otpExpiresAt: otpExpiresIso,
          phoneNumber: data.user?.phoneNumber ?? undefined,
          updatedAt: new Date().toISOString(),
        }));
      },

      logout: () => {
        set(() => ({
          isLoggedIn: false,
          currentUser: null,
          otpSentAt: null,
          otpExpiresAt: null,
          phoneNumber: undefined,
          updatedAt: new Date().toISOString(),
        }));
      },

      verify: () => {
        set((state) => ({
          currentUser: state.currentUser
            ? ({
                ...state.currentUser,
                verified: true,
              } as LoginResponse["user"])
            : null,
          updatedAt: new Date().toISOString(),
        }));
      },

      setOtpSentAt: (iso) => {
        set(() => ({ otpSentAt: iso, updatedAt: new Date().toISOString() }));
      },

      setPhoneNumber: (phone) => {
        set(() => ({
          phoneNumber: phone,
          updatedAt: new Date().toISOString(),
        }));
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        otpSentAt: state.otpSentAt,
        otpExpiresAt: state.otpExpiresAt,
        phoneNumber: state.phoneNumber,
        updatedAt: state.updatedAt,
      }),
    }
  )
);
