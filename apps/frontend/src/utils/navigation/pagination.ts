"use client";

interface PaginationFields {
  page: number;
  pageSize: number;
  orderBy: string;
  order: string;
  search: string;
  filledSearchParams: string;
  filters: Record<string, string[] | null>;
}

const getParam = (
  searchParams: URLSearchParams,
  key: string,
  defaultValue = ""
): string => searchParams.get(key) ?? defaultValue;

const getNumericParam = (
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number
): number => {
  const raw = searchParams.get(key);
  if (raw == null) return defaultValue;
  const n = Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
};

const parseFilters = (
  searchParams: URLSearchParams
): Record<string, string[] | null> => {
  const raw = getParam(searchParams, "filters", "");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const buildSearchParams = (
  searchParams: URLSearchParams,
  page: number,
  pageSize: number,
  orderBy: string,
  order: string,
  search: string,
  filters: Record<string, string[] | null>,
  extendedParams?: string | string[]
): URLSearchParams => {
  const filled = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    orderBy,
    order,
    search,
    filters: JSON.stringify(filters),
  });

  if (typeof extendedParams === "string" && extendedParams) {
    const v = getParam(searchParams, extendedParams, "");
    if (v) filled.set(extendedParams, v);
  } else if (Array.isArray(extendedParams)) {
    extendedParams.forEach((param) => {
      const values = searchParams.getAll(param);
      values.forEach((val) => filled.append(param, val));
    });
  }

  return filled;
};

export const getPaginationFields = (
  searchParams: URLSearchParams,
  extendedParams?: string | string[]
): PaginationFields => {
  const page = getNumericParam(searchParams, "page", 1);
  const pageSize = getNumericParam(searchParams, "pageSize", 10);
  const orderBy = getParam(searchParams, "orderBy", "createdAt");
  const order = getParam(searchParams, "order", "desc");
  const search = getParam(searchParams, "search", "");
  const filters = parseFilters(searchParams);

  const filled = buildSearchParams(
    searchParams,
    page,
    pageSize,
    orderBy,
    order,
    search,
    filters,
    extendedParams
  );

  return {
    page,
    pageSize,
    orderBy,
    order,
    search,
    filledSearchParams: filled.toString(),
    filters,
  };
};

export const getPaginationProps = (
  searchParams: URLSearchParams,
  push: (url: string) => void,
  total = 0
) => {
  const currentPage = getNumericParam(searchParams, "page", 1);
  const pageSize = getNumericParam(searchParams, "pageSize", 10);

  return {
    total,
    currentPage,
    pageSize,
    pageSizeOptions: [10, 20, 50, 100],
    onChange: (page: number) => {
      searchParams.set("page", String(page));
      push(`?${searchParams.toString()}`);
    },
    onPageSizeChange: (size: number) => {
      searchParams.set("pageSize", String(size));
      push(`?${searchParams.toString()}`);
    },
    showTotal: (t: number) => `Total: ${t}`,
  };
};

export const updateQueryParams = (
  pagination: { current?: number; pageSize?: number },
  filters: Record<string, string[] | null> | string,
  currentSearch: string,
  push: (url: string) => void
) => {
  const filterValue =
    typeof filters === "string" ? filters : JSON.stringify(filters || {});
  const params = new URLSearchParams({
    ...(currentSearch ? { search: currentSearch } : {}),
    ...(pagination.current ? { page: String(pagination.current) } : {}),
    ...(pagination.pageSize ? { pageSize: String(pagination.pageSize) } : {}),
    ...(filterValue ? { filters: filterValue } : {}),
  });

  push(`?${params.toString()}`);
};
