export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  onSearch?: (term: string) => void;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
  mobileCardRender?: (item: T, actions?: Action<T>[]) => React.ReactNode;
}
