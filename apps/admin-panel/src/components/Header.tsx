import React from "react";
import { motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { ThemeSwitcher, LanguageChanger, Search } from "./ui";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Header: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname.split("/");

  return (
    <motion.header
      className="bg-card border-border sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-sm md:px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-foreground font-semibold">
              {toUpperCase(t(`menu.${currentPath[currentPath.length - 1]}`))}
            </h1>
            <div className="text-muted-foreground text-xs">
              {toUpperCase(t("global.adminPannel"))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Search />
          <LanguageChanger />
          <ThemeSwitcher />
        </div>
      </div>
    </motion.header>
  );
};
