import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  createLoader,
} from "nuqs/server";

export const renderingOptions = ["server", "client"] as const;
export type RenderingOptions = (typeof renderingOptions)[number];

export const paginationParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
};

export const paginationParamsCache = createSearchParamsCache(paginationParams);
export const loadPaginationParams = createLoader(paginationParams);

export const serialize = createSerializer(paginationParams);
