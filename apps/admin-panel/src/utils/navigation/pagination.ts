import { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import { URLSearchParams } from "url";

interface PaginationFields {
  page: number;
  pageSize: number;
  orderBy: string;
  order: string;
  search: string;
  filledSearchParams: URLSearchParams;
  filters: Record<string, string[] | null>;
}

export const getPaginationFields = (
  searchParams: URLSearchParams,
  extendedParams?: string | string[]
): PaginationFields => {
  const getParam = (key: string, defaultValue: string) =>
    searchParams.get(key) || defaultValue;
  const getNumericParam = (key: string, defaultValue: number) =>
    Number(searchParams.get(key)) || defaultValue;

  const page = getNumericParam("page", 1);
  const pageSize = getNumericParam("pageSize", 10);
  const orderBy = getParam("orderBy", "createdAt");
  const order = getParam("order", "desc");
  const search = getParam("search", "");
  const filters = JSON.parse(getParam("filters", "{}"));

  const filledSearchParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    orderBy,
    order,
    search,
    filters: JSON.stringify(filters)
  });

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
    filters
  };
};

export const getPaginationProps = (
  searchParams: URLSearchParams,
  navigate: (url: string) => void,
  total: number = 0
): TableProps<any>["pagination"] => ({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  total,
  showTotal: (total) => `ჯამი: ${total}`,
  style: { justifyContent: "center" },
  current: Number(searchParams.get("page")) || 1,
  pageSize: Number(searchParams.get("pageSize")) || 10,
  onChange: (page, pageSize) => {
    searchParams.set("page", page.toString());
    searchParams.set("pageSize", pageSize.toString());
    navigate(`?${searchParams.toString()}`);
  },
  locale: {
    items_per_page: "ელემენტი თითო გვერდზე",
    jump_to: "გადასვლა: ",
    page: "გვერდი"
  }
});

export const updateQueryParams = (
  pagination: { current?: number; pageSize?: number },
  filters: any,
  currentSearch: string,
  navigate: ReturnType<typeof useNavigate>
) => {
  const queryParams = new URLSearchParams({
    ...(currentSearch && { search: currentSearch }),
    ...(pagination.current && { page: pagination.current.toString() }),
    ...(pagination.pageSize && { pageSize: pagination.pageSize.toString() }),
    ...(typeof filters === "string" && { filters })
  });

  navigate(`?${queryParams.toString()}`);
};
