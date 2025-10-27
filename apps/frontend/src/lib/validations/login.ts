import { z } from "zod";
import { toUpperCase } from "@/utils";

export const passwordSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(8, {
      message: toUpperCase(t("auth.errors.passwordLength")),
    })
    .max(100, {
      message: toUpperCase(t("auth.errors.passwordLength")),
    })
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: toUpperCase(t("auth.errors.passwordPattern")),
    });

export const resetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: passwordSchema(t),
      confirmPassword: passwordSchema(t),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: toUpperCase(t("auth.errors.passwordMismatch")),
      path: ["confirmPassword"],
    });

export type ResetPasswordValues = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;

export const loginWithEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: toUpperCase(t("auth.errors.emailRequired")) })
      .email({ message: toUpperCase(t("auth.errors.invalidEmail")) }),
    password: passwordSchema(t),
    remember: z.boolean().default(true),
  });

export type LoginWithEmailFormValues = z.infer<
  ReturnType<typeof loginWithEmailSchema>
>;

export const loginWithPhoneSchema = (t: (key: string) => string) =>
  z.object({
    phone: z
      .string()
      .nonempty({ message: t("auth.errors.phoneRequired") })
      .regex(/^\+9955\d{8}$/, {
        message: t("auth.errors.phoneInvalid"),
      }),
    password: passwordSchema(t),
    remember: z.boolean().default(true),
  });

export type LoginWithPhoneFormValues = z.infer<
  ReturnType<typeof loginWithPhoneSchema>
>;

export const otpSchema = (t: (key: string) => string) =>
  z.object({
    code: z
      .string()
      .regex(/^\d+$/, { message: toUpperCase(t("auth.errors.onlyDigits")) })
      .min(4, { message: toUpperCase(t("auth.errors.otpRequired")) })
      .max(4, { message: toUpperCase(t("auth.errors.otpRequired")) }),
  });

export type OtpFormValues = z.infer<ReturnType<typeof otpSchema>>;

export const forgetPasswordWithEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: toUpperCase(t("auth.errors.emailRequired")) })
      .email({ message: toUpperCase(t("auth.errors.invalidEmail")) }),
  });

export type ForgetPasswordWithEmailFormValues = z.infer<
  ReturnType<typeof forgetPasswordWithEmailSchema>
>;

export const forgetPasswordWithPhoneSchema = (t: (key: string) => string) =>
  z.object({
    phone: z
      .string()
      .nonempty({ message: t("auth.errors.phoneRequired") })
      .regex(/^\+9955\d{8}$/, {
        message: t("auth.errors.phoneInvalid"),
      }),
  });

export type ForgetPasswordWithPhoneFormValues = z.infer<
  ReturnType<typeof forgetPasswordWithPhoneSchema>
>;
