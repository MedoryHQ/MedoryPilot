import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/medory.webp";
import LoginForm from "@/components/auth/LoginForm";
import OtpVerificationForm from "@/components/auth/OtpVerificationForm";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { LanguageChanger, AnimatedRightPanel } from "@/components/ui";
import { LoginStage, Stage } from "@/types";
import { getPageInfo } from "@/libs";

const Login = () => {
  const initialStage =
    (typeof window !== "undefined" && sessionStorage.getItem("stage")) ||
    "login";

  const initialEmail =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("email") ?? "")
      : "";

  const { t } = useTranslation();
  const [loginState, setLoginState] = useState<LoginStage>({
    stage: initialStage as Stage,
    email: initialEmail
  });
  const { isLoggedIn, otpSentAt, setOtpSent, clearOtp, login } = useAuthStore();
  const { title, subtitle } = getPageInfo(loginState);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  useEffect(() => {
    const stage = sessionStorage.getItem("stage") as Stage;
    const email = sessionStorage.getItem("email");
    if (stage && email) {
      setLoginState({
        stage,
        email
      });
    }
  }, [otpSentAt]);

  const handleLoginSuccess = async (
    submittedEmail: string,
    requiresOtp: boolean,
    payload?: any
  ) => {
    if (requiresOtp) {
      setLoginState({
        stage: "otp",
        email: submittedEmail
      });
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
    <div className="flex min-h-screen w-full">
      <div className="bg-auth-form-bg flex flex-1 flex-col">
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Medory" className="h-8 w-8 rounded-[4px]" />
            <span className="text-auth-text-primary font-semibold">
              {toUpperCase(t("global.name"))}
            </span>
          </div>
          <LanguageChanger />
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
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
              <p className="text-auth-text-secondary">
                {toUpperCase(t(subtitle))}
              </p>
            </motion.div>

            <motion.div
              key={loginState.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {(() => {
                  switch (loginState.stage) {
                    case "login":
                      return <LoginForm onSuccess={handleLoginSuccess} />;
                    case "otp":
                      return (
                        <OtpVerificationForm
                          onSuccess={() => {
                            navigate("/");
                          }}
                          email={loginState.email}
                        />
                      );
                    // case "forgot-password":
                    //   return (
                    //     <ForgotPasswordForm
                    //       onSuccess={handleForgotPassword}
                    //       onBackToLogin={handleBackToLogin}
                    //     />
                    //   );
                    // case "reset-otp":
                    //   return (
                    //     <OtpVerificationForm
                    //       onSuccess={handleResetOtpSuccess}
                    //       email={loginState.email}
                    //       mode="reset"
                    //       onBack={() =>
                    //         setLoginState((prev) => ({
                    //           ...prev,
                    //           stage: "forgot-password"
                    //         }))
                    //       }
                    //     />
                    //   );
                    // case "new-password":
                    //   return (
                    //     <NewPasswordForm
                    //       email={loginState.email}
                    //       onSuccess={handlePasswordResetSuccess}
                    //     />
                    //   );
                    default:
                      return <LoginForm onSuccess={handleLoginSuccess} />;
                  }
                })()}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2">
        <AnimatedRightPanel />
      </div>
    </div>
  );
};

export const authNavigationRoute = {
  element: <Login />,
  path: "/auth",
  isAuthRoute: true
};

export default Login;
