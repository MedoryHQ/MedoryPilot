import { Form, Input, Button } from "antd";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { ResponseError } from "@/types";
import { setFormErrors } from "@/utils";
import { useAuthStore } from "@/store";
import useApp from "antd/es/app/useApp";
import { useEffect, useState } from "react";

interface Props {
  onSuccess: () => void;
  email: string;
}

const OtpVerificationForm = ({ onSuccess, email }: Props) => {
  const [form] = Form.useForm();
  const { message } = useApp();
  const { login, otpSentAt, setOtpSent } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!otpSentAt) return;
    const interval = setInterval(() => {
      const diff = 5 * 60 * 1000 - (Date.now() - otpSentAt);
      setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSentAt]);

  const resendDisabled = timeLeft > 0;

  const { mutateAsync: verifyOtp, isLoading: verifying } = useMutation({
    mutationFn: async (values: { code: string }) => {
      const { data } = await axios.post(`/auth/verify-otp`, values);
      return data;
    },
    onSuccess: (data) => {
      login({
        data: {
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        }
      });
      form.resetFields();
      onSuccess();
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, message, form);
    }
  });

  const { mutateAsync: resendOtp, isLoading: resending } = useMutation({
    mutationFn: async () => {
      await axios.post(`/auth/resend-otp`, { email });
    },
    onSuccess: () => {
      message.success("OTP resent successfully");
      setOtpSent();
    },
    onError: () => {
      message.error("Failed to resend OTP");
    }
  });

  return (
    <Form
      form={form}
      name="otp"
      layout="vertical"
      size="large"
      onFinish={verifyOtp}
    >
      <Form.Item
        name="code"
        label="Verification Code"
        rules={[{ required: true, message: "Code Required" }]}
      >
        <Input placeholder="Enter OTP code" className="rounded-lg" />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        loading={verifying}
        className="w-full rounded-lg"
      >
        Verify
      </Button>

      <Button
        type="link"
        disabled={resendDisabled}
        onClick={() => resendOtp()}
        loading={resending}
        className="mt-2 w-full"
      >
        {resendDisabled
          ? `Resend available in ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
          : "Resend OTP"}
      </Button>
    </Form>
  );
};

export default OtpVerificationForm;
