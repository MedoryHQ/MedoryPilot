import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Button, Input } from ".";
import { Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

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

interface DataTableProps<T> {
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

export function DataTable<T>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  keyExtractor,
  onSearch,
  pagination,
  mobileCardRender
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  const pageSize = pagination?.pageSize || 10;
  const totalPages = pagination?.enabled
    ? Math.ceil(data.length / pageSize)
    : 1;

  const paginatedData = pagination?.enabled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    onSearch?.(value);
  };

  const defaultMobileCard = (item: T) => (
    <div className="space-y-3">
      {columns.map((column) => (
        <div key={column.key} className="flex items-start justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            {column.mobileLabel || column.label}
          </span>
          <span className="text-right text-sm font-medium">
            {column.render
              ? column.render(item)
              : String((item as any)[column.key])}
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
              onClick={() => action.onClick(item)}
              className={`flex-1 ${action.className || ""}`}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {searchable && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 pl-12 text-base"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 hidden shadow-sm md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-border border-b-2">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`text-foreground px-6 py-5 text-left font-semibold ${column.className || ""}`}
                    >
                      {column.label}
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
                {paginatedData.length === 0 ? (
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
                  paginatedData.map((item, index) => (
                    <motion.tr
                      key={keyExtractor(item)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`border-border/50 hover:bg-muted/20 border-b transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"} `}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-6 py-5 ${column.className || ""}`}
                        >
                          {column.render
                            ? column.render(item)
                            : String((item as any)[column.key])}
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            {actions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={() => action.onClick(item)}
                                className={`hover:bg-primary hover:text-primary-foreground transition-colors ${action.className || ""}`}
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
        {paginatedData.length === 0 ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
                <p className="text-muted-foreground text-lg">{emptyMessage}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          paginatedData.map((item, index) => (
            <motion.div
              key={keyExtractor(item)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  {mobileCardRender
                    ? mobileCardRender(item, actions)
                    : defaultMobileCard(item)}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {pagination?.enabled && totalPages > 1 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                {toUpperCase(t("dataTable.page"))} {currentPage}{" "}
                {toUpperCase(t("dataTable.of"))} {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {toUpperCase(t("dataTable.previous"))}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  {toUpperCase(t("dataTable.next"))}
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
