import { cn, useMenuItems } from "@/libs";
import { useSidebarStore } from "@/store";
import { MenuItem, SidebarItem } from "@/types";
import { getMenuItemLevels } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TooltipProvider } from "../ui";
import {
  SidebarHeader,
  SidebarContainer,
  SidebarMobileDrawer,
  SidebarFooter,
  SidebarFlyout
} from ".";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const items = useMenuItems();
  const itemLevels = getMenuItemLevels(items as MenuItem[]);
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
    const activeKeys = items
      .filter((item) =>
        item.children
          ? item.children.some((child: any) =>
              currentPath.startsWith(child.href!)
            )
          : currentPath.startsWith(item.href!)
      )
      .map((item) => item.key || item.href || "");

    setExpandedMenus(activeKeys);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (menuKey: string) => {
    if (isMobile) return;

    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  const handleFlyoutEnter = (item: SidebarItem, event: React.MouseEvent) => {
    if (!collapsed || isMobile || !item.children) return;

    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setFlyoutMenu({
      key: item.key,
      position: {
        x: rect.right + 8,
        y: rect.top
      }
    });
  };

  const handleFlyoutLeave = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutMenu(null);
    }, 150);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && isMobile) {
      setMobileDrawer({ open: true, item });
    } else if (item.children && collapsed) {
      return;
    } else if (!item.children) {
      onPageChange(item.href);
    }
  };

  const onPageChange = (href: string | undefined) => {
    console.log("page change...");
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const isMenuExpanded = (menuKey: string) => expandedMenus.includes(menuKey);
  const isActive = (key: string) => currentPath.startsWith(key);
  const isChildActive = (parentKey: string, childKey: string) =>
    currentPath.startsWith(childKey);

  const currentFlyoutItem = items.find((item) => item.key === flyoutMenu?.key);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 left-0 z-[50] flex h-screen flex-col border-r transition-all duration-200 ease-out",
          collapsed || isMobile ? "w-[72px]" : "w-[240px]"
        )}
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
          isActive={isActive}
          onPageChange={onPageChange}
          isChildActive={isChildActive}
          handleItemClick={handleItemClick}
        />
        <SidebarFooter
          collapsed={collapsed}
          isMobile={isMobile}
          onPageChange={onPageChange}
        />
      </div>
      <SidebarFlyout
        handleFlyoutLeave={handleFlyoutLeave}
        collapsed={collapsed}
        isMobile={isMobile}
        onPageChange={onPageChange}
        isChildActive={isChildActive}
        currentFlyoutItem={currentFlyoutItem}
        flyoutMenu={flyoutMenu}
        flyoutTimeoutRef={flyoutTimeoutRef}
        setFlyoutMenu={setFlyoutMenu}
      />
      <SidebarMobileDrawer
        setMobileDrawer={setMobileDrawer}
        mobileDrawer={mobileDrawer}
        isChildActive={isChildActive}
        onPageChange={onPageChange}
      />
    </TooltipProvider>
  );
};
