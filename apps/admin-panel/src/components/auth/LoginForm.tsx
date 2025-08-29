import { Form, Input, Button, Checkbox } from "antd";
import { useMutation } from "react-query";
import { LoginFormValues, ResponseError } from "@/types";
import { returnError, setFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import useApp from "antd/es/app/useApp";
import { useTranslation } from "react-i18next";

const UserIcon = () => <span style={{ color: "#9ca3af" }}>👤</span>;
const LockIcon = () => <span style={{ color: "#9ca3af" }}>🔒</span>;

interface Props {
  onSuccess: (email: string, requiresOtp: boolean, payload?: any) => void;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const LoginForm = ({ onSuccess, setEmail }: Props) => {
  const [form] = Form.useForm();
  const { message } = useApp();
  const { t } = useTranslation();
  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await axios.post(`/auth/login`, values);
      return data;
    },
    onSuccess: (data, variables) => {
      form.resetFields();
      message.success(toUpperCase(data.message["en"]));
      const hasUser = Boolean(data?.data && data.data.user);
      onSuccess(variables.email, !hasUser ? true : false, data);
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, message, form);
      returnError(error, "Login failed");
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEmail(values.email);
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
            prefix={<UserIcon />}
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
            }
          ]}
        >
          <Input.Password
            prefix={<LockIcon />}
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
          type="primary"
          htmlType="submit"
          loading={isLoading}
          className="w-full rounded-lg"
        >
          {toUpperCase(t("auth.loginForm.login"))}
        </Button>
      </footer>
    </Form>
  );
};

export default LoginForm;
