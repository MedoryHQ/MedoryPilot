import { useNavigate } from "react-router-dom";
import { URLSearchParams } from "url";

export const getPaginationFields = (
  searchParams: URLSearchParams,
  extendedParams?: string | string[]
) => {
  const getParam = (key: string, defaultValue: string) =>
    searchParams.get(key) || defaultValue;
  const getNumericParam = (key: string, defaultValue: number) =>
    Number(searchParams.get(key)) || defaultValue;

  const page = getNumericParam("page", 1);
  const pageSize = getNumericParam("pageSize", 10);
  const orderBy = getParam("orderBy", "createdAt");
  const order = getParam("order", "desc");
  const search = getParam("search", "");

  const rawFilters = searchParams.get("filters");
  let filtersObj: Record<string, any> = {};
  if (rawFilters) {
    try {
      filtersObj = JSON.parse(rawFilters);
    } catch {
      try {
        filtersObj = JSON.parse(decodeURIComponent(rawFilters));
      } catch {
        filtersObj = {};
      }
    }
  }

  const filledSearchParams = new URLSearchParams();
  filledSearchParams.set("page", page.toString());
  filledSearchParams.set("pageSize", pageSize.toString());
  if (orderBy) filledSearchParams.set("orderBy", orderBy);
  if (order) filledSearchParams.set("order", order);
  if (search) filledSearchParams.set("search", search);
  if (rawFilters && Object.keys(filtersObj).length > 0) {
    filledSearchParams.set("filters", JSON.stringify(filtersObj));
  }

  if (typeof extendedParams === "string") {
    const value = getParam(extendedParams, "");
    if (value) {
      filledSearchParams.set(extendedParams, value);
    }
  } else if (Array.isArray(extendedParams)) {
    extendedParams.forEach((param) => {
      const values = searchParams.getAll(param);
      values.forEach((value) => {
        filledSearchParams.append(param, value);
      });
    });
  }

  return {
    page,
    pageSize,
    orderBy,
    order,
    search,
    filledSearchParams,
    filters: filtersObj
  };
};

export const buildQueryString = (opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc" | string | null;
  filters?: Record<string, any> | string | null;
}) => {
  const params = new URLSearchParams();

  if (opts.search && opts.search !== "") params.set("search", opts.search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.pageSize && opts.pageSize > 0)
    params.set("pageSize", String(opts.pageSize));
  if (opts.orderBy) params.set("orderBy", opts.orderBy);
  if (opts.order) params.set("order", String(opts.order));

  if (opts.filters && typeof opts.filters === "object") {
    if (Object.keys(opts.filters).length > 0) {
      params.set("filters", JSON.stringify(opts.filters));
    }
  } else if (opts.filters && typeof opts.filters === "string") {
    try {
      JSON.parse(opts.filters);
      params.set("filters", opts.filters);
    } catch {
      //
    }
  }

  return params.toString();
};

export const updateQueryParamsAndNavigate = (
  navigate: ReturnType<typeof useNavigate>,
  opts: {
    page?: number;
    pageSize?: number;
    search?: string;
    orderBy?: string;
    order?: "asc" | "desc" | string | null;
    filters?: Record<string, any> | string | null;
  }
) => {
  const qs = buildQueryString(opts);
  navigate(qs ? `?${qs}` : ".");
};
