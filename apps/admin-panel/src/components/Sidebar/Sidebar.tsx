import { cn, useMenuItems } from "@/libs";
import { useSidebarStore } from "@/store";
import { SidebarItem } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TooltipProvider } from "../ui";
import {
  SidebarHeader,
  SidebarContainer,
  SidebarFooter,
  SidebarFlyout
} from ".";
import { motion } from "framer-motion";
import { getSyncedExpandedMenus } from "@/utils";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useMenuItems();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const { collapsed, toggleCollapsed } = useSidebarStore();
  const flyoutTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [flyoutMenu, setFlyoutMenu] = useState<{
    key: string;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const pathname = typeof window !== "undefined" ? location.pathname : "/";
    setExpandedMenus((prev) => getSyncedExpandedMenus(prev, items, pathname));
  }, [location.pathname]);

  const handleFlyoutEnter = useCallback(
    (item: SidebarItem, event: React.MouseEvent) => {
      if (!collapsed || !item.children) return;
      if (flyoutTimeoutRef.current) {
        clearTimeout(flyoutTimeoutRef.current);
      }
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyoutMenu({
        key: item.key,
        position: { x: rect.right + 8, y: rect.top }
      });
    },
    [collapsed]
  );

  const handleFlyoutLeave = useCallback(() => {
    flyoutTimeoutRef.current = setTimeout(() => setFlyoutMenu(null), 150);
  }, []);

  const onPageChange = useCallback(
    (href: string | undefined) => {
      if (href) navigate(`/${href}`);
    },
    [navigate]
  );

  const handleItemClick = useCallback(
    (item: SidebarItem) => {
      if (!item.children) onPageChange(item.href);
    },
    [onPageChange]
  );

  const isMenuExpanded = useCallback(
    (menuKey: string) => expandedMenus.includes(menuKey),
    [expandedMenus]
  );

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  }, []);

  const currentFlyoutItem = items.find((it) => it.key === flyoutMenu?.key);

  return (
    <TooltipProvider>
      <motion.div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 left-0 z-[50] hidden h-screen flex-col border-r transition-all duration-200 ease-out md:flex",
          collapsed ? "w-[72px] min-w-[72px]" : "w-[240px] min-w-[240px]"
        )}
        animate={{
          width: collapsed ? 72 : 240
        }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        <SidebarHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
        <SidebarContainer
          items={items}
          handleFlyoutEnter={handleFlyoutEnter}
          handleFlyoutLeave={handleFlyoutLeave}
          toggleMenu={toggleMenu}
          isMenuExpanded={isMenuExpanded}
          collapsed={collapsed}
          onPageChange={onPageChange}
          handleItemClick={handleItemClick}
        />
        <SidebarFooter collapsed={collapsed} onPageChange={onPageChange} />
      </motion.div>
      <SidebarFlyout
        handleFlyoutLeave={handleFlyoutLeave}
        collapsed={collapsed}
        onPageChange={onPageChange}
        currentFlyoutItem={currentFlyoutItem}
        flyoutMenu={flyoutMenu}
        flyoutTimeoutRef={flyoutTimeoutRef}
        setFlyoutMenu={setFlyoutMenu}
      />
    </TooltipProvider>
  );
};
