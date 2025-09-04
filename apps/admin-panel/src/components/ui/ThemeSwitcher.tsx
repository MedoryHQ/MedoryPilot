import React from "react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export const ThemeSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
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
  );
};
