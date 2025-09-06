import { useTranslation } from "react-i18next";
import { MobileLanguageChanger, MobileThemeSwitcher } from "../ui";

export const NavigationPreferences: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <h3 className="text-muted-foreground mb-3 text-sm font-medium">
        {t("global.preferences", "Preferences")}
      </h3>

      <div className="space-y-4">
        <MobileThemeSwitcher />
        <MobileLanguageChanger />
      </div>
    </div>
  );
};
