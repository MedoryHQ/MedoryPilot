import { MenuItem } from "@/types";

export const getMenuItemLevels = (menuItems: MenuItem[]) => {
  const levelsByKey: Record<string, number> = {};

  const traverseMenu = (items: MenuItem[], currentLevel = 1) => {
    items.forEach((item) => {
      if (item.key) {
        levelsByKey[item.key] = currentLevel;
      }
      if (item.children) {
        traverseMenu(item.children, currentLevel + 1);
      }
    });
  };

  traverseMenu(menuItems);
  return levelsByKey;
};
