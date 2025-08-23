import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  collapsed: boolean;
  changeCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create(
  persist<SidebarStore>(
    (set) => {
      return {
        collapsed: false,
        changeCollapsed: (value) => {
          set(() => ({
            collapsed: value
          }));
        }
      };
    },
    {
      name: "sidebar-store"
    }
  )
);
