import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Separator
} from "@/components/ui";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import Highlight from "react-highlight-words";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
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
};

export type FilterConfig = {
  key: string;
  label: string;
  type: "select" | "boolean";
  options?: { label: string; value: any }[];
  defaultValue?: any;
};

export type PaginationConf = {
  enabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: FilterConfig[];
  sortable?: boolean;
  pagination?: PaginationConf;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  mobileCardRender?: (item: T, actions?: Action<T>[]) => React.ReactNode;
  onSearch?: (q: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (sort: { key: string; direction: "asc" | "desc" | null }) => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filters = [],
  sortable = true,
  pagination = { enabled: false, pageSize: 10, pageSizeOptions: [10, 25, 50] },
  keyExtractor,
  emptyMessage = "No items found",
  mobileCardRender,
  onSearch,
  onFilter,
  onSort,
  onPageChange
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "",
    direction: null
  });
  const { t } = useTranslation();
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const searchFirstRef = useRef(true);
  const filterFirstRef = useRef(true);
  const sortFirstRef = useRef(true);
  const pageFirstRef = useRef(true);

  useEffect(() => {
    if (searchFirstRef.current) {
      searchFirstRef.current = false;
      return;
    }
    if (onSearch) onSearch(searchTerm);
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (filterFirstRef.current) {
      filterFirstRef.current = false;
      return;
    }
    if (onFilter) onFilter(activeFilters);
    setPage(1);
  }, [activeFilters]);

  useEffect(() => {
    if (sortFirstRef.current) {
      sortFirstRef.current = false;
      return;
    }
    if (onSort) onSort(sort);
  }, [sort]);

  useEffect(() => {
    if (pageFirstRef.current) {
      pageFirstRef.current = false;
      return;
    }
    if (onPageChange) onPageChange(page, pageSize);
  }, [page, pageSize]);

  useEffect(() => {
    if (onSearch) onSearch(searchTerm);
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (onFilter) onFilter(activeFilters);
    setPage(1);
  }, [activeFilters]);

  useEffect(() => {
    if (onSort) onSort(sort);
  }, [sort]);

  useEffect(() => {
    if (onPageChange) onPageChange(page, pageSize);
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchable && searchTerm && searchKeys.length) {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((k) => {
          const val = item[k];
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    Object.entries(activeFilters).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (v === "has") {
        result = result.filter((it) => {
          const val = it[k];
          return val !== undefined && val !== null && val !== "";
        });
      } else if (v === "no") {
        result = result.filter((it) => {
          const val = it[k];
          return val === undefined || val === null || val === "";
        });
      } else {
        if (v === "true")
          result = result.filter((it) => it[k] === true || it[k] === "true");
        else if (v === "false")
          result = result.filter((it) => it[k] === false || it[k] === "false");
        else result = result.filter((it) => it[k] === v);
      }
    });

    return result;
  }, [data, searchTerm, searchKeys, activeFilters, searchable]);

  const sorted = useMemo(() => {
    if (!sort.direction || !sort.key) return filtered;
    const s = [...filtered].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sort.direction === "asc"
          ? aVal === bVal
            ? 0
            : aVal
              ? -1
              : 1
          : aVal === bVal
            ? 0
            : aVal
              ? 1
              : -1;
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sort.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return s;
  }, [filtered, sort]);

  const totalPages = pagination.enabled
    ? Math.max(1, Math.ceil(sorted.length / pageSize))
    : 1;
  const paged = useMemo(() => {
    if (!pagination.enabled) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, pagination.enabled]);

  const toggleSort = (key: string) => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: "", direction: null };
    });
  };

  const renderSortIcon = (colKey: string) => {
    if (!sortable) return null;
    if (sort.key === colKey) {
      if (sort.direction === "asc")
        return <ArrowUp className="ml-2 inline h-4 w-4" />;
      if (sort.direction === "desc")
        return <ArrowDown className="ml-2 inline h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 inline h-4 w-4 opacity-40" />;
  };

  const convertSelectValueToFilter = (value: string | undefined) => {
    if (!value || value === "__all__") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
        {searchable && (
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filters && filters.length > 0 && (
          <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-start">
            <Button variant="outline" onClick={() => setActiveFilters({})}>
              {toUpperCase(t("dataTable.clearFilters"))}
            </Button>

            <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative shrink-0">
                  <Filter className="mr-2 h-4 w-4" />
                  {toUpperCase(t("dataTable.filters"))}
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="default"
                      className="ml-2 h-5 min-w-[20px] px-1 text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {toUpperCase(t("dataTable.filters"))}
                    </h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveFilters({})}
                        className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
                      >
                        {toUpperCase(t("dataTable.clearAll"))}
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {filters.map((f) => (
                      <div key={f.key} className="space-y-2">
                        <label className="text-sm font-medium">{f.label}</label>

                        {f.type === "select" && f.options && (
                          <Select
                            value={String(
                              activeFilters[f.key] === undefined ||
                                activeFilters[f.key] === null
                                ? "__all__"
                                : String(activeFilters[f.key])
                            )}
                            onValueChange={(val) => {
                              const finalVal = convertSelectValueToFilter(val);
                              setActiveFilters((prev) => ({
                                ...prev,
                                [f.key]: finalVal
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="__all__">All</SelectItem>
                              {f.options.map((opt) => (
                                <SelectItem
                                  key={String(opt.value)}
                                  value={String(opt.value)}
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <Card className="border-border/50 hidden shadow-sm md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-border border-b-2">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-foreground px-6 py-5 text-left font-semibold ${col.className || ""} ${col.sortable ? "cursor-pointer" : ""}`}
                      onClick={() => col.sortable && toggleSort(col.key)}
                    >
                      <div className="flex items-center">
                        {col.label}
                        {col.sortable && renderSortIcon(col.key)}
                      </div>
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="text-foreground px-6 py-5 text-center font-semibold">
                      {toUpperCase(t("dataTable.actions"))}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions ? 1 : 0)}
                      className="text-muted-foreground py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
                        <p className="text-lg">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((row, idx) => (
                    <motion.tr
                      key={keyExtractor(row)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`border-border/50 hover:bg-muted/20 border-b transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-6 py-5 ${col.className || ""}`}
                        >
                          {col.render ? (
                            col.render(row)
                          ) : typeof row[col.key] === "string" &&
                            searchTerm.trim() ? (
                            <Highlight
                              searchWords={[searchTerm.trim()]}
                              autoEscape
                              textToHighlight={row[col.key]}
                              highlightClassName="bg-yellow-200"
                            />
                          ) : (
                            String(row[col.key] ?? "")
                          )}
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            {actions
                              .filter((a) => !a.hidden || !a.hidden(row))
                              .map((action, i) => (
                                <Button
                                  key={i}
                                  variant={action.variant || "outline"}
                                  size="sm"
                                  onClick={() => action.onClick(row)}
                                  className={action.className}
                                >
                                  {action.icon}
                                  <span className="ml-2">{action.label}</span>
                                </Button>
                              ))}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 md:hidden">
        {paged.length === 0 ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
                <p className="text-muted-foreground text-lg">{emptyMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          paged.map((row, idx) => (
            <motion.div
              key={keyExtractor(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  {mobileCardRender ? (
                    mobileCardRender(row, actions)
                  ) : (
                    <div className="space-y-3">
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className="flex items-start justify-between"
                        >
                          <span className="text-muted-foreground text-sm font-medium">
                            {col.mobileLabel || col.label}
                          </span>
                          <span className="text-right text-sm font-medium">
                            {col.render
                              ? col.render(row)
                              : String(row[col.key] ?? "")}
                          </span>
                        </div>
                      ))}
                      {actions && actions.length > 0 && (
                        <div className="border-border flex gap-2 border-t pt-3">
                          {actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className={`flex-1 ${action.className || ""}`}
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {pagination.enabled && totalPages > 1 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                {toUpperCase(
                  t("dataTable.pages", {
                    page,
                    totalPages
                  })
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Button>

                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
