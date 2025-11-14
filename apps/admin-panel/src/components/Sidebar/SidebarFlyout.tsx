import React from "react";
import { Button } from "../ui";
import { Dispatch, RefObject, SetStateAction } from "react";
import { SidebarItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "@/libs";

const normalize = (p?: string) => (p ? p.replace(/^\/|\/$/g, "") : "");
const pathMatches = (current: string, candidate?: string) =>
  !!candidate && (current === candidate || current.startsWith(candidate + "/"));

interface SidebarFlyoutProps {
  onPageChange: (href: string | undefined) => void;
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
      position: { x: number; y: number };
    } | null>
  >;
}

export const SidebarFlyout: React.FC<SidebarFlyoutProps> = ({
  collapsed,
  flyoutMenu,
  flyoutTimeoutRef,
  handleFlyoutLeave,
  currentFlyoutItem,
  setFlyoutMenu,
  onPageChange
}) => {
  const location = useLocation();
  const current = normalize(location.pathname);

  return (
    <AnimatePresence>
      {flyoutMenu && collapsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -10 }}
          className="bg-sidebar border-sidebar-border fixed z-50 hidden max-w-[260px] min-w-48 rounded-xl border shadow-xl backdrop-blur-lg md:block"
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

              {currentFlyoutItem.children.map((child) => {
                const childPath = normalize(child.href);
                const active = pathMatches(current, childPath);

                return (
                  <Button
                    key={child.key}
                    variant="ghost"
                    className={cn(
                      "h-10 w-full justify-start gap-3 rounded-lg text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white",
                      active ? "bg-white/10 text-white" : ""
                    )}
                    onClick={() => {
                      onPageChange(child.href);
                      setFlyoutMenu(null);
                    }}
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {child.icon}
                    </div>
                    <span className="text-sm font-medium">{child.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
