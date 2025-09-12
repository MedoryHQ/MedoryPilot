import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import {
  ForgetPasswordFlowState,
  ForgetPasswordValues,
  ResponseError
} from "@/types";
import { setHookFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { Button, Input, Label } from "../ui";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Mail } from "lucide-react";
import { cn } from "@/libs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Dispatch, SetStateAction } from "react";

const ForgetPasswordForm = ({
  setStage
}: {
  setStage: Dispatch<SetStateAction<ForgetPasswordFlowState>>;
}) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const { setOtpSent, clearOtp } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<ForgetPasswordValues>({
    defaultValues: { email: "" }
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: ForgetPasswordValues) => {
      const { data } = await axios.post(`/auth/forgot-password`, values);
      return data;
    },
    onSuccess: (data, variables) => {
      reset();
      toast.success(t("toast.success"), data.message[i18n.language]);
      onForgetPasswordSuccess(variables.email);
    },
    onError: (error: ResponseError) => {
      setHookFormErrors(
        error,
        toast,
        t,
        i18n.language as "ka" | "en",
        setError
      );
    }
  });

  const onForgetPasswordSuccess = (submittedEmail: string) => {
    setStage({
      stage: "forgot-password-otp",
      email: submittedEmail
    });
    setOtpSent(submittedEmail);
  };

  const onSubmit = (values: ForgetPasswordValues) => {
    mutate(values);
  };

  const onBackToLogin = () => {
    clearOtp();
    navigate("/login");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col justify-between space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-auth-text-primary font-medium">
          {toUpperCase(t("auth.forgetPassword.email"))}
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={toUpperCase(t("auth.forgetPassword.email"))}
            disabled={isLoading}
            variant="auth"
            className={cn(
              errors.email && "border-destructive focus:ring-destructive/10"
            )}
            {...register("email", {
              required: toUpperCase(t("auth.errors.emailRequired")),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: toUpperCase(t("auth.errors.invalidEmail"))
              }
            })}
          />
          <Mail className="text-auth-text-secondary/50 absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2" />
        </div>
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        loading={isLoading}
        size={"xl"}
        className="premium-button floating-action mt-2 w-full rounded-lg"
      >
        {toUpperCase(t("auth.forgetPassword.send"))}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onBackToLogin}
        className="border-auth-input-border text-auth-text-secondary hover:text-auth-text-primary hover:bg-muted/50 h-11 w-full rounded-xl"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {toUpperCase(t("auth.forgetPassword.backToLogin"))}
      </Button>
    </form>
  );
};

export { ForgetPasswordForm };
