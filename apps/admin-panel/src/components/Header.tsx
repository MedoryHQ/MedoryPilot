import React from "react";
import { motion } from "framer-motion";
import { toUpperCase } from "@/utils";
import { Button, LanguageChanger, Search } from "./ui";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentPath = location.pathname.split("/");
  const { isDarkMode, toggleTheme } = useThemeContext();

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
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover:bg-muted h-9 w-9 p-0"
            title={
              isDarkMode
                ? i18n.language === "en"
                  ? "Switch to light mode"
                  : "ნათელ რეჟიმზე გადართვა"
                : i18n.language === "en"
                  ? "Switch to dark mode"
                  : "მუქ რეჟიმზე გადართვა"
            }
          >
            {isDarkMode ? (
              <Sun className="text-foreground h-4 w-4" />
            ) : (
              <Moon className="text-foreground h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
