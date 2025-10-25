import {
  createSerializer,
  parseAsString,
  createLoader,
  createSearchParamsCache,
} from "nuqs/server";

export const searchParams = {
  search: parseAsString.withDefault(""),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const loadSearchParams = createLoader(searchParams);
export const serialize = createSerializer(searchParams);
