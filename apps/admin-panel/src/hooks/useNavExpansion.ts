import { useCallback, useEffect, useState } from "react";
import type { SidebarItem } from "@/types";
import { computeInitialExpandedKeys } from "@/utils";

export function useNavExpansion(items: SidebarItem[], depsPath?: string) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    const pathname =
      depsPath ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const keys = computeInitialExpandedKeys(items, pathname);
    setExpandedMenus(keys);
  }, [items, depsPath]);

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((key) => key !== menuKey)
        : [...prev, menuKey]
    );
  }, []);

  const isMenuExpanded = useCallback(
    (menuKey: string) => expandedMenus.includes(menuKey),
    [expandedMenus]
  );

  return {
    expandedMenus,
    setExpandedMenus,
    isMenuExpanded,
    toggleMenu
  } as const;
}

export default useNavExpansion;
