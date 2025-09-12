import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Button, Input, Label } from "../ui";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/useToast";
import { setHookFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { cn } from "@/libs";
import {
  resetPasswordSchema,
  ResetPasswordValues
} from "@/validations/authSchema";

interface Props {
  email: string;
  onSuccess: () => void;
  code: string;
}

const PasswordResetForm = ({ email, onSuccess, code }: Props) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  const newPasswordValue = watch("newPassword");

  const { mutateAsync } = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      const { data } = await axios.post("/auth/password-reset", {
        email,
        code,
        password: values.newPassword
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(t("toast.success"), data.message[i18n.language]);
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      setHookFormErrors(
        error,
        toast,
        t,
        i18n.language as "ka" | "en",
        () => {}
      );
    }
  });

  const onSubmit = (values: ResetPasswordValues) => {
    mutateAsync(values);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500"
  ];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const passwordStrength = getPasswordStrength(newPasswordValue);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6 text-center">
        <p className="text-auth-text-secondary text-[10px] sm:text-[12px] md:text-sm">
          {toUpperCase(t("auth.resetPassword.settingFor"))}{" "}
          <span className="text-auth-text-primary font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-auth-text-primary">
          {toUpperCase(t("auth.resetPassword.newPassword"))}
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            placeholder={toUpperCase(t("auth.resetPassword.newPassword"))}
            disabled={isSubmitting}
            variant="auth"
            {...register("newPassword")}
            className={cn(
              errors.newPassword &&
                "border-destructive focus:ring-destructive/10",
              "pr-12"
            )}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="text-auth-text-secondary/50 hover:text-auth-text-secondary absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
            disabled={isSubmitting}
          >
            {showNewPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {newPasswordValue && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < passwordStrength
                      ? strengthColors[passwordStrength - 1]
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <p className="text-auth-text-secondary mt-1.5 text-xs">
              {toUpperCase(t("auth.resetPassword.strength"))}:{" "}
              {passwordStrength > 0
                ? strengthLabels[passwordStrength - 1]
                : "None"}
            </p>
          </div>
        )}
        {errors.newPassword && (
          <p className="text-destructive text-sm">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirm-password"
          className="text-auth-text-primary font-medium"
        >
          {toUpperCase(t("auth.resetPassword.confirmPassword"))}
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={toUpperCase(t("auth.resetPassword.confirmPassword"))}
            disabled={isSubmitting}
            variant="auth"
            {...register("confirmPassword")}
            className={cn(
              errors.confirmPassword &&
                "border-destructive focus:ring-destructive/10",
              "pr-12"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-auth-text-secondary/50 hover:text-auth-text-secondary absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
            disabled={isSubmitting}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        size="xl"
        className="premium-button floating-action mt-2 w-full rounded-lg"
        disabled={isSubmitting}
      >
        {toUpperCase(t("auth.resetPassword.updatePassword"))}
      </Button>
    </form>
  );
};

export { PasswordResetForm };
