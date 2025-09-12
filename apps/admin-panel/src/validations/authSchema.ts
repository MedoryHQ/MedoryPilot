import { z } from "zod";
import { toUpperCase } from "@/utils";

export const passwordSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(8, {
      message: toUpperCase(t("auth.errors.passwordLength"))
    })
    .max(100, {
      message: toUpperCase(t("auth.errors.passwordLength"))
    })
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: toUpperCase(t("auth.errors.passwordPattern"))
    });

export const resetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: passwordSchema(t),
      confirmPassword: passwordSchema(t)
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: toUpperCase(t("auth.errors.passwordMismatch")),
      path: ["confirmPassword"]
    });

export type ResetPasswordValues = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;

export const loginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: toUpperCase(t("auth.errors.emailRequired")) })
      .email({ message: toUpperCase(t("auth.errors.invalidEmail")) }),
    password: passwordSchema(t),
    remember: z.boolean().default(true)
  });

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;

export const otpSchema = (t: (key: string) => string) =>
  z.object({
    code: z
      .string()
      .regex(/^\d+$/, { message: toUpperCase(t("auth.errors.onlyDigits")) }) // ✅ only digits allowed
      .min(4, { message: toUpperCase(t("auth.errors.otpRequired")) })
      .max(4, { message: toUpperCase(t("auth.errors.otpRequired")) })
  });

export type OtpFormValues = z.infer<ReturnType<typeof otpSchema>>;

export const forgetPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: toUpperCase(t("auth.errors.emailRequired")) })
      .email({ message: toUpperCase(t("auth.errors.invalidEmail")) })
  });

export type ForgetPasswordFormValues = z.infer<
  ReturnType<typeof forgetPasswordSchema>
>;
