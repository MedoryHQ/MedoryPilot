import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create(
  persist<SidebarStore>(
    (set) => {
      return {
        collapsed: window.innerWidth < 768,
        toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed }))
      };
    },
    {
      name: "sidebar-store"
    }
  )
);
