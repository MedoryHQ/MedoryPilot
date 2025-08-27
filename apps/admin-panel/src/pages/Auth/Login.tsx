import { Card, Image } from "antd";
import { motion } from "framer-motion";
import Logo from "@/assets/praxisSync.png";

import AnimatedLeftPanelStatic from "@/components/ui/AnimatedLeftPanel";
import LoginForm from "@/components/auth/LoginForm";
import OtpVerificationForm from "@/components/auth/OtpVerificationForm";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [stage, setStage] = useState<"login" | "otp">("login");
  const [email, setEmail] = useState<string>("");
  const { isLoggedIn, otpSentAt, setOtpSent, clearOtp } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  useEffect(() => {
    if (otpSentAt) {
      setStage("otp");
    } else {
      setStage("login");
    }
  }, [otpSentAt]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full sm:max-w-[442px] lg:max-w-[780px]"
      >
        <Card className="login_card min-h-[474px] w-full overflow-hidden !rounded-[16px] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:min-h-[548px] sm:w-[442px] lg:w-[780px]">
          <AnimatedLeftPanelStatic />
          <section className="w-full bg-white p-[30px] sm:w-[442px] sm:p-[48px]">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-slate-100">
                <Image
                  src={Logo}
                  alt="Praxis Sync"
                  preview={false}
                  width={40}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Welcome!</h2>
              <p className="text-sm text-gray-400">
                {stage === "login" ? "Log in your account" : "Enter OTP code"}
              </p>
            </div>

            {stage === "login" ? (
              <LoginForm
                onSuccess={() => {
                  setOtpSent();
                  setStage("otp");
                }}
                setEmail={setEmail}
              />
            ) : (
              <OtpVerificationForm
                onSuccess={() => {
                  clearOtp();
                  navigate("/");
                }}
                email={email}
              />
            )}
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
