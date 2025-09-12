export type LoginFormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

export type ForgetPasswordValues = {
  email: string;
};

export type LoginStageValue = "login" | "verify-otp";

export interface LoginFlowState {
  stage: LoginStageValue;
  email?: string;
}

export type ForgotStageValue =
  | "forgot-password"
  | "forgot-password-otp"
  | "new-password";

export interface ForgetPasswordFlowState {
  stage: ForgotStageValue;
  email?: string;
}
