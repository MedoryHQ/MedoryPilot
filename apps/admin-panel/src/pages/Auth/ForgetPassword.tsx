import {
  ForgetPasswordForm,
  OtpForm,
  PasswordResetForm
} from "@/components/auth";
import { cn, getPageInfo } from "@/libs";
import { useAuthStageStore, useAuthStore } from "@/store";
import { Stage } from "@/types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

const ForgetPassword = () => {
  const { isLoggedIn } = useAuthStore();
  const { clearOtp } = useAuthStageStore();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { forgetPasswordStage, setForgetPasswordStage, resetStages } =
    useAuthStageStore();

  const { title, subtitle } = getPageInfo(forgetPasswordStage.stage as Stage);

  const handleOtpSuccess = () => {
    resetStages();
    clearOtp();
    navigate("/login");
  };

  const onBackToLogin = () => {
    clearOtp();
    navigate("/login");
  };

  useEffect(() => {
    resetStages();
    clearOtp();
  }, []);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

  return (
    <div className="child-max flex w-full max-w-md flex-col items-center lg:max-w-[470px]">
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
        key={forgetPasswordStage.stage}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {(() => {
            switch (String(forgetPasswordStage.stage)) {
              case "forgot-password-otp":
                return (
                  <OtpForm
                    email={forgetPasswordStage.email || ""}
                    verificationUrl="/auth/forgot-password-verification"
                    resendUrl="/auth/resend-otp"
                    onSuccess={(data) => {
                      setForgetPasswordStage({
                        stage: "new-password",
                        email: forgetPasswordStage.email,
                        code: data.code
                      });
                    }}
                  />
                );
              case "new-password":
                return (
                  <PasswordResetForm
                    email={forgetPasswordStage.email || ""}
                    code={forgetPasswordStage.code || ""}
                    onSuccess={() => {
                      handleOtpSuccess();
                    }}
                  />
                );
              default:
                return (
                  <ForgetPasswordForm
                    setStage={setForgetPasswordStage}
                    key="forget-form"
                  />
                );
            }
          })()}
        </AnimatePresence>
      </motion.div>

      <Button
        type="button"
        variant="outline"
        onClick={onBackToLogin}
        className={cn(
          "border-auth-input-border text-auth-text-secondary hover:text-auth-text-primary hover:bg-muted/50 h-9 w-full rounded-xl text-[12px] lg:h-11 lg:text-[14px]",
          forgetPasswordStage.stage === "forgot-password-otp"
            ? "mt-0 w-[calc(100%-64px)]"
            : "mt-4"
        )}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {toUpperCase(t("auth.forgetPassword.backToLogin"))}
      </Button>
    </div>
  );
};

export const forgetPasswordNavigationRoute = {
  element: <ForgetPassword />,
  path: "/forget-password",
  isAuthRoute: true
};

export default ForgetPassword;
