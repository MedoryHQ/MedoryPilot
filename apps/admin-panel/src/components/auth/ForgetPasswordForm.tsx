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
import { Mail } from "lucide-react";
import { cn } from "@/libs";
import { useAuthStageStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgetPasswordSchema } from "@/validations/authSchema";

const ForgetPasswordForm = ({
  setStage
}: {
  setStage: (state: ForgetPasswordFlowState) => void;
}) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const { setOtpSent } = useAuthStageStore();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<ForgetPasswordValues>({
    resolver: zodResolver(forgetPasswordSchema(t)),
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
    </form>
  );
};

export { ForgetPasswordForm };
