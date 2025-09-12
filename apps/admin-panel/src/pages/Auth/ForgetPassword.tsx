import { ForgetPasswordForm } from "@/components/auth";
import { getPageInfo } from "@/libs";
import { useAuthStore } from "@/store";
import { ForgetPasswordFlowState, Stage } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";

const ForgetPassword = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stage, setStage] = useState<ForgetPasswordFlowState>({
    stage: "forgot-password",
    email: ""
  });
  const { title, subtitle } = getPageInfo(stage.stage as Stage);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);

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
        key={stage.stage}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {(() => {
            switch (String(stage.stage)) {
              default:
                return <ForgetPasswordForm setStage={setStage} />;
            }
          })()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const forgetPasswordNavigationRoute = {
  element: <ForgetPassword />,
  path: "/forget-password",
  isAuthRoute: true
};

export default ForgetPassword;
