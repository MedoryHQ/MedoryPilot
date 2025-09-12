export type LoginFormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

export type ForgetPasswordValues = {
  email: string;
};

export type PasswordResetValues = {
  password: string;
  repeatPassword: string;
};

export type LoginStageValue = "login" | "verify-otp";

export type ForgotStageValue =
  | "forgot-password"
  | "forgot-password-otp"
  | "new-password";
export interface LoginFlowState {
  stage: LoginStageValue;
  email?: string;
}

export interface ForgetPasswordFlowState {
  stage: ForgotStageValue;
  email?: string;
  code?: string | null;
}
