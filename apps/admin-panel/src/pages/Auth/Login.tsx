import { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Card, Typography, Alert } from "antd";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store";
import useApp from "antd/es/app/useApp";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { ResponseError } from "@/types";
import { setFormErrors } from "@/utils";

const { Title, Text } = Typography;

const UserIcon = () => <span style={{ color: "#9ca3af" }}>👤</span>;
const LockIcon = () => <span style={{ color: "#9ca3af" }}>🔒</span>;

const Login = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string>("");

  const { login, isLoggedIn } = useAuthStore();
  const { message } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const { mutateAsync: loginMutation, isLoading: loading } = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await axios.post(`/auth/login`, values);
      return data;
    },
    onSuccess: (data) => {
      login(data);
      form.resetFields();
    },
    onError: (error: ResponseError) => {
      setFormErrors(error, message, form);
    }
  });

  const onFinish = (values: any) => {
    loginMutation(values);
  };

  useEffect(() => {
    if (location.pathname !== "/auth" && !isLoggedIn) {
      navigate("/auth", { replace: true });
    }
  }, [location.pathname, isLoggedIn, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <div className="mb-8 text-center">
            <Title level={2} className="mb-2 text-gray-800 dark:text-gray-100">
              Hi Tamar.
            </Title>
            <Text className="text-gray-600 dark:text-gray-400">
              {/* {t('welcomeBack')} */}
              Welcome Back
            </Text>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6"
            >
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError("")}
              />
            </motion.div>
          )}

          <Form
            form={form}
            name="login"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email Required" },
                { type: "email", message: "Invalid Email" }
              ]}
            >
              <Input
                prefix={<UserIcon />}
                placeholder={"Email" /*t('emailPlaceholder') */}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Password Required" }]}
            >
              <Input.Password
                prefix={<LockIcon />}
                placeholder={"Password"}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-600 dark:text-gray-400">
                    {/* {t('rememberMe')} */}
                    Remember Me
                  </Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  className="p-0 text-teal-600 hover:text-teal-700"
                >
                  {/* {t('forgotPassword')} */}
                  Forgot Password
                </Button>
              </div>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-12 w-full rounded-lg border-0 bg-teal-600 hover:bg-teal-700"
                size="large"
              >
                {loading ? "Signing In" : "Sign In"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const authNavigationRoute = {
  element: <Login />,
  path: "/auth",
  isAuthRoute: true
};

export default Login;
