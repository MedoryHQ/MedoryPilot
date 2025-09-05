import React from "react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { toUpperCase } from "@/utils";

export const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="hover:bg-muted h-9 w-9 p-0"
      title={toUpperCase(
        t(isDarkMode ? "theme.switchToLight" : "theme.switchToDark")
      )}
    >
      {isDarkMode ? (
        <Sun className="text-foreground h-4 w-4" />
      ) : (
        <Moon className="text-foreground h-4 w-4" />
      )}
    </Button>
  );
};
