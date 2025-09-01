export interface SidebarProps {
  collapsed: boolean;
  currentPage: string;
  language: string;
  onPageChange: (page: string) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export interface SidebarItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: SidebarSubItem[];
}

export interface SidebarSubItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}
