import { Form, Input, Button, Checkbox, Card, Image } from "antd";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store";
import Logo from "@/assets/praxisSync.png";
import useApp from "antd/es/app/useApp";
// import {  useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { LoginFormValues, ResponseError } from "@/types";
import { setFormErrors } from "@/utils";
import AnimatedLeftPanelStatic from "@/components/ui/AnimatedLeftPanel";

const UserIcon = () => <span style={{ color: "#9ca3af" }}>👤</span>;
const LockIcon = () => <span style={{ color: "#9ca3af" }}>🔒</span>;

const Login = () => {
  const [form] = Form.useForm();

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
        <Card className="login_card min-h-[548px] w-[780px] overflow-hidden !rounded-[16px] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <AnimatedLeftPanelStatic />
          <section className="w-[442px] bg-white !p-[48px]">
            <Form
              form={form}
              name="login"
              layout="vertical"
              size="large"
              onFinish={onFinish}
              className="login_form"
              initialValues={{ remember: true }}
            >
              <div className="!mb-[20px] flex w-full flex-col items-center justify-center">
                {/* TODO: Change branding */}
                <div className="mb-[16px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-slate-100">
                  <Image
                    src={Logo}
                    alt="Praxis Sync"
                    preview={false}
                    width={40}
                    height={40}
                  />
                </div>
                <h2 className="text-[26px] font-bold text-gray-800">
                  Welcome Tamar!
                </h2>
                <p className="text-[16px] text-gray-400">Log in your account</p>
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
                  className="!h-[46px] w-full rounded-[8px] border-0 !bg-[#4250cb] hover:opacity-90"
                  size="large"
                >
                  Login
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
