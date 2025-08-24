import { useState } from "react";
import { Form, Input, Button, Checkbox, Card, Alert, Image } from "antd";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store";
import Logo from "@/assets/praxisSync.png";
import TextLogo from "@/assets/praxis_as_text.png";
import useApp from "antd/es/app/useApp";
// import {  useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { LoginFormValues, ResponseError } from "@/types";
import { setFormErrors } from "@/utils";
import { Info } from "lucide-react";

const UserIcon = () => <span style={{ color: "#9ca3af" }}>👤</span>;
const LockIcon = () => <span style={{ color: "#9ca3af" }}>🔒</span>;

const Login = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string>("");

  const {
    login
    // isLoggedIn
  } = useAuthStore();
  const { message } = useApp();
  // const navigate = useNavigate();
  // const location = useLocation();

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

  const onFinish = (values: LoginFormValues) => {
    loginMutation(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[780px]"
      >
        <Card className="login_card min-h-[510px] w-[780px] border-0 shadow-sm">
          <section className="h-full w-[336px] rounded-[10px] bg-[#4250cb] !p-[48px] !text-white">
            <h2 className="!mt-1 !mb-8 text-[32px] leading-[40px] font-light">
              Welcome Tamar.
            </h2>
            <p className="mt-2 text-[14px] leading-[24px] font-light">
              a dual-language SaaS platform that empowers doctors to digitize
              bookings, payments, documents, and patient engagement while giving
              clients seamless access to schedules, records, and services.
            </p>
          </section>
          <section className="w-[442px] bg-white !p-[48px]">
            <div className="mb-8 text-center"></div>

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
              className="login_form"
              initialValues={{ remember: true }}
            >
              <div className="!mb-[20px] flex w-full justify-end">
                {/* TODO: Change branding */}
                <div className="flex items-center gap-2">
                  <Image
                    src={Logo}
                    alt="Praxis Sync"
                    preview={false}
                    width={30}
                    height={30}
                  />
                  <Image
                    src={TextLogo}
                    alt="Praxis Sync"
                    preview={false}
                    height={20}
                  />
                </div>
              </div>
              <div className="!mb-[16px] flex w-full items-center justify-start gap-[24px] rounded-[6px] bg-[#4250cb]/25 !px-[22px] !py-[12px]">
                <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#4250cb]">
                  <Info className="h-4 w-4 text-white" />
                </span>
                <div className="text-[14px] leading-[26px] text-black">
                  <p>Email: example@gmail.com</p>
                  <p>Password: Example123</p>
                </div>
              </div>
              <Form.Item
                name="email"
                label="Email"
                className="!mb-5"
                rules={[
                  { required: true, message: "Email Required" },
                  { type: "email", message: "Invalid Email" }
                ]}
              >
                <Input
                  prefix={<UserIcon />}
                  placeholder={"Email"}
                  className="rounded-lg placeholder:!text-[12px] placeholder:opacity-[80%]"
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

              <Form.Item className="!mt-2 !mb-3">
                <div className="flex items-center justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="!text-gray-800">Remember Me</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    className="!p-0 !text-[14px] !text-[#4250cb] hover:underline"
                  >
                    {/* {t('forgotPassword')} */}
                    Forgot Password
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="h-12 w-full rounded-lg border-0 !bg-[#4250cb] hover:opacity-90"
                  size="large"
                >
                  {loading ? "Signing In" : "Sign In"}
                </Button>
              </Form.Item>
            </Form>
          </section>
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
