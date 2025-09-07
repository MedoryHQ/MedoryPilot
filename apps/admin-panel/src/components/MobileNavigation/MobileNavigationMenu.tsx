import { SidebarItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui";
import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { arraysEqual, computeInitialExpandedKeys, pathMatches } from "@/utils";

interface MobileNavigationMenuProps {
  isActive: (key: string) => boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPageChange: (href?: string) => void;
  items: SidebarItem[];
  current: string;
}
export const MobileNavigationMenu: React.FC<MobileNavigationMenuProps> = ({
  isActive,
  setIsMenuOpen,
  onPageChange,
  items,
  current
}) => {
  const location = useLocation();

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const isMenuExpanded = (menuKey: string) => expandedMenus.includes(menuKey);

  const fullMenuItems = items;

  useEffect(() => {
    const pathname = typeof window !== "undefined" ? location.pathname : "/";
    const keys = computeInitialExpandedKeys(items, pathname);
    setExpandedMenus((prev) => (arraysEqual(prev, keys) ? prev : keys));
  }, [location.pathname]);

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

  const isChildActive = (childHrefOrKey: string) =>
    pathMatches(current, childHrefOrKey);

  return (
    <div className="mb-8 space-y-2">
      {fullMenuItems.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Button
            variant="ghost"
            className={`h-auto w-full justify-between rounded-xl p-4 text-left ${
              isActive(item.key)
                ? "bg-primary/10 text-primary border-primary/20 border"
                : "hover:bg-muted/50"
            } `}
            onClick={() => handleMenuItemClick(item)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </div>
            {item.children && (
              <motion.div
                animate={{ rotate: isMenuExpanded(item.key) ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </Button>

          <AnimatePresence>
            {item.children && isMenuExpanded(item.key) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 ml-8 overflow-hidden"
              >
                {item.children.map((child, childIndex) => (
                  <motion.div
                    key={child.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: childIndex * 0.05
                    }}
                  >
                    <Button
                      variant="ghost"
                      className={`mb-1 h-auto w-full justify-start rounded-lg p-3 text-left ${
                        isChildActive(child.href ?? child.key)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/30"
                      } `}
                      onClick={() => {
                        onPageChange(child.href);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{child.icon}</div>
                        <span className="text-sm">{child.label}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};
