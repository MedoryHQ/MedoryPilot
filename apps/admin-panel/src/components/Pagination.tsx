import React, { useEffect } from "react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPaginationFields,
  toUpperCase,
  updateQueryParamsAndNavigate
} from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

interface PaginationProps {
  total: number;
}

export const Pagination: React.FC<PaginationProps> = ({ total }) => {
  const [searchParams] = useSearchParams();

  const { pageSize, page, search, orderBy, order, filters } =
    getPaginationFields(searchParams);
  const navigate = useNavigate();

  const { t } = useTranslation();

  const sizeList = [10, 25, 50, 100];

  const handlePageChange = (nextPage: number, nextPageSize?: number) => {
    updateQueryParamsAndNavigate(navigate, {
      page: nextPage,
      pageSize: nextPageSize ?? pageSize,
      search,
      orderBy,
      order,
      filters
    });
  };

  const totalCount = total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const dataLengthForUI = totalCount;

  const handlePageSizeChange = (newSize: number) => {
    handlePageChange(1, newSize);
  };

  useEffect(() => {
    if (page > totalPages) handlePageChange(totalPages);
    if (page < 1) handlePageChange(1);
  }, [totalPages, pageSize, total]);

  useEffect(() => {
    if (typeof page === "number" && page !== page) {
      handlePageChange(page);
    }
  }, [page]);

  const current = typeof page === "number" ? page : page;
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {toUpperCase(t("dataTable.rowsPerPage"))}:
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => handlePageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizeList.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">
          {(current - 1) * pageSize + 1}-
          {Math.min(current * pageSize, dataLengthForUI)} /{dataLengthForUI}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (current <= 3) {
                pageNum = i + 1;
              } else if (current >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = current - 2 + i;
              }
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={current === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
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
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
