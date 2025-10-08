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
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import Highlight from "react-highlight-words";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DeleteDialog } from "../forms";
import { cn } from "@/libs";

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
  actionType?: "edit" | "delete" | "custom";
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
  showEdit?: boolean;
  showDelete?: boolean;
  searchable?: boolean;
  refetch?: () => any;
  isLoading?: boolean;
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
  actions?: Action<T>[];
  deleteEndpoint?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  showEdit = true,
  showDelete = true,
  refetch,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  filters = [],
  sortable = true,
  pagination = { enabled: false, pageSize: 10, pageSizeOptions: [10, 25, 50] },
  keyExtractor,
  emptyMessage = "No items found",
  mobileCardRender,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  actions: propActions,
  deleteEndpoint
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "",
    direction: null
  });
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const [displayData, setDisplayData] = useState<T[]>(data ?? []);

  const searchFirstRef = useRef(true);
  const filterFirstRef = useRef(true);
  const sortFirstRef = useRef(true);
  const pageFirstRef = useRef(true);

  const internalActions: Action<T>[] = [
    {
      label: toUpperCase(t("dataTable.edit") || "Edit"),
      icon: <Edit className="h-4 w-4" />,
      onClick: (item: any) => navigate(`/landing/headers/edit?id=${item.id}`),
      variant: "outline",
      actionType: "edit"
    },
    {
      label: toUpperCase(t("dataTable.delete") || "Delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item: any) => setDeleteId(item.id),
      variant: "destructive",
      className: "hover:bg-destructive hover:text-destructive-foreground",
      actionType: "delete"
    }
  ];

  const providedActions = propActions ?? internalActions;

  const effectiveActions = providedActions.filter((a) => {
    if (a.actionType === "edit" && !showEdit) return false;
    if (a.actionType === "delete" && !showDelete) return false;
    const labelLow = (a.label || "").toLowerCase();
    if (labelLow.includes("edit") && !showEdit) return false;
    if (labelLow.includes("delete") && !showDelete) return false;
    return true;
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setDisplayData(data ?? []);
  }, [data, isLoading]);

  useEffect(() => {
    if (searchFirstRef.current) {
      searchFirstRef.current = false;
    } else if (onSearch) {
      onSearch(searchTerm);
      setPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (filterFirstRef.current) {
      filterFirstRef.current = false;
    } else if (onFilter) {
      onFilter(activeFilters);
      setPage(1);
    }
  }, [activeFilters]);

  useEffect(() => {
    if (sortFirstRef.current) {
      sortFirstRef.current = false;
    } else if (onSort) {
      onSort(sort);
    }
  }, [sort]);

  useEffect(() => {
    if (pageFirstRef.current) {
      pageFirstRef.current = false;
    } else if (onPageChange) {
      onPageChange(page, pageSize);
    }
  }, [page, pageSize]);

  const totalPages = pagination.enabled
    ? Math.max(1, Math.ceil(displayData.length / pageSize))
    : 1;

  const paged = useMemo(() => {
    if (!pagination.enabled) return displayData;
    const start = (page - 1) * pageSize;
    return displayData.slice(start, start + pageSize);
  }, [displayData, page, pageSize, pagination.enabled]);

  const toggleSort = (key: string) => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: "", direction: null };
    });
  };

  const handleActionClick = (action: Action<T>, row: T) => {
    if (action.actionType === "delete") {
      try {
        const id = keyExtractor(row);
        setDeleteId(id);
      } catch (err) {
        setDeleteId(row.id ?? null);
      }
    }

    if (action.onClick) {
      action.onClick(row);
    }
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
    <>
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
                          className="text-muted-foreground h-auto rounded-[12px] px-2 py-1 text-xs hover:text-white"
                        >
                          {toUpperCase(t("dataTable.clearAll"))}
                        </Button>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      {filters.map((f) => (
                        <div key={f.key} className="space-y-2">
                          <label className="text-sm font-medium">
                            {f.label}
                          </label>

                          {f.type === "select" && f.options && (
                            <Select
                              value={String(
                                activeFilters[f.key] === undefined ||
                                  activeFilters[f.key] === null
                                  ? "__all__"
                                  : String(activeFilters[f.key])
                              )}
                              onValueChange={(val) => {
                                const finalVal =
                                  convertSelectValueToFilter(val);
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
                        className={cn(
                          "text-foreground px-6 py-5 text-left font-semibold",
                          col.className,
                          col.sortable && "cursor-pointer"
                        )}
                        onClick={() => col.sortable && toggleSort(col.key)}
                      >
                        <div className="flex items-center">
                          {col.label}
                          {col.sortable && renderSortIcon(col.key)}
                        </div>
                      </th>
                    ))}
                    {effectiveActions && effectiveActions.length > 0 && (
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
                        colSpan={columns.length + (effectiveActions ? 1 : 0)}
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
                        className={cn(
                          "border-border/50 hover:bg-muted/20 border-b transition-colors",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                        )}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn("px-6 py-5", col.className)}
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
                        {effectiveActions && effectiveActions.length > 0 && (
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {effectiveActions
                                .filter((a) => !a.hidden || !a.hidden(row))
                                .map((action, i) => (
                                  <Button
                                    key={i}
                                    variant={action.variant || "outline"}
                                    size="sm"
                                    onClick={() =>
                                      handleActionClick(action, row)
                                    }
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
                  <p className="text-muted-foreground text-lg">
                    {emptyMessage}
                  </p>
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
                      mobileCardRender(row, effectiveActions)
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
                        {effectiveActions && effectiveActions.length > 0 && (
                          <div className="border-border flex gap-2 border-t pt-3">
                            {effectiveActions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={() => action.onClick(row)}
                                className={cn("flex-1", action.className)}
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

      {deleteEndpoint && (
        <DeleteDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
          endpoint={deleteEndpoint}
          itemId={deleteId}
          onSuccess={() => refetch && refetch()}
        />
      )}
    </>
  );
}
