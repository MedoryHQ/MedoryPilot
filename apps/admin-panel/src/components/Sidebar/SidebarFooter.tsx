import { motion, AnimatePresence } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "../ui";
import { ChevronDown, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { useState } from "react";
import { useAuthStore } from "@/store";

interface SideBarFooterProps {
  collapsed: boolean;
  onPageChange: (href: string | undefined) => void;
}

export const SidebarFooter: React.FC<SideBarFooterProps> = ({
  collapsed,
  onPageChange
}) => {
  const { t } = useTranslation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout, currentUser } = useAuthStore();

  const userName = `Dr. ${currentUser?.firstName} ${currentUser?.lastName}`;

  return (
    <div className="shrink-0 border-t border-[var(--sidebar-border)] p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 rounded-xl hover:bg-white/10"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                          {toUpperCase(t("sidebar.doctor"))}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-sidebar border-sidebar-border rounded-lg border p-3 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
                >
                  <p>{userName}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full rounded-xl p-3 text-left hover:bg-white/10"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-white/20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
                        {toUpperCase(t("sidebar.doctor"))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">
                        {userName}
                      </div>
                      <div className="truncate text-xs text-white/70">
                        {toUpperCase(t("sidebar.administrator"))}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: showUserMenu ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-white/70" />
                    </motion.div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
            )}

            <DropdownMenuContent
              side="top"
              align="end"
              className="w-56 rounded-xl border-0 bg-white p-1.5 text-black shadow-xl"
              sideOffset={8}
            >
              <DropdownMenuItem
                onClick={() => onPageChange("settings/profile")}
                className="flex cursor-pointer items-center gap-3 rounded-lg py-3"
              >
                <User className="h-4 w-4 text-gray-500" />
                <span>{toUpperCase(t("sidebar.profile"))}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPageChange("settings")}
                className="flex cursor-pointer items-center gap-3 rounded-lg py-3"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                <span>{toUpperCase(t("sidebar.settings"))}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPageChange("settings/help-and-support")}
                className="flex cursor-pointer items-center gap-3 rounded-lg py-3"
              >
                <HelpCircle className="h-4 w-4 text-gray-500" />
                <span>{toUpperCase(t("sidebar.helpAndSupport"))}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-100" />

              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-3 rounded-lg py-3 text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>{toUpperCase(t("sidebar.logout"))}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
