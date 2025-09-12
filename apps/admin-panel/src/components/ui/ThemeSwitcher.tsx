import React from "react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { toUpperCase } from "@/utils";
import { Switch } from "../ui";

export const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="hover:bg-active h-9 w-9 p-0 transition-all duration-200"
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

export const MobileThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <div className="bg-muted/30 flex items-center justify-between rounded-xl p-3">
      <div className="flex items-center gap-3">
        {isDarkMode ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="font-medium">
          {t(isDarkMode ? "theme.darkMode" : "theme.lightMode")}
        </span>
      </div>
      <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
    </div>
  );
};
