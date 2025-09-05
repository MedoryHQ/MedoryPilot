import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "../ui";
import { ChevronDown } from "lucide-react";
import { SidebarItem } from "@/types";
import { useLocation } from "react-router-dom";
import { toUpperCase } from "@/utils";

const normalize = (p?: string) => (p ? p.replace(/^\/|\/$/g, "") : "");

const pathMatches = (current: string, candidate?: string) => {
  if (!candidate) return false;
  return current === candidate || current.startsWith(candidate + "/");
};

const ChildItem: React.FC<{
  child: SidebarItem;
  onClick: (href?: string) => void;
}> = React.memo(({ child, onClick }) => {
  const location = useLocation();
  const current = normalize(location.pathname);
  const childPath = normalize(child.href);

  const active = pathMatches(current, childPath);

  return (
    <Button
      variant="ghost"
      className={`sidebar-item h-10 w-full justify-start gap-3 text-white/70 transition-all duration-200 hover:text-white ${
        active ? "active" : ""
      }`}
      onClick={() => onClick(child.href)}
    >
      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
        {child.icon}
      </div>
      <span className="truncate text-sm font-medium">
        {toUpperCase(child.label)}
      </span>
    </Button>
  );
});
ChildItem.displayName = "ChildItem";

const TopLevelItem: React.FC<{
  item: SidebarItem;
  isExpanded: boolean;
  toggle: () => void;
  collapsed: boolean;
  isMobile: boolean;
  onItemClick: (item: SidebarItem) => void;
  handleFlyoutEnter: (item: SidebarItem, e: React.MouseEvent) => void;
  handleFlyoutLeave: () => void;
}> = React.memo(
  ({
    item,
    isExpanded,
    toggle,
    collapsed,
    isMobile,
    onItemClick,
    handleFlyoutEnter,
    handleFlyoutLeave
  }) => {
    const location = useLocation();
    const current = normalize(location.pathname);

    const itemPath = normalize(item.href);
    const topMatches = itemPath && pathMatches(current, itemPath);

    const childrenMatch =
      item.children &&
      item.children.some((ch: any) => {
        const childPath = normalize(ch.href);
        if (childPath && pathMatches(current, childPath)) return true;
        if (ch.children && ch.children.length) {
          return ch.children.some((gc: any) =>
            pathMatches(current, normalize(gc.href))
          );
        }
        return false;
      });

    const active = Boolean(topMatches || childrenMatch);

    if (item.children && item.children.length) {
      return (
        <div
          onMouseEnter={(e) => handleFlyoutEnter(item, e)}
          onMouseLeave={handleFlyoutLeave}
        >
          <Collapsible
            open={isExpanded && !collapsed && !isMobile}
            onOpenChange={toggle}
          >
            <Tooltip open={collapsed ? undefined : false}>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`sidebar-item h-12 w-full justify-start gap-3 text-white/80 transition-all duration-200 hover:text-white ${
                      active ? "active" : ""
                    }`}
                    onClick={() => onItemClick(item)}
                  >
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      {item.icon}
                    </div>

                    <AnimatePresence>
                      {!collapsed && !isMobile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-1 items-center justify-between"
                        >
                          <span className="truncate font-medium">
                            {toUpperCase(item.label)}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </CollapsibleTrigger>
              </TooltipTrigger>

              {collapsed && isMobile && (
                <TooltipContent side="right" className="sidebar-tooltip">
                  <p>{toUpperCase(item.label)}</p>
                </TooltipContent>
              )}
            </Tooltip>

            <CollapsibleContent className="sidebar-submenu">
              <AnimatePresence>
                {item.children.map((child) => (
                  <motion.div
                    key={child.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="mt-1"
                  >
                    <ChildItem
                      child={child}
                      onClick={(href) => onItemClick({ ...child, href })}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    return (
      <Tooltip open={collapsed ? undefined : false}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`sidebar-item h-12 w-full justify-start gap-3 text-white/80 transition-all duration-200 hover:text-white ${
              active ? "active" : ""
            }`}
            onClick={() => onItemClick(item)}
          >
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
              {item.icon}
            </div>
            <AnimatePresence>
              {!collapsed && !isMobile && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate font-medium"
                >
                  {toUpperCase(item.label)}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>

        {(collapsed || isMobile) && !item?.children?.length && (
          <TooltipContent side="right" className="sidebar-tooltip">
            <p>{toUpperCase(item.label)}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  }
);
TopLevelItem.displayName = "TopLevelItem";

interface SideBarContainerProps {
  items: SidebarItem[];
  handleFlyoutEnter: (item: SidebarItem, event: React.MouseEvent) => void;
  handleFlyoutLeave: () => void;
  isMenuExpanded: (menuKey: string) => boolean;
  collapsed: boolean;
  isMobile: boolean;
  toggleMenu: (menuKey: string) => void;
  onPageChange: (href: string | undefined) => void;
  handleItemClick: (item: SidebarItem) => void;
}

export const SidebarContainer: React.FC<SideBarContainerProps> = ({
  items,
  handleFlyoutEnter,
  handleFlyoutLeave,
  isMenuExpanded,
  collapsed,
  isMobile,
  toggleMenu,
  handleItemClick
}) => {
  return (
    <div className="sidebar-menu-container">
      <div className="sidebar-menu-list">
        <nav className="space-y-2 p-4">
          {items.map((item) => (
            <div key={item.key} className={`Sidebar_MenuItem_${item.key}`}>
              <TopLevelItem
                item={item}
                isExpanded={isMenuExpanded(item.key)}
                toggle={() => toggleMenu(item.key)}
                collapsed={collapsed}
                isMobile={isMobile}
                onItemClick={handleItemClick}
                handleFlyoutEnter={handleFlyoutEnter}
                handleFlyoutLeave={handleFlyoutLeave}
              />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
