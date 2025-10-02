import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Button, Input } from ".";
import { Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPaginationFields, toUpperCase, updateQueryParams } from "@/utils";
import { DataTableProps } from "@/types/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import Highlight from "react-highlight-words";

export function DataTable<T>({
  data,
  columns,
  actions,
  searchable = true,
  emptyMessage = "No data found",
  keyExtractor,
  onSearch,
  pagination,
  mobileCardRender
}: DataTableProps<T>) {
  const [searchParams] = useSearchParams();
  const { search } = getPaginationFields(searchParams);
  const [searchTerm, setSearchTerm] = useState<string>(search || "");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageSize = pagination?.pageSize || 10;
  const totalPages = pagination?.enabled
    ? Math.ceil(data.length / pageSize)
    : 1;

  const paginatedData = pagination?.enabled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

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
      {searchable && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="!p-3 md:!p-5">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
              <Input
                placeholder={toUpperCase(t("headers.search"))}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    onSearch?.(searchTerm);
                    updateQueryParams({}, null, searchTerm, navigate);
                  }
                }}
                className="h-12 w-full pl-12 text-base"
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
                          {column.render ? (
                            column.render(item)
                          ) : typeof (item as any)[column.key] === "string" &&
                            searchTerm.trim() ? (
                            <Highlight
                              searchWords={[searchTerm.trim()]}
                              autoEscape
                              textToHighlight={(item as any)[column.key]}
                              highlightClassName="bg-yellow-200"
                            />
                          ) : (
                            String((item as any)[column.key])
                          )}
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
