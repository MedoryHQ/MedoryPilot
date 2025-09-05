import { Card, Image } from "antd";
import { motion } from "framer-motion";
import Logo from "@/assets/medory.webp";
import LoginForm from "@/components/auth/LoginForm";
import OtpVerificationForm from "@/components/auth/OtpVerificationForm";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { LanguageChanger, AnimatedLeftPanel } from "@/components/ui";

const Login = () => {
  const initialStage =
    typeof window !== "undefined" &&
    sessionStorage.getItem("otpStage") === "otp"
      ? "otp"
      : "login";

  const initialEmail =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("otpEmail") ?? "")
      : "";

  const { t } = useTranslation();
  const [stage, setStage] = useState<"login" | "otp">(initialStage);
  const [email, setEmail] = useState<string>(initialEmail);
  const { isLoggedIn, otpSentAt, setOtpSent, clearOtp, login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
    //
  }, [isLoggedIn]);

  useEffect(() => {
    const sessionStage = sessionStorage.getItem("otpStage");
    if (sessionStage === "otp") {
      setStage("otp");
      const sEmail = sessionStorage.getItem("otpEmail");
      if (sEmail) setEmail(sEmail);
    } else {
      setStage("login");
    }
  }, [otpSentAt]);

  const handleLoginSuccess = async (
    submittedEmail: string,
    requiresOtp: boolean,
    payload?: any
  ) => {
    setEmail(submittedEmail);

    if (requiresOtp) {
      setStage("otp");
      setOtpSent(submittedEmail);
    } else {
      login({
        data: {
          user: payload.data.user
        }
      });
      clearOtp();
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[442px] lg:max-w-[780px]"
      >
        <Card className="login_card min-h-[474px] w-full overflow-hidden !rounded-[16px] border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:min-h-[548px] sm:w-[442px] lg:w-[780px]">
          <AnimatedLeftPanel />
          <section className="flex w-full flex-col bg-white p-[30px] sm:w-[442px] sm:p-[48px]">
            <LanguageChanger className="absolute top-[14px] right-2" />

            <div className="mb-6 flex flex-col items-center">
              <Image
                className="mb-3 !h-[52px] !w-[52px] rounded-full sm:mb-4 sm:!h-[60px] sm:!w-[60px]"
                src={Logo}
                preview={false}
                alt="Medory"
              />
              <h2 className="text-xl font-bold text-gray-800">
                {toUpperCase(t("auth.welcome"))}!
              </h2>
              <p className="text-sm text-gray-400">
                {toUpperCase(
                  stage === "login" ? t("auth.login") : t("auth.enterOtp")
                )}
              </p>
            </div>

            {stage === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} setEmail={setEmail} />
            ) : (
              <OtpVerificationForm
                onSuccess={() => {
                  clearOtp();
                  navigate("/dashboard");
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

export const authNavigationRoute = {
  element: <Login />,
  path: "/auth",
  isAuthRoute: true
};

export default Login;
