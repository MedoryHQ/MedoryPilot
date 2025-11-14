import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/assets/medory.webp";
import { Button } from "../ui";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

interface SideBarHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const SidebarHeader: React.FC<SideBarHeaderProps> = ({
  collapsed,
  toggleCollapsed
}) => {
  const { t } = useTranslation();
  return (
    <div className="border-sidebar-border shrink-0 border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img className="h-6 w-6 object-contain" src={Logo} alt="Medory" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="text-lg font-semibold text-white">
                  {toUpperCase(t("global.name"))}
                </h1>
                <div className="text-xs text-white/70">
                  {toUpperCase(t("global.platform"))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleCollapsed()}
          className="h-8 w-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
};
