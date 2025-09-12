import { useEffect } from "react";
import { LoginForm, OtpForm } from "@/components/auth";
import { useAuthStageStore, useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Stage } from "@/types";
import { getPageInfo } from "@/libs";
import { AnimatePresence, motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";

const Login: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const { clearOtp } = useAuthStageStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { loginStage, setLoginStage, resetStages } = useAuthStageStore();
  const { title, subtitle } = getPageInfo(loginStage.stage as Stage);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn, navigate]);

  const handleOtpSuccess = () => {
    resetStages();
    clearOtp();
    navigate("/");
  };

  return (
    <div className="w-full max-w-md lg:max-w-[470px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-auth-text-primary mb-2 text-3xl font-bold">
          {toUpperCase(t(title))}
        </h1>
        <p className="text-auth-text-secondary">{toUpperCase(t(subtitle))}</p>
      </motion.div>

      <motion.div
        key={loginStage.stage}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {(() => {
            switch (String(loginStage.stage)) {
              case "verify-otp":
                return (
                  <OtpForm
                    email={loginStage.email || ""}
                    verificationUrl="/auth/verify-otp"
                    resendUrl="/auth/resend-otp"
                    onSuccess={(data) => {
                      login({ data: { user: data.data.user } });
                      handleOtpSuccess();
                    }}
                  />
                );
              case "login":
              default:
                return <LoginForm setStage={setLoginStage} />;
            }
          })()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const loginNavigationRoute = {
  element: <Login />,
  path: "/login",
  isAuthRoute: true
};

export default Login;
