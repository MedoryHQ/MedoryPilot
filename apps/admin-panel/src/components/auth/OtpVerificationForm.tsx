import { Form, Button } from "antd";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { ResponseError } from "@/types";
import { returnError, setFormErrors, toUpperCase } from "@/utils";
import { useAuthStore } from "@/store";
import useApp from "antd/es/app/useApp";
import { useEffect, useState } from "react";
import { InputOTP } from "antd-input-otp";
import { useTranslation } from "react-i18next";

interface Props {
  onSuccess: () => void;
  email: string;
}

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

const OtpVerificationForm = ({ onSuccess, email }: Props) => {
  const [form] = Form.useForm();
  const { message } = useApp();
  const { login, otpSentAt, setOtpSent, clearOtp } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { t, i18n } = useTranslation();
  const [codeArray, setCodeArray] = useState<string[]>(Array(4).fill(""));
  const [localError, setLocalError] = useState<string | null>(null);

  const code = codeArray.join("").trim();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpSentAt]);

  const resendDisabled = timeLeft > 0;

  useEffect(() => {
    if (code.length === 4 && localError) setLocalError(null);
  }, [code, localError]);

  const { mutateAsync: verifyOtp, isLoading: verifying } = useMutation({
    mutationFn: async (values: { code: string }) => {
      const { data } = await axios.post(`/auth/verify-otp`, values);
      return data;
    },
    onSuccess: (data) => {
      message.success(toUpperCase(data.message[i18n.language]));
      login({
        data: {
          user: data.data.user
        }
      });
      form.resetFields();
      setCodeArray(Array(4).fill(""));
      setLocalError(null);
      onSuccess();
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, message, form);
    }
  });

  const { mutateAsync: resendOtp, isLoading: resending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/auth/resend-otp`, { email });
      return data;
    },
    onSuccess: (data) => {
      message.success(data.message[i18n.language]);
      setOtpSent(email);
      setTimeLeft(Math.ceil(OTP_TTL_MS / 1000));
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, message, form);
      returnError(error, "OTP verification failed");
    }
  });

  const handleSubmit = async () => {
    if (code.length !== 4) {
      setLocalError(t("auth.errors.otpRequired"));
      return;
    }
    setLocalError(null);
    try {
      await verifyOtp({ code });
    } catch (err) {
      setLocalError(t("auth.errors.invalidOTP"));
    }
  };

  const handleOtpChange = (val: string[]) => {
    const cleaned = (val || [])
      .slice(0, 4)
      .map((s) => (s ?? "").toString().replace(/\D/g, ""));
    while (cleaned.length < 4) cleaned.push("");
    setCodeArray(cleaned);
  };

  return (
    <div className="flex h-full justify-center">
      <div className="w-[calc(100%-46px)] sm:w-[346px]">
        <Form
          form={form}
          name="otp"
          layout="vertical"
          size="large"
          onFinish={handleSubmit}
          className="flex h-full flex-col justify-between rounded-2xl bg-white p-4 sm:p-6"
        >
          <Form.Item
            label={toUpperCase(t("auth.otpForm.verificationCode"))}
            validateStatus={
              localError ? "error" : code.length === 4 ? "success" : undefined
            }
            help={localError ?? undefined}
            className="!mb-4"
          >
            <InputOTP
              autoFocus
              length={4}
              inputType="numeric"
              size="large"
              value={codeArray}
              onChange={handleOtpChange}
              placeholder=""
            />
          </Form.Item>
          <footer>
            <Button
              type="primary"
              htmlType="submit"
              loading={verifying}
              className="mt-2 w-full rounded-lg"
              disabled={code.length !== 4}
            >
              {toUpperCase(t("auth.otpForm.verify"))}
            </Button>

            <Button
              type="link"
              disabled={resendDisabled}
              onClick={() => resendOtp()}
              loading={resending}
              className="mt-2 w-full !text-[12px] sm:!text-[16px]"
            >
              {toUpperCase(
                resendDisabled
                  ? `${t("auth.otpForm.resendAvialible")} ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")} ${t("auth.otpForm.inMin")}`
                  : t("auth.otpForm.resend")
              )}
            </Button>
          </footer>
        </Form>
      </div>
    </div>
  );
};

export default OtpVerificationForm;
