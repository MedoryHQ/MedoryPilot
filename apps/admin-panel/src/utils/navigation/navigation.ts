import type { SidebarItem } from "@/types";

export const normalize = (p?: string) => (p ? p.replace(/^\/|\/$/g, "") : "");

export const pathMatches = (current: string, candidate?: string) => {
  if (!candidate) return false;
  return current === candidate || current.startsWith(candidate + "/");
};

export function computeInitialExpandedKeys(
  items: SidebarItem[],
  pathname: string
) {
  const normalizedPath = normalize(pathname || "/");
  const foundKeys: string[] = [];
  const seen = new Set<string>();

  const traverse = (
    item: SidebarItem,
    topKey: string | null = null
  ): boolean => {
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

  return foundKeys;
}

export const arraysEqual = (a: string[], b: string[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export function getSyncedExpandedMenus(
  prev: string[],
  items: SidebarItem[],
  pathname: string
) {
  const keys = computeInitialExpandedKeys(items, pathname);
  return arraysEqual(prev, keys) ? prev : keys;
}
