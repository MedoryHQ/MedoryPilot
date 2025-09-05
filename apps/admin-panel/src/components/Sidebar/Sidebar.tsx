import { cn, useMenuItems } from "@/libs";
import { useSidebarStore } from "@/store";
import { SidebarItem } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "../ui";
import {
  SidebarHeader,
  SidebarContainer,
  SidebarMobileDrawer,
  SidebarFooter,
  SidebarFlyout
} from ".";
import { motion } from "framer-motion";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const items = useMenuItems();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileDrawer, setMobileDrawer] = useState<{
    open: boolean;
    item: SidebarItem | null;
  }>({ open: false, item: null });
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const flyoutTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [flyoutMenu, setFlyoutMenu] = useState<{
    key: string;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const currentPath = window.location.pathname || "/";
    const normalizedPath = currentPath.replace(/^\/|\/$/g, "");

    const foundKeys: string[] = [];
    const seen = new Set<string>();

    const normalize = (p?: string) => (p ? p.replace(/^\/|\/$/g, "") : "");

    const traverse = (item: any, topKey: string | null = null): boolean => {
      const itemHref = normalize(item.href);
      const key = topKey ?? item.key ?? item.href ?? "";

      if (itemHref) {
        if (
          normalizedPath === itemHref ||
          normalizedPath.startsWith(itemHref + "/")
        ) {
          if (!seen.has(key)) {
            seen.add(key);
            foundKeys.push(key);
          }
          return true;
        }
      }

      if (item.children && item.children.length) {
        for (const child of item.children) {
          const childMatched = traverse(
            child,
            topKey ?? item.key ?? item.href ?? ""
          );
          if (childMatched) {
            const parentKey = item.key ?? item.href ?? "";
            if (parentKey && !seen.has(parentKey)) {
              seen.add(parentKey);
              foundKeys.push(parentKey);
            }
            return true;
          }
        }
      }
      return false;
    };

    for (const it of items) {
      traverse(it, it.key ?? it.href ?? "");
    }

    setExpandedMenus(foundKeys);

    return () => window.removeEventListener("resize", handleResize);
    //
  }, []);

  const toggleMenu = useCallback(
    (menuKey: string) => {
      if (isMobile) return;
      setExpandedMenus((prev) =>
        prev.includes(menuKey)
          ? prev.filter((key) => key !== menuKey)
          : [...prev, menuKey]
      );
    },
    [isMobile]
  );
  const handleFlyoutEnter = useCallback(
    (item: SidebarItem, event: React.MouseEvent) => {
      if (!collapsed || isMobile || !item.children) return;

      if (flyoutTimeoutRef.current) {
        clearTimeout(flyoutTimeoutRef.current);
      }

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyoutMenu({
        key: item.key,
        position: {
          x: rect.right + 8,
          y: rect.top
        }
      });
    },
    [collapsed, isMobile]
  );

  const handleFlyoutLeave = useCallback(() => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutMenu(null);
    }, 150);
  }, []);

  const handleItemClick = useCallback(
    (item: SidebarItem) => {
      if (item.children && isMobile) {
        setMobileDrawer({ open: true, item });
      } else if (item.children && collapsed) {
        return;
      } else if (!item.children) {
        onPageChange(item.href);
      }
    },
    //
    [collapsed, isMobile]
  );

  const onPageChange = useCallback(
    (href: string | undefined) => {
      if (href) navigate(`/${href}`!);
    },
    [navigate]
  );

  const isMenuExpanded = useCallback(
    (menuKey: string) => expandedMenus.includes(menuKey),
    [expandedMenus]
  );

  const currentFlyoutItem = items.find((item) => item.key === flyoutMenu?.key);

  return (
    <TooltipProvider>
      <motion.div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 left-0 z-[50] flex h-screen flex-col border-r transition-all duration-200 ease-out",
          collapsed || isMobile ? "w-[72px]" : "w-[240px]"
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
          isMobile={isMobile}
          toggleCollapsed={toggleCollapsed}
        />
        <SidebarContainer
          items={items}
          handleFlyoutEnter={handleFlyoutEnter}
          handleFlyoutLeave={handleFlyoutLeave}
          isMenuExpanded={isMenuExpanded}
          collapsed={collapsed}
          isMobile={isMobile}
          toggleMenu={toggleMenu}
          onPageChange={onPageChange}
          handleItemClick={handleItemClick}
        />
        <SidebarFooter
          collapsed={collapsed}
          isMobile={isMobile}
          onPageChange={onPageChange}
        />
      </motion.div>
      <SidebarFlyout
        handleFlyoutLeave={handleFlyoutLeave}
        collapsed={collapsed}
        isMobile={isMobile}
        onPageChange={onPageChange}
        currentFlyoutItem={currentFlyoutItem}
        flyoutMenu={flyoutMenu}
        flyoutTimeoutRef={flyoutTimeoutRef}
        setFlyoutMenu={setFlyoutMenu}
      />
      <SidebarMobileDrawer
        setMobileDrawer={setMobileDrawer}
        mobileDrawer={mobileDrawer}
        onPageChange={onPageChange}
      />
    </TooltipProvider>
  );
};
