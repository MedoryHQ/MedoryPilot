import { cn } from "@/libs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from ".";
import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";
import { toUpperCase } from "@/utils";

interface LanguageChangerProps {
  className?: string;
}

interface LanguageTabSwitcherProps {
  selectedLanguage: "en" | "ka";
  onLanguageChange: (language: "en" | "ka") => void;
  errors?: {
    en?: number;
    ka?: number;
  };
  disabled?: boolean;
}

export const LanguageChanger: React.FC<LanguageChangerProps> = ({
  className
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const changeLanguageHandler = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  return (
    <div className={cn("relative", className)}>
      <Select value={language} onValueChange={changeLanguageHandler}>
        <SelectTrigger className="border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 group h-11 w-28 rounded-2xl transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="border-border/30 h-6 w-6 overflow-hidden rounded-full border shadow-sm">
                <span className="text-sm">
                  {language === "en" ? "🇺🇸" : "🇬🇪"}
                </span>
              </div>
              <div className="from-primary/20 to-accent/20 absolute -inset-0.5 rounded-full bg-gradient-to-br opacity-0 blur-sm transition-all duration-200 group-hover:opacity-100 group-hover:blur-md"></div>
            </div>
            <span className="text-foreground/80 group-hover:text-foreground text-xs font-medium transition-colors duration-200">
              {language.toUpperCase()}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="border-border/50 bg-background/95 min-w-32 rounded-xl shadow-xl backdrop-blur-md">
          <SelectItem
            value="en"
            className="hover:bg-accent/10 group cursor-pointer rounded-lg py-1.5 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="border-border/5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                <span className="text-xs">🇺🇸</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">English</span>
                <span className="text-[10px] opacity-80">United States</span>
              </div>
            </div>
          </SelectItem>

          <SelectItem
            value="ka"
            className="hover:bg-accent/10 group cursor-pointer rounded-lg py-1.5 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="border-border/5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                <span className="text-xs">🇬🇪</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">ქართული</span>
                <span className="text-[10px] opacity-80">Georgia</span>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export const MobileLanguageChanger: React.FC<LanguageChangerProps> = ({
  className
}) => {
  const { t, i18n } = useTranslation();
  const onLanguageChange = (lang: string) => i18n.changeLanguage(lang);

  return (
    <div
      className={cn(
        "bg-muted/30 flex items-center justify-between rounded-xl p-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5" />
        <span className="font-medium">{t("global.language", "Language")}</span>
      </div>
      <Select value={i18n.language} onValueChange={onLanguageChange}>
        <SelectTrigger className="h-8 w-24 border-0 bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="ka">ქარ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export const LanguageTabSwitcher: React.FC<LanguageTabSwitcherProps> = ({
  selectedLanguage,
  onLanguageChange,
  errors,
  disabled = false
}) => {
  const { t, i18n } = useTranslation();
  const languages = [
    { code: "en" as const, label: "English", flag: "🇬🇧" },
    { code: "ka" as const, label: "ქართული", flag: "🇬🇪" }
  ];

  return (
    <div className="bg-muted flex gap-2 rounded-lg p-1">
      {languages.map((lang) => {
        const hasErrors = errors && errors[lang.code] && errors[lang.code]! > 0;
        const errorCount = errors?.[lang.code] || 0;
        const isActive = selectedLanguage === lang.code;

        const button = (
          <button
            key={lang.code}
            type="button"
            onClick={() => !disabled && onLanguageChange(lang.code)}
            disabled={disabled}
            className={`relative flex items-center gap-2 rounded-md px-6 py-2.5 font-medium transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${hasErrors && isActive ? "ring-destructive ring-offset-muted ring-2 ring-offset-2" : ""} `}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.label}</span>

            {hasErrors && !isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs"
                >
                  {errorCount}
                </Badge>
              </motion.div>
            )}
          </button>
        );

        if (hasErrors && !isActive) {
          return (
            <TooltipProvider key={lang.code}>
              <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">
                    {toUpperCase(
                      t("ui.languageErrorTooltip", {
                        count: errorCount,
                        error: t(errorCount === 1 ? "ui.error" : "ui.errors"),
                        language: lang.label,
                        context: i18n.language === "en" ? "in" : "-ში"
                      })
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return button;
      })}
    </div>
  );
};
