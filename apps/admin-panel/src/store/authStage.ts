import { LoginFlowState, ForgetPasswordFlowState } from "@/types";
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface AuthStageStore {
  loginStage: LoginFlowState;
  forgetPasswordStage: ForgetPasswordFlowState;
  otpSentAt: number | null;

  setLoginStage: (state: LoginFlowState) => void;
  setForgetPasswordStage: (state: ForgetPasswordFlowState) => void;
  setOtpSent: (email?: string) => void;
  clearOtp: () => void;
  resetStages: () => void;
}

const sessionStorageForZustand: PersistStorage<AuthStageStore> = {
  getItem: (name) => {
    const value = sessionStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name, value) => {
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => sessionStorage.removeItem(name)
};

export const useAuthStageStore = create<AuthStageStore>()(
  persist(
    (set) => ({
      loginStage: { stage: "login", email: "" },
      forgetPasswordStage: { stage: "forgot-password", email: "", code: null },
      otpSentAt: null,

      setLoginStage: (loginStage) => set({ loginStage }),
      setForgetPasswordStage: (forgetPasswordStage) =>
        set({ forgetPasswordStage }),

      setOtpSent: (email?: string) => {
        const now = Date.now();
        try {
          if (email) sessionStorage.setItem("email", String(email));
          sessionStorage.setItem("otpSentAt", btoa(String(now)));
        } catch {
          //
        }
        set({ otpSentAt: now });
      },

      clearOtp: () => {
        try {
          sessionStorage.removeItem("otpSentAt");
        } catch {
          //
        }
        set({ otpSentAt: null });
      },

      resetStages: () =>
        set({
          loginStage: { stage: "login", email: "" },
          forgetPasswordStage: {
            stage: "forgot-password",
            email: "",
            code: null
          },
          otpSentAt: null
        })
    }),
    {
      name: "auth-stage-store",
      storage: sessionStorageForZustand
    }
  )
);
