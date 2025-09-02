import { Button } from "../ui";
import { Dispatch, RefObject, SetStateAction } from "react";
import { SidebarItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarFlyoutProps {
  isChildActive: (parentKey: string, childKey: string) => boolean;
  onPageChange: (href: string | undefined) => void;
  isMobile: boolean;
  collapsed: boolean;
  flyoutMenu: {
    key: string;
    position: {
      x: number;
      y: number;
    };
  } | null;
  flyoutTimeoutRef: RefObject<NodeJS.Timeout | null>;
  handleFlyoutLeave: () => void;
  currentFlyoutItem: SidebarItem | undefined;
  setFlyoutMenu: Dispatch<
    SetStateAction<{
      key: string;
      position: {
        x: number;
        y: number;
      };
    } | null>
  >;
}

export const SidebarFlyout: React.FC<SidebarFlyoutProps> = ({
  isMobile,
  collapsed,
  flyoutMenu,
  flyoutTimeoutRef,
  handleFlyoutLeave,
  currentFlyoutItem,
  setFlyoutMenu,
  isChildActive,
  onPageChange
}) => {
  return (
    <AnimatePresence>
      {flyoutMenu && !isMobile && collapsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -10 }}
          className="fixed z-50 min-w-48 rounded-xl border border-[#3a4866] bg-[#243149] shadow-xl backdrop-blur-lg"
          style={{
            left: flyoutMenu.position.x,
            top: flyoutMenu.position.y
          }}
          onMouseEnter={() => {
            if (flyoutTimeoutRef.current) {
              clearTimeout(flyoutTimeoutRef.current);
            }
          }}
          onMouseLeave={handleFlyoutLeave}
        >
          {currentFlyoutItem?.children && (
            <div className="p-2">
              <div className="mb-1 px-3 py-2 text-xs font-semibold text-white/60">
                {currentFlyoutItem.label}
              </div>
              {currentFlyoutItem.children.map((child) => (
                <Button
                  key={child.key}
                  variant="ghost"
                  className={`h-10 w-full justify-start gap-3 rounded-lg text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white ${
                    isChildActive(currentFlyoutItem.key, child.key)
                      ? "bg-white/10 text-white"
                      : ""
                  }`}
                  onClick={() => {
                    onPageChange(child.key);
                    setFlyoutMenu(null);
                  }}
                >
                  <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                    {child.icon}
                  </div>
                  <span className="text-sm font-medium">{child.label}</span>
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
