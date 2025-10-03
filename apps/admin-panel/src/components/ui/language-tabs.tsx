import { motion } from "framer-motion";
import { cn } from "@/libs";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

export interface LanguageTab {
  code: string;
  label: string;
  hasErrors?: boolean;
}

interface LanguageTabsProps {
  languages: LanguageTab[];
  activeLanguage: string;
  onChange: (languageCode: string) => void;
  className?: string;
}

export function LanguageTabs({
  languages,
  activeLanguage,
  onChange,
  className = ""
}: LanguageTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("bg-muted flex gap-2 rounded-lg p-1", className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onChange(lang.code)}
          className={cn(
            "relative rounded-md px-6 py-2.5 font-medium transition-all",
            activeLanguage === lang.code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {toUpperCase(t(lang.label))}
          {lang.hasErrors && activeLanguage !== lang.code && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-destructive border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2"
            >
              <span className="sr-only">
                {toUpperCase(
                  t("ui.hasValidationErrors", "Has validation errors")
                )}
              </span>
            </motion.span>
          )}
        </button>
      ))}
    </div>
  );
}
