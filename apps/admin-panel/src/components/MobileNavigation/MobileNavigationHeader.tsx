import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, SheetHeader } from "../ui";
import { useAuthStore } from "@/store";
import { toUpperCase } from "@/utils";

export const MobileNavigationHeader: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();

  const userName = `Dr. ${currentUser?.firstName} ${currentUser?.lastName}`;

  return (
    <SheetHeader className="px-6 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            DR
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{userName}</h2>
          <p className="text-muted-foreground text-sm">
            {toUpperCase(t("sidebar.administrator"))}
          </p>
        </div>
      </div>
    </SheetHeader>
  );
};
