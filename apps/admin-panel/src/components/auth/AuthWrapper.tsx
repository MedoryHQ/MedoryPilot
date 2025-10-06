import React from "react";
import { AnimatedRightPanel, ThemeSwitcher } from "../ui";
import Logo from "@/assets/medory.webp";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { LanguageChanger } from "@/components/ui";

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen w-full">
      <div className="bg-auth-form-bg flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 md:p-8">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Medory" className="h-8 w-8 rounded-[4px]" />
            <span className="text-auth-text-primary font-semibold">
              {toUpperCase(t("global.name"))}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageChanger />
            <ThemeSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          {children}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 xl:w-5/8">
        <AnimatedRightPanel />
      </div>
    </div>
  );
};
