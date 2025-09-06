import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Separator, Button, Sheet, SheetContent } from "../ui";
import { useMenuItems, usePrimaryNavItems } from "@/libs";
import type { SidebarItem } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";
import {
  normalize,
  pathMatches,
  computeInitialExpandedKeys,
  arraysEqual
} from "@/utils";
import { NavigationPreferences } from "./NavigationPreferences";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { MobileNavigationFooter } from "./MobileNavigationFooter";
import { MobileNavigationHeader } from "./MobileNavigationHeader";

export const MobileNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const isMenuExpanded = (menuKey: string) => expandedMenus.includes(menuKey);

  const items = useMenuItems();
  const primaryNavItems = usePrimaryNavItems();

  const fullMenuItems = items;

  useEffect(() => {
    const pathname = typeof window !== "undefined" ? location.pathname : "/";
    const keys = computeInitialExpandedKeys(items, pathname);
    setExpandedMenus((prev) => (arraysEqual(prev, keys) ? prev : keys));
  }, [location.pathname]);

  const onPageChange = (href?: string) => {
    if (href) navigate(`/${href}`);
  };

  const handleNavClick = (item: any) => {
    if (item.action === "openMenu") {
      setIsMenuOpen(true);
    } else {
      onPageChange(item.href);
    }
  };

  const handleMenuItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length) {
      toggleExpanded(item.key);
    } else {
      onPageChange(item.href);
      setIsMenuOpen(false);
    }
  };

  const toggleExpanded = (menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const current = normalize(window.location.pathname);
  const isActive = (key: string) => {
    const candidate = items.find((it) => it.key === key)?.href ?? key;
    return pathMatches(current, candidate);
  };
  const isChildActive = (childHrefOrKey: string) =>
    pathMatches(current, childHrefOrKey);

  return (
    <>
      <motion.div
        className="bg-background/95 border-border fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-md md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-around px-4 py-2">
          {primaryNavItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Button
                variant="ghost"
                className={`flex h-auto flex-col items-center gap-1 rounded-xl px-4 py-3 ${
                  isActive(item.key) && item.key !== "menu"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } `}
                onClick={() => handleNavClick(item)}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex items-center justify-center"
                >
                  {item.icon}
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="h-safe-area-inset-bottom" />
      </motion.div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] overflow-hidden rounded-t-3xl border-t-0 p-0"
        >
          <MobileNavigationHeader />

          <div className="flex-1 overflow-y-auto px-6">
            <NavigationPreferences />
            <Separator className="mb-6" />
            <MobileNavigationMenu
              fullMenuItems={fullMenuItems}
              handleMenuItemClick={handleMenuItemClick}
              isActive={isActive}
              isChildActive={isChildActive}
              isMenuExpanded={isMenuExpanded}
              onPageChange={onPageChange}
              setIsMenuOpen={setIsMenuOpen}
            />
            <MobileNavigationFooter />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
