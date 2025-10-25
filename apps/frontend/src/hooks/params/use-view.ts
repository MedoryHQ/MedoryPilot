import { createSearchParamsCache, parseAsString } from "nuqs/server";

export enum View {
  list = "list",
  grid = "grid",
}

export const useViewParams = {
  view: parseAsString.withDefault(View.grid),
};

export const viewParamsCache = createSearchParamsCache(useViewParams);
