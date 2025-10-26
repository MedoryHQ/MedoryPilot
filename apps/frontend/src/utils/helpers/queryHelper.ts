type BuildQueryParamsInput = {
  orderBy?: string;
  order?: string;
  search?: string;
};

export const buildQueryParams = (
  params: BuildQueryParamsInput
): URLSearchParams => {
  const qp = new URLSearchParams();

  if (params.orderBy) qp.set("orderBy", params.orderBy);
  if (params.order) qp.set("order", params.order);
  if (params.search?.trim()) qp.set("search", params.search.trim());

  return qp;
};
