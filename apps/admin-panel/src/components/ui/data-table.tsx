import { useState, useEffect, useMemo } from "react";
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
  Separator,
  TableCell,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Skeleton,
  DatePicker
} from "@/components/ui";
import {
  Search,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Edit,
  Trash2,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import Highlight from "react-highlight-words";
import {
  getPaginationFields,
  toUpperCase,
  updateQueryParamsAndNavigate
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DeleteDialog } from "../forms";
import { cn } from "@/libs";
import { Pagination } from "../Pagination";
import { Action, DataTableProps } from "@/types/ui";
import { MultiSelectFilter } from "../MutliSelectFilter";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  showEdit = true,
  showDelete = true,
  refetch,
  editUrl,
  editKey = "id",
  total,
  isLoading = false,
  searchable = true,
  filters = [],
  sortable = true,
  pagination = true,
  keyExtractor = (it) => it.id,
  emptyMessage = "No items found",
  mobileCardRender,
  actions: propActions,
  deleteEndpoint
}: DataTableProps<T>) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const {
    pageSize,
    orderBy,
    order,
    search: paramSearch,
    filters: paramFilters
  } = useMemo(() => getPaginationFields(searchParams), [searchParams]);

  const [searchTerm, setSearchTerm] = useState<string>(() => paramSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(
    () => paramSearch ?? ""
  );
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(
    () => paramFilters ?? {}
  );
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "",
    direction: null
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const paramFiltersJson = JSON.stringify(paramFilters ?? {});

  const updateQuery = (params: any) => {
    updateQueryParamsAndNavigate(navigate, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? pageSize,
      search: params.search ?? debouncedSearch,
      orderBy: params.orderBy ?? orderBy,
      order: params.order ?? order,
      filters: params.filters ?? paramFilters
    });
  };

  useEffect(() => {
    if ((debouncedSearch ?? "") !== (paramSearch ?? "")) {
      updateQuery({ search: debouncedSearch });
    }
  }, [debouncedSearch, paramSearch]);

  useEffect(() => {
    const cleaned = Object.entries(activeFilters).reduce(
      (acc, [k, v]) => {
        if (v === null || v === undefined || v === "") return acc;
        acc[k] = v;
        return acc;
      },
      {} as Record<string, any>
    );
    updateQuery({ filters: cleaned });
  }, [activeFilters]);

  useEffect(() => {
    if (sort.key && sort.direction) {
      updateQuery({ orderBy: sort.key, order: sort.direction });
    } else {
      updateQuery({ orderBy: undefined, order: undefined });
    }
  }, [sort]);

  useEffect(() => {
    if ((paramSearch ?? "") !== (searchTerm ?? "")) {
      setSearchTerm(paramSearch ?? "");
      setDebouncedSearch(paramSearch ?? "");
    }
    try {
      const parsedPF = paramFilters ?? {};
      if (JSON.stringify(parsedPF) !== JSON.stringify(activeFilters ?? {})) {
        setActiveFilters(parsedPF);
      }
    } catch {
      // ignore
    }
    const desiredSortKey = orderBy ?? "";
    const desiredSortDir = (order as "asc" | "desc") ?? null;
    if (desiredSortKey !== sort.key || desiredSortDir !== sort.direction) {
      setSort({ key: desiredSortKey, direction: desiredSortDir });
    }
  }, [paramSearch, paramFiltersJson, orderBy, order]);

  const toggleSort = (key: string) => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: "", direction: null };
    });
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;

  const convertSelectValue = (value: string | undefined) => {
    if (!value || value === "__all__") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  };

  const internalActions: Action<T>[] = [
    {
      label: toUpperCase(t("dataTable.edit") || "Edit"),
      icon: <Edit className="h-4 w-4 group-hover:text-white" />,
      onClick: (item: any) =>
        navigate(
          `${editUrl}?${editKey === "slug" ? `slug=${item.slug}` : `id=${item.id}`}`
        ),
      variant: "outline",
      actionType: "edit"
    },
    {
      label: toUpperCase(t("dataTable.delete") || "Delete"),
      icon: <Trash2 className="h-4 w-4 group-hover:text-white" />,
      onClick: (item: any) =>
        setDeleteId(editKey === "slug" ? item.slug : item.id),
      variant: "destructive",
      actionType: "delete"
    }
  ];

  const actions = propActions ?? internalActions;
  const effectiveActions = actions.filter((a) => {
    if (a.actionType === "edit" && !showEdit) return false;
    if (a.actionType === "delete" && !showDelete) return false;
    return true;
  });

  const renderSortIcon = (colKey: string) => {
    if (!sortable) return null;
    if (sort.key === colKey)
      return sort.direction === "asc" ? (
        <ArrowUp className="ml-2 inline h-4 w-4" />
      ) : (
        <ArrowDown className="ml-2 inline h-4 w-4" />
      );
    return <ArrowUpDown className="ml-2 inline h-4 w-4 opacity-40" />;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
          {searchable && (
            <div className="relative w-full flex-1">
              <Search className="text-secondary-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={toUpperCase(t("services.search"))}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:border-foreground/10 h-[40px] pl-9"
              />
            </div>
          )}

          {filters.length > 0 && (
            <div className="flex w-full flex-col items-center gap-2 md:w-min md:flex-row">
              <Button
                className="h-[40px] w-full md:w-min"
                variant="outline"
                onClick={() => setActiveFilters({})}
              >
                {toUpperCase(t("dataTable.clearFilters"))}
              </Button>
              <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className="h-[40px] w-full md:w-min"
                    variant="outline"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {toUpperCase(t("dataTable.filters"))}
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 flex h-6 w-6 min-w-6 items-center justify-center rounded-full text-xs leading-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 md:mr-[20px] lg:mr-[28px]">
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
                          className="text-xs hover:text-white"
                        >
                          {toUpperCase(t("dataTable.clearAll"))}
                        </Button>
                      )}
                    </div>
                    <Separator />
                    {filters.map((f) => (
                      <div key={f.key} className="space-y-2">
                        <label className="mb-1.5 block text-sm font-medium">
                          {f.label}
                        </label>

                        {f.type === "select" && f.options && (
                          <Select
                            value={String(activeFilters[f.key] ?? "__all__")}
                            onValueChange={(val) =>
                              setActiveFilters((prev) => ({
                                ...prev,
                                [f.key]: convertSelectValue(val)
                              }))
                            }
                          >
                            <SelectTrigger variant="minimize">
                              <SelectValue
                                placeholder={toUpperCase(t("dataTable.all"))}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">
                                {toUpperCase(t("dataTable.all"))}
                              </SelectItem>
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
                        {f.type === "multiple-select" && (
                          <div>
                            <MultiSelectFilter
                              f={f as any}
                              values={
                                Array.isArray(activeFilters[f.key])
                                  ? (activeFilters[f.key] as string[])
                                  : []
                              }
                              setActiveFilters={setActiveFilters}
                            />
                          </div>
                        )}

                        {f.type === "number" && (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder={toUpperCase(t("dataTable.min"))}
                              value={activeFilters[f.key]?.min ?? ""}
                              onChange={(e) =>
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [f.key]: {
                                    ...(prev[f.key] || {}),
                                    min:
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                  }
                                }))
                              }
                              className="w-1/2"
                            />
                            <Input
                              type="number"
                              placeholder={toUpperCase(t("dataTable.max"))}
                              value={activeFilters[f.key]?.max ?? ""}
                              onChange={(e) =>
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [f.key]: {
                                    ...(prev[f.key] || {}),
                                    max:
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                  }
                                }))
                              }
                              className="w-1/2"
                            />
                          </div>
                        )}
                        {f.type === "date" && (
                          <div>
                            <DatePicker
                              value={
                                activeFilters[f.key]
                                  ? new Date(activeFilters[f.key])
                                  : undefined
                              }
                              onChange={(d) =>
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [f.key]: d
                                    ? (d as Date).toISOString()
                                    : undefined
                                }))
                              }
                              placeholder={toUpperCase(
                                t("dataTable.selectDate") || "Select date"
                              )}
                              showClearButton
                            />
                          </div>
                        )}

                        {f.type === "date-range" && (
                          <div className="grid grid-cols-2 gap-2">
                            <DatePicker
                              value={
                                activeFilters[f.key]?.from
                                  ? new Date(activeFilters[f.key].from)
                                  : undefined
                              }
                              onChange={(d) =>
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [f.key]: {
                                    ...(prev[f.key] || {}),
                                    from: d
                                      ? (d as Date).toISOString()
                                      : undefined
                                  }
                                }))
                              }
                              placeholder={toUpperCase(
                                t("dataTable.from") || "From"
                              )}
                              showClearButton
                            />
                            <DatePicker
                              value={
                                activeFilters[f.key]?.to
                                  ? new Date(activeFilters[f.key].to)
                                  : undefined
                              }
                              onChange={(d) =>
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  [f.key]: {
                                    ...(prev[f.key] || {}),
                                    to: d
                                      ? (d as Date).toISOString()
                                      : undefined
                                  }
                                }))
                              }
                              placeholder={toUpperCase(
                                t("dataTable.to") || "To"
                              )}
                              showClearButton
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <Card className="border-border/50 hidden md:block">
          <CardContent className="p-0">
            <div className="border-border overflow-x-auto rounded-[14px] border-1">
              <table className="w-full">
                <thead className="bg-secondary/50 border-border border-b-1">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "text-foreground px-6 py-3 text-left text-sm font-medium",
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
                    {effectiveActions.length > 0 && (
                      <th className="px-6 py-3 text-end text-sm font-medium">
                        {toUpperCase(t("dataTable.actions"))}
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="text-muted-foreground py-8 text-center text-sm"
                      >
                        <div className="flex w-full justify-center">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (effectiveActions ? 1 : 0)}
                        className="text-secondary-foreground py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle className="text-secondary-foreground/50 h-12 w-12" />
                          <p className="text-lg">{emptyMessage}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <motion.tr
                        key={keyExtractor(row)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-border/30 hover:bg-secondary/30 border-b"
                      >
                        {columns.map((col) => (
                          <td key={col.key} className="px-6 py-4">
                            {col.render ? (
                              col.render(row)
                            ) : typeof row[col.key] === "string" &&
                              debouncedSearch.trim() ? (
                              <Highlight
                                searchWords={[debouncedSearch.trim()]}
                                textToHighlight={row[col.key]}
                                highlightClassName="bg-yellow-200"
                              />
                            ) : (
                              String(row[col.key] ?? "")
                            )}
                          </td>
                        ))}
                        {effectiveActions.length > 0 && (
                          <td className="flex justify-end px-6 py-4">
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    className="group transition-all duration-200"
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <MoreHorizontal className="h-4 w-4 group-hover:text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {actions.map((action, actionIndex) => (
                                    <DropdownMenuItem
                                      key={actionIndex}
                                      onClick={() => action.onClick(row)}
                                      className={cn(
                                        "group min-w-[120px]",
                                        action.variant === "destructive" &&
                                          "text-destructive"
                                      )}
                                    >
                                      {action.icon}
                                      <span className="ml-2">
                                        {action.label}
                                      </span>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
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
          {isLoading ? (
            Array.from({ length: 10 }).map((_, sIdx) => (
              <motion.div
                key={`skeleton-${sIdx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.03 }}
              >
                <Card className="border-border/50" aria-busy="true">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {mobileCardRender
                        ? mobileCardRender()
                        : Array.from({
                            length: Math.max(3, columns?.length ?? 3)
                          }).map((_, rowIdx) => (
                            <div
                              key={`s-row-${rowIdx}`}
                              className="flex items-start justify-between"
                            >
                              <Skeleton className="h-4 w-1/3 rounded-md" />
                              <Skeleton className="h-4 w-1/2 rounded-md" />
                            </div>
                          ))}

                      {effectiveActions && effectiveActions.length > 0 && (
                        <div className="border-border flex gap-2 border-t pt-3">
                          <div className="flex w-full gap-2">
                            <Skeleton className="h-9 flex-1 rounded-md" />
                            <Skeleton className="h-9 flex-1 rounded-md" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : data.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="text-secondary-foreground/50 h-12 w-12" />
                  <p className="text-secondary-foreground text-lg">
                    {emptyMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            data.map((row, idx) => (
              <motion.div
                key={keyExtractor(row)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {mobileCardRender
                        ? mobileCardRender(row)
                        : columns.map((col) => (
                            <div
                              key={col.key}
                              className="flex items-start justify-between"
                            >
                              <span className="text-secondary-foreground text-sm font-medium">
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
                          {isLoading ? (
                            <div className="flex w-full gap-2">
                              <Skeleton className="h-9 flex-1 rounded-md" />
                              <Skeleton className="h-9 flex-1 rounded-md" />
                            </div>
                          ) : (
                            effectiveActions.map((action, idx) => (
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
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        {pagination && total !== undefined && total > 0 && (
          <Pagination total={total} />
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
