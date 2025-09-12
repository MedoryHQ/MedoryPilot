import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useForm, Controller } from "react-hook-form";
import axios from "@/api/axios";
import { LoginStage, ResponseError } from "@/types";
import { setHookFormErrors, toUpperCase } from "@/utils";
import { useAuthStore } from "@/store";
import { useTranslation } from "react-i18next";
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "../ui";
import { useToast } from "@/hooks";
import { cn } from "@/libs";
import { useNavigate } from "react-router-dom";

interface Props {
  setLoginState?: React.Dispatch<React.SetStateAction<LoginStage>>;
  email: string;
}

type FormValues = {
  code: string;
};

// TODO: transform to 5 minutes
const OTP_TTL_MS = 0.5 * 60 * 1000;

const parseSentAt = (raw: string | null): number | null => {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isNaN(n) && n > 0) return n;
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return parsed;
  return null;
};

const OtpVerificationForm = ({ setLoginState, email }: Props) => {
  const { login, otpSentAt, setOtpSent, clearOtp } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: { code: "" }
  });

  const handleOtpSuccess = () => {
    if (setLoginState) {
      setLoginState({ stage: "login", email: "" });
    }
    sessionStorage.removeItem("stage");
    sessionStorage.removeItem("email");
    navigate("/");
  };

  const getCanonicalSentAt = (): number | null => {
    if (otpSentAt) return otpSentAt;
    try {
      const raw = sessionStorage.getItem("otpSentAt");
      return parseSentAt(raw);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const sent = getCanonicalSentAt();
    if (!sent) {
      setTimeLeft(0);
      return;
    }

    const alreadyExpired = Date.now() - sent >= OTP_TTL_MS;
    if (alreadyExpired) {
      clearOtp();
      setTimeLeft(0);
      return;
    }

    const update = () => {
      const diffMs = OTP_TTL_MS - (Date.now() - sent);
      const secs = diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
      setTimeLeft(secs);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [otpSentAt, clearOtp]);

  const resendDisabled = timeLeft > 0;

  const { mutateAsync: verifyOtp, isLoading: verifying } = useMutation({
    mutationFn: async (values: { code: string }) => {
      const { data } = await axios.post(`/auth/verify-otp`, values);
      return data;
    },
    onSuccess: (data) => {
      toast.success(t("toast.success"), data.message[i18n.language]);
      login({
        data: {
          user: data.data.user
        }
      });
      reset();
      setLocalError(null);
      handleOtpSuccess();
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

  const { mutateAsync: resendOtp, isLoading: resending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/auth/resend-otp`, { email });
      return data;
    },
    onSuccess: (data) => {
      toast.success(t("toast.success"), data.message[i18n.language]);
      setOtpSent(email);
      setTimeLeft(Math.ceil(OTP_TTL_MS / 1000));
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

  const onSubmit = async (values: FormValues) => {
    const code = values.code ?? "";
    if (code.length !== 4) {
      setError("code", { message: toUpperCase(t("auth.errors.otpRequired")) });
      setLocalError(t("auth.errors.otpRequired"));
      return;
    }

    setLocalError(null);
    try {
      await verifyOtp({ code });
    } catch {
      setLocalError(t("auth.errors.invalidOTP"));
    }
  };

  return (
    <div className="flex h-full justify-center">
      <div className="w-[calc(100%-46px)] sm:w-[346px] lg:w-[420px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col justify-between rounded-2xl p-4 sm:p-6"
        >
          <p className="text-auth-text-secondary mb-5 text-sm">
            {toUpperCase(t("auth.otpForm.codeSentAt"))}{" "}
            <span className="text-auth-text-primary font-medium">{email}</span>
          </p>

          <div className={cn("!mb-4")}>
            <Controller
              control={control}
              name="code"
              rules={{
                required: toUpperCase(t("auth.errors.otpRequired")),
                validate: (val) =>
                  (val && val.length === 4) ||
                  toUpperCase(t("auth.errors.otpRequired"))
              }}
              render={({ field }) => {
                return (
                  <>
                    <InputOTP
                      maxLength={4}
                      value={field.value}
                      onChange={(newValue: string) => {
                        field.onChange(newValue);
                        if (newValue.length === 4 && localError)
                          setLocalError(null);
                        if (newValue.length === 4 && errors.code) {
                          clearErrors("code");
                        }
                      }}
                      autoFocus
                      className="input-otp"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="input-otp-slot" />
                        <InputOTPSlot index={1} className="input-otp-slot" />
                        <InputOTPSlot index={2} className="input-otp-slot" />
                        <InputOTPSlot index={3} className="input-otp-slot" />
                      </InputOTPGroup>
                    </InputOTP>

                    <div className="mt-2">
                      {errors.code?.message ? (
                        <p className="text-destructive text-sm">
                          {errors.code.message}
                        </p>
                      ) : localError ? (
                        <p className="text-destructive text-sm">{localError}</p>
                      ) : null}
                    </div>
                  </>
                );
              }}
            />
          </div>

          <footer>
            <Button
              type="submit"
              loading={verifying}
              className="premium-button floating-action mt-2 mb-3 w-full rounded-lg"
              size={"xl"}
              disabled={verifying || (control && (errors.code ? true : false))}
            >
              {toUpperCase(t("auth.otpForm.verify"))}
            </Button>

            <button
              type="button"
              onClick={() => resendOtp()}
              disabled={resendDisabled || resending}
              className={cn(
                "mt-2 w-full cursor-pointer !text-[12px] sm:!text-[16px]",
                resendDisabled || resending
                  ? "cursor-not-allowed opacity-50"
                  : "text-primary hover:text-primary/90"
              )}
            >
              {toUpperCase(
                resendDisabled
                  ? `${t("auth.otpForm.resendAvialible")} ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")} ${t("auth.otpForm.inMin")}`
                  : t("auth.otpForm.resend")
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export { OtpVerificationForm };
