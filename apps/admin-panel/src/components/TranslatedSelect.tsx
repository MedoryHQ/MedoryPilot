import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useId
} from "react";
import { useTranslation } from "react-i18next";
import axios from "@/api/axios";
import { useDebounce } from "@/hooks/useDebounce";
import { handleError, toUpperCase } from "@/utils";
import {
  Label,
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import { CheckIcon } from "lucide-react";
import { Option, TranslatedSelectProps } from "@/types";
import { cn } from "@/libs";

const cache: Record<string, Option[] | undefined> = {};
const promiseCache: Record<string, Promise<Option[]> | undefined> = {};

export const TranslatedSelect: React.FC<TranslatedSelectProps> = React.memo(
  ({
    label,
    endpoints,
    translationKey,
    disabled,
    className,
    placeholder,
    mode,
    onChange,
    enabled = true,
    onFetch,
    labelInValue,
    labelKey,
    onUpdate,
    defaultValue,
    value,
    error
  }) => {
    const { t, i18n } = useTranslation();
    const uniqId = useId();
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const debouncedSearchText = useDebounce(searchText, 300);
    const cacheRef = useRef(cache);
    const promiseCacheRef = useRef(promiseCache);
    const hasFetchedRef = useRef(false);
    const [open, setOpen] = useState(false);

    const buildCacheKey = (endpoint: string, params: any) =>
      `${endpoint}::${JSON.stringify(params)}`;

    const fetchEndpoint = useCallback(
      async (endpoint: string, params: any) => {
        const cacheKey = buildCacheKey(endpoint, params);
        if (cacheRef.current[cacheKey]) return cacheRef.current[cacheKey]!;
        if (promiseCacheRef.current[cacheKey])
          return await promiseCacheRef.current[cacheKey]!;

        const p = axios
          .get(endpoint, { params })
          .then(({ data }) => {
            onFetch?.(data);
            const items = data?.data ?? data;

            cacheRef.current[cacheKey] = items;
            delete promiseCacheRef.current[cacheKey];
            return items;
          })
          .catch((err) => {
            delete promiseCacheRef.current[cacheKey];
            handleError(err, i18n.language as "en" | "ka");
            return [];
          });

        promiseCacheRef.current[cacheKey] = p;
        return await p;
      },
      [i18n.language, onFetch, labelKey, translationKey]
    );

    const fetchOptions = useCallback(
      async (s: string) => {
        if (!enabled) return;
        setLoading(true);
        try {
          const params = {
            search: s || undefined,
            limit: s ? undefined : 10,
            language: i18n.language
          };
          let newOptions: Option[] = [];
          if (typeof endpoints === "string") {
            newOptions = await fetchEndpoint(endpoints, params);
          } else {
            const results = await Promise.all(
              endpoints.map((ep) => fetchEndpoint(ep, params))
            );
            newOptions = results.flat();
          }
          if (s) {
            setOptions(newOptions || []);
          } else {
            setOptions((prev) => {
              const combined = [...prev, ...(newOptions ?? [])].filter(Boolean);
              const map = new Map<string | number, Option>();
              for (const o of combined) map.set(String(o.value), o);
              return Array.from(map.values());
            });
          }
        } finally {
          setLoading(false);
        }
      },
      [enabled, endpoints, fetchEndpoint, i18n.language]
    );

    useEffect(() => {
      if (endpoints && !hasFetchedRef.current) {
        fetchOptions("");
        hasFetchedRef.current = true;
      }
    }, [endpoints, fetchOptions]);

    useEffect(() => {
      fetchOptions(debouncedSearchText);
    }, [debouncedSearchText, i18n.language, endpoints, fetchOptions]);

    useEffect(() => {
      if (searchText) hasFetchedRef.current = false;
    }, [searchText]);

    const handleSearch = useCallback((v: string) => {
      setSearchText(v);
    }, []);

    const isMultiple = mode === "multiple" || mode === "tags";

    const controlValue = value !== undefined ? value : defaultValue;

    const normalizeDefault = useMemo(() => {
      if (isMultiple) {
        if (Array.isArray(controlValue))
          return controlValue.map((d) => String(d));
        if (
          typeof controlValue === "string" ||
          typeof controlValue === "number"
        )
          return [String(controlValue)];
        return [];
      }
      if (Array.isArray(controlValue)) return String(controlValue[0] ?? "");
      if (controlValue === undefined) return "";
      return String(controlValue);
    }, [controlValue, isMultiple]);

    const [multiValues, setMultiValues] = useState<string[]>(
      Array.isArray(normalizeDefault)
        ? normalizeDefault
        : normalizeDefault
          ? [normalizeDefault]
          : []
    );
    const [singleValue, setSingleValue] = useState<string>(
      !Array.isArray(normalizeDefault)
        ? normalizeDefault
        : String(normalizeDefault[0] ?? "")
    );

    useEffect(() => {
      if (isMultiple) {
        const v = Array.isArray(normalizeDefault) ? normalizeDefault : [];
        setMultiValues(v as string[]);
      } else {
        setSingleValue(
          Array.isArray(normalizeDefault)
            ? String(normalizeDefault[0] ?? "")
            : String(normalizeDefault)
        );
      }
    }, [normalizeDefault, isMultiple]);

    useEffect(() => {
      if (!isMultiple) {
        if (value !== undefined && value !== singleValue) {
          const val = String(value ?? "");
          setSingleValue(val);
        }
      } else {
        if (value !== undefined && Array.isArray(value)) {
          const vals = value.map((v) => String(v));
          setMultiValues(vals);
        }
      }
    }, [value, isMultiple]);

    const handleSelectSingle = (val: string) => {
      setSingleValue(val);
      const opt = options.find((o) => String(o.value) === String(val));
      if (labelInValue) {
        onChange?.(
          opt
            ? { label: opt.label, value: opt.value }
            : { label: val, value: val }
        );
      } else {
        onChange?.(val);
      }
      if (opt) onUpdate?.(opt);
    };

    const handleToggleMulti = (val: string) => {
      setMultiValues((prev) => {
        const exists = prev.some((p) => String(p) === String(val));
        const next = exists
          ? prev.filter((p) => String(p) !== String(val))
          : [...prev, val];
        onChange?.(next);
        const opt = options.find((o) => String(o.value) === String(val));
        if (!exists && opt) onUpdate?.(opt);
        return next;
      });
    };

    const triggerBaseClass =
      "border border-input data-[placeholder]:text-muted-foreground bg-input-background flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";
    const errorClass = error ? "!border-destructive !ring-destructive/10" : "";
    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

    if (!isMultiple) {
      return (
        <div className={className}>
          <Label className="mb-2 !text-sm" htmlFor={uniqId}>
            {label}
          </Label>

          <RadixSelect
            value={singleValue}
            onValueChange={handleSelectSingle}
            onOpenChange={(o) => {
              setOpen(o);
            }}
          >
            <SelectTrigger
              id={uniqId}
              size="default"
              aria-label={label || placeholder || "select"}
              className={`${triggerBaseClass} ${errorClass} ${disabledClass}`}
            >
              <SelectValue
                placeholder={placeholder ?? toUpperCase(t("dataTable.select"))}
              />
            </SelectTrigger>

            <SelectContent>
              <div className="p-2">
                <div className="mb-2">
                  <input
                    className="w-full rounded border px-2 py-1 text-sm"
                    placeholder={toUpperCase(t("dataTable.search"))}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    disabled={disabled}
                  />
                </div>

                {loading ? (
                  <div className="text-muted-foreground px-2 py-2 text-sm">
                    {toUpperCase(t("dataTable.loading"))}
                  </div>
                ) : options.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-2 text-sm">
                    {toUpperCase(t("dataTable.noData"))}
                  </div>
                ) : (
                  options.map((opt) => (
                    <SelectItem
                      key={String(opt.value)}
                      value={String(opt.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="truncate">{opt.label}</div>
                        <div className="text-muted-foreground">
                          <CheckIcon className="size-4 opacity-0 group-data-[highlighted]:opacity-100" />
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </RadixSelect>
          {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
        </div>
      );
    }

    return (
      <div className={className}>
        <Label className="mb-2 !text-sm" htmlFor={uniqId}>
          {label}
        </Label>

        <RadixSelect open={open} onOpenChange={setOpen}>
          <SelectTrigger
            id={uniqId}
            aria-label={label || placeholder || "select"}
            className={cn(triggerBaseClass, errorClass, disabledClass)}
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {multiValues.length === 0 ? (
                  <div className="text-muted-foreground">
                    {placeholder ?? ""}
                  </div>
                ) : (
                  multiValues.map((v) => {
                    const found = options.find(
                      (o) => String(o.value) === String(v)
                    );
                    const labelNode = found ? found.label : v;
                    return (
                      <div
                        key={v}
                        className="bg-muted inline-flex items-center gap-2 rounded px-2 py-1 text-[12px] md:text-[13px]"
                      >
                        <span>{labelNode}</span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMulti(String(v));
                            }}
                            aria-label="remove"
                            className="ml-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </SelectTrigger>

          <SelectContent>
            <div className="p-2">
              <div className="mb-2">
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  placeholder={toUpperCase(t("dataTable.search"))}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={disabled}
                />
              </div>

              {loading ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {toUpperCase(t("dataTable.loading"))}
                </div>
              ) : options.length === 0 ? (
                <div className="text-muted-foreground px-2 py-2 text-sm">
                  {toUpperCase(t("dataTable.noData"))}
                </div>
              ) : (
                <div className="max-h-60 overflow-auto">
                  {options.map((opt) => {
                    const selected = multiValues.some(
                      (mv) => String(mv) === String(opt.value)
                    );
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => handleToggleMulti(String(opt.value))}
                        className={`hover:bg-accent/10 w-full px-2 py-2 text-left text-sm ${selected ? "bg-accent/10" : ""}`}
                        disabled={disabled}
                      >
                        <div className="flex items-center justify-between">
                          <div>{opt.label}</div>
                          {selected && (
                            <div className="text-muted-foreground text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </SelectContent>
        </RadixSelect>
        {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
      </div>
    );
  }
);

export default TranslatedSelect;
