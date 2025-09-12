import React, { JSX, useState } from "react";
import { AnimatedRightPanel } from "../ui";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/medory.webp";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { LanguageChanger } from "@/components/ui";
import { LoginStage, Stage } from "@/types";
import { getPageInfo } from "@/libs";

export const AuthWrapper = (element: JSX.Element) => {
  const { t } = useTranslation();

  const initialStage =
    (typeof window !== "undefined" && sessionStorage.getItem("stage")) ||
    "login";

  const initialEmail =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("email") ?? "")
      : "";

  const [loginState, setLoginState] = useState<LoginStage>({
    stage: initialStage as Stage,
    email: initialEmail
  });

  const { title, subtitle } = getPageInfo(loginState);

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
                {React.cloneElement(element, { loginState, setLoginState })}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 xl:w-5/8">
        <AnimatedRightPanel />
      </div>
    </div>
  );
};
