export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  mobileRender?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
};

export type Action<T> = {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  className?: string;
  hidden?: (item: T) => boolean;
  actionType?: "edit" | "delete" | "custom";
};

export type FilterConfig = {
  key: string;
  label: string;
  type: "select" | "boolean" | "number" | "multiple-select";
  multiple?: boolean;
  withSearch?: boolean;
  searchEndpoint?: string;
  options?: Option[];
  defaultValue?: any;
  onSearchChange?: (q: string) => void;
  searchValue?: string;
};

export interface Option {
  label: string;
  value: any;
}
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  showEdit?: boolean;
  editUrl: string;
  showDelete?: boolean;
  editKey?: "id" | "slug";
  searchable?: boolean;
  refetch?: () => any;
  isLoading?: boolean;
  searchKeys?: string[];
  filters?: FilterConfig[];
  sortable?: boolean;
  pagination?: boolean;
  total: number | undefined;
  keyExtractor?: (item: T) => string;
  emptyMessage?: string;
  mobileCardRender?: (item?: T, actions?: Action<T>[]) => React.ReactNode;
  onSearch?: (q: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (sort: { key: string; direction: "asc" | "desc" | null }) => void;
  actions?: Action<T>[];
  deleteEndpoint?: string;
}
