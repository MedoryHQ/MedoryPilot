import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/api/axios";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";
import { getTranslatedField, toUpperCase, handleError } from "@/utils";

type Option = { label: string; value: string };

interface TranslatedSelectProps {
  endpoints: string | string[];
  translationKey: string | string[];
  value?: string[];
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (values: string[]) => void;
  onUpdateOption?: (option: Option) => void;
  limit?: number;
  name?: string;
  defaultValue?: string[];
}

const cache: Record<string, Option[] | undefined> = {};
const promiseCache: Record<string, Promise<Option[]> | undefined> = {};

export const TranslatedSelect: React.FC<TranslatedSelectProps> = ({
  endpoints,
  translationKey,
  value = [],
  multiple = true,
  placeholder,
  disabled = false,
  className,
  onChange,
  onUpdateOption,
  limit = 10,
  defaultValue = []
}) => {
  const { i18n, t } = useTranslation();
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const formatOption = useCallback(
    (item: any, endpoint: string): Option => {
      if (Array.isArray(translationKey)) {
        const label = translationKey
          .map((k) => getTranslatedField(item.translations, i18n.language, k))
          .filter(Boolean)
          .join(" ");
        return { label: label || String(item.id), value: item.id };
      }

      if (typeof translationKey === "string") {
        if (translationKey === "name") {
          if (item.name) return { label: item.name, value: item.id };
          return {
            label: getTranslatedField(item.translations, i18n.language, "name"),
            value: item.id
          };
        }

        const label = getTranslatedField(
          item.translations,
          i18n.language,
          translationKey
        );
        return { label: label || String(item.id), value: item.id };
      }

      return { label: String(item.id), value: item.id };
    },
    [i18n.language, translationKey]
  );

  const buildCacheKey = (endpoint: string, params: any) =>
    `${endpoint}|${JSON.stringify(params)}`;

  const fetchEndpoint = useCallback(
    async (endpoint: string, params: any) => {
      const cacheKey = buildCacheKey(endpoint, params);
      if (cache[cacheKey]) return cache[cacheKey] as Option[];
      if (promiseCache[cacheKey]) return await promiseCache[cacheKey];

      const fetchPromise = axios
        .get(endpoint, { params })
        .then(({ data }) => {
          const items = data?.data ?? data;
          const opts = (items || []).map((it: any) =>
            formatOption(it, endpoint)
          );
          cache[cacheKey] = opts;
          delete promiseCache[cacheKey];
          return opts;
        })
        .catch((err) => {
          delete promiseCache[cacheKey];
          const errors = handleError(err, i18n.language as "en" | "ka");
          if (errors && errors.length) {
            //
          }
          return [];
        });

      promiseCache[cacheKey] = fetchPromise;
      return await fetchPromise;
    },
    [formatOption, i18n.language]
  );

  const fetchOptions = useCallback(
    async (searchText: string) => {
      setLoading(true);
      try {
        const params = {
          search: searchText || undefined,
          limit: searchText ? undefined : limit,
          language: i18n.language
        };

        let opts: Option[] = [];
        if (typeof endpoints === "string") {
          opts = (await fetchEndpoint(endpoints, params)) || [];
        } else {
          const results = await Promise.all(
            endpoints.map((ep) => fetchEndpoint(ep, params))
          );
          opts = results.flat();
        }

        if (!mountedRef.current) return;

        if (searchText) {
          setOptions(opts);
        } else {
          setOptions((prev) => {
            const combined = [...prev, ...opts].filter(Boolean);
            const map = new Map<string, Option>();
            for (const o of combined) map.set(String(o.value), o);
            return Array.from(map.values());
          });
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [endpoints, fetchEndpoint, i18n.language, limit]
  );

  useEffect(() => {
    fetchOptions("");
  }, []);

  useEffect(() => {
    fetchOptions(debouncedSearch);
  }, [debouncedSearch, fetchOptions]);

  const addValue = (val: string) => {
    if (!multiple) {
      onChange?.([val]);
      setOpen(false);
      return;
    }
    const next = Array.from(new Set([...(value ?? defaultValue ?? []), val]));
    onChange?.(next);
  };

  const removeValue = (val: string) => {
    const next = (value ?? defaultValue ?? []).filter((v) => v !== val);
    onChange?.(next);
  };

  const selectedOptions = (value ?? defaultValue ?? []).map((v) => {
    const opt = options.find((o) => o.value === v);
    return opt ?? { label: String(v), value: v };
  });

  return (
    <div className={className}>
      <div className="relative">
        <div
          className={`border-input bg-input-background flex min-h-[40px] w-full flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            disabled ? "opacity-50" : ""
          }`}
          onClick={() => !disabled && setOpen((s) => !s)}
        >
          {selectedOptions.length === 0 ? (
            <div className="text-muted-foreground">
              {placeholder ?? toUpperCase(t("select"))}
            </div>
          ) : (
            selectedOptions.map((opt) => (
              <div
                key={opt.value}
                className="bg-muted/20 inline-flex items-center gap-2 rounded px-2 py-1 text-xs"
              >
                <span>{opt.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(opt.value);
                    }}
                    className="ml-1 opacity-70 hover:opacity-100"
                    aria-label="remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            disabled={disabled}
            placeholder={
              selectedOptions.length
                ? undefined
                : (placeholder ?? toUpperCase(t("select")))
            }
            className="ml-1 flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {open && (
          <div className="bg-popover absolute z-50 mt-2 w-full rounded-md border p-2 shadow-md">
            {loading ? (
              <div className="text-muted-foreground p-2 text-sm">
                {toUpperCase(t("loading"))}
              </div>
            ) : options.length === 0 ? (
              <div className="text-muted-foreground p-2 text-sm">
                {toUpperCase(t("noData"))}
              </div>
            ) : (
              <div className="max-h-60 overflow-auto">
                {options.map((opt) => {
                  const selected = (value ?? defaultValue ?? []).includes(
                    opt.value
                  );
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          removeValue(opt.value);
                        } else {
                          addValue(opt.value);
                        }
                        onUpdateOption?.(opt);
                      }}
                      className={`hover:bg-accent/10 w-full px-2 py-2 text-left text-sm ${
                        selected ? "bg-accent/10" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>{opt.label}</div>
                        {selected && (
                          <div className="text-muted-foreground text-xs">✓</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatedSelect;
