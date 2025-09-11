import { Form, Input, Checkbox } from "antd";
import { useMutation } from "react-query";
import { LoginFormValues, ResponseError } from "@/types";
import { setFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import { useTranslation } from "react-i18next";
import { Button } from "../ui";
import { useToast } from "@/hooks/useToast";
import { Mail } from "lucide-react";

interface Props {
  onSuccess: (email: string, requiresOtp: boolean, payload?: any) => void;
}

const LoginForm = ({ onSuccess }: Props) => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const { toast } = useToast(t);
  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await axios.post(`/auth/login`, values);
      return data;
    },
    onSuccess: (data, variables) => {
      form.resetFields();
      toast.success(t("toast.success"), data.message[i18n.language]);
      const hasUser = Boolean(data?.data && data.data.user);
      onSuccess(variables.email, !hasUser ? true : false, data);
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, toast, t, i18n.language as "ka" | "en", form);
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      mutate(values);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      layout="vertical"
      size="large"
      className="flex flex-1 flex-col justify-between"
      onFinish={() => {
        handleSubmit();
      }}
      initialValues={{ remember: true }}
    >
      <fieldset>
        <Form.Item
          name="email"
          label={toUpperCase(t("auth.loginForm.email"))}
          className="!mb-4"
          rules={[
            {
              required: true,
              message: toUpperCase(t("auth.errors.emailRequired"))
            },
            {
              type: "email",
              message: toUpperCase(t("auth.errors.invalidEmail"))
            }
          ]}
        >
          <Input
            suffix={<Mail className="text-auth-text-secondary/50 h-5 w-5" />}
            classNames={{
              input: "h-[26px]"
            }}
            placeholder={toUpperCase(t("auth.loginForm.email"))}
            className="rounded-lg"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={toUpperCase(t("auth.loginForm.password"))}
          rules={[
            {
              required: true,
              message: toUpperCase(t("auth.errors.passwordRequired"))
            },
            {
              min: 8,
              max: 100,
              message: toUpperCase(t("auth.errors.passwordLength"))
            }
          ]}
        >
          <Input.Password
            classNames={{
              input: "h-[26px]"
            }}
            placeholder={toUpperCase(t("auth.loginForm.password"))}
            className="rounded-lg"
          />
        </Form.Item>
      </fieldset>
      <footer>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>{toUpperCase(t("auth.loginForm.remember"))}</Checkbox>
        </Form.Item>

        <Button
          type="submit"
          loading={isLoading}
          className="premium-button floating-action mt-2 h-[40px] w-full rounded-lg text-[16px] font-semibold"
        >
          {toUpperCase(t("auth.loginForm.login"))}
        </Button>
      </footer>
    </Form>
  );
};

export default LoginForm;
