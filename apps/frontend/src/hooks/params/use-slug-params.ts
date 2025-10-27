import { useCallback } from "react";
import { useQueryState } from "nuqs";

export function useSlugParams() {
  const [slugParams, setSlugParams] = useQueryState("slug", {
    defaultValue: "",
    scroll: false,
    clearOnDefault: true,
    throttleMs: 200,
  });

  const set = useCallback(
    (value: string | ((prev: string) => string)) => setSlugParams(value),
    [setSlugParams]
  );

  return { slugParams, setSlugParams: set };
}
