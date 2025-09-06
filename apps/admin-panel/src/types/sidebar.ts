export interface SidebarItem {
  key: string;
  icon: React.ReactNode;
  href?: string;
  label: string;
  children?: SidebarSubItem[];
}

export interface SidebarSubItem {
  href?: string;
  key: string;
  icon: React.ReactNode;
  label: string;
}

export interface NavItem extends SidebarItem {
  action?: string;
}
