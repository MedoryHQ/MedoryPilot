import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { LoginFormValues, ResponseError } from "@/types";
import { setHookFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { Button, Input, Label, Checkbox } from "../ui";
import { useToast } from "@/hooks/useToast";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/libs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { useAuthFlow } from "@/providers/AuthFlowProvider";

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const [showPassword, setShowPassword] = useState(false);
  const { setOtpSent, clearOtp, login } = useAuthStore();
  const navigate = useNavigate();
  const { setStage, setEmail, setFlow } = useAuthFlow();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "", remember: true }
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await axios.post(`/auth/login`, values);
      return data;
    },
    onSuccess: (data, variables) => {
      reset();
      toast.success(t("toast.success"), data.message[i18n.language]);
      const hasUser = Boolean(data?.data && data.data.user);
      onLoginSuccess(variables.email, !hasUser ? true : false, data);
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

  const onLoginSuccess = (
    submittedEmail: string,
    requiresOtp: boolean,
    payload?: any
  ) => {
    setFlow("login");
    setEmail(submittedEmail);
    if (requiresOtp) {
      setStage("verify-otp");
      setOtpSent(submittedEmail);
    } else {
      login({ data: { user: payload.data.user } });
      clearOtp();
      setStage("login");
      navigate("/");
    }
  };

  const onSubmit = (values: LoginFormValues) => {
    mutate(values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col justify-between space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-auth-text-primary font-medium">
          {toUpperCase(t("auth.loginForm.email"))}
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={toUpperCase(t("auth.loginForm.email"))}
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

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-auth-text-primary font-medium"
        >
          {toUpperCase(t("auth.loginForm.password"))}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={toUpperCase(t("auth.loginForm.password"))}
            disabled={isLoading}
            variant="auth"
            className={cn(
              errors.password && "border-destructive focus:ring-destructive/10"
            )}
            {...register("password", {
              required: toUpperCase(t("auth.errors.passwordRequired")),
              minLength: {
                value: 8,
                message: toUpperCase(t("auth.errors.passwordLength"))
              },
              maxLength: {
                value: 100,
                message: toUpperCase(t("auth.errors.passwordLength"))
              }
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-auth-text-secondary/50 hover:text-auth-text-secondary absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            {...register("remember")}
            disabled={isLoading}
          />
          <Label className="cursor-pointer" htmlFor="remember">
            {toUpperCase(t("auth.loginForm.remember"))}
          </Label>
        </div>
        <button
          type="button"
          onClick={() => navigate("/forget-password")}
          className="text-primary hover:text-primary/80 cursor-pointer text-sm font-medium transition-colors"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        loading={isLoading}
        size={"xl"}
        className="premium-button floating-action mt-2 w-full rounded-lg"
      >
        {toUpperCase(t("auth.loginForm.login"))}
      </Button>
    </form>
  );
};

export { LoginForm };
