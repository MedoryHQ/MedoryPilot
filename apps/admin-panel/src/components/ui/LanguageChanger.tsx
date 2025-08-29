import { cn } from "@/libs";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";
import React from "react";
import { useTranslation } from "react-i18next";

interface LanguageChangerProps {
  className?: string;
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
        <SelectTrigger className="border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 group h-11 w-28 rounded-2xl backdrop-blur-sm transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="border-border/30 h-6 w-6 overflow-hidden rounded-full border shadow-sm">
                <span className="text-sm">
                  {language === "en" ? "🇺🇸" : "🇬🇪"}
                </span>
              </div>
              <div className="from-primary/20 to-accent/20 absolute -inset-0.5 rounded-full bg-gradient-to-br opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-md"></div>
            </div>
            <span className="text-foreground/80 group-hover:text-foreground text-xs font-medium transition-colors duration-300">
              {language.toUpperCase()}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="border-border/50 bg-background/95 min-w-48 rounded-2xl shadow-2xl backdrop-blur-xl">
          <SelectItem
            value="en"
            className="hover:bg-accent/10 cursor-pointer rounded-xl py-3 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="border-border/30 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                <span className="text-base">🇺🇸</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">English</span>
                <span className="text-muted-foreground text-xs">
                  United States
                </span>
              </div>
            </div>
          </SelectItem>
          <SelectItem
            value="ka"
            className="hover:bg-accent/10 cursor-pointer rounded-xl py-3 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="border-border/30 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                <span className="text-base">🇬🇪</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">ქართული</span>
                <span className="text-muted-foreground text-xs">Georgia</span>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
