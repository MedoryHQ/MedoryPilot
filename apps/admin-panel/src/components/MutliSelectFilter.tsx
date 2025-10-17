import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/libs";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";

export type Option = { label: string; value: any };

export function MultiSelectFilter({
  f,
  values,
  setActiveFilters
}: {
  f: {
    key: string;
    label?: string;
    options?: Option[];
    withSearch?: boolean;
    onSearchChange?: (q: string) => void;
    searchValue?: string;
  };
  values: string[];
  setActiveFilters: (
    updater: (prev: Record<string, any>) => Record<string, any>
  ) => void;
}) {
  const { t } = useTranslation();

  const [q, setQ] = useState<string>(f.searchValue ?? "");
  const [debouncedQ, setDebouncedQ] = useState<string>(f.searchValue ?? "");
  const [remoteOptions, setRemoteOptions] = useState<Option[]>(f.options ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((f.searchValue ?? "") !== q) {
      setQ(f.searchValue ?? "");
      setDebouncedQ(f.searchValue ?? "");
    }
  }, [f.searchValue]);

  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(tmr);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    const callParent = async () => {
      if (typeof f.onSearchChange === "function") {
        setLoading(true);
        try {
          f.onSearchChange(debouncedQ);
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        setRemoteOptions(f.options ?? []);
      }
    };
    callParent();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, f.onSearchChange, f.options]);

  const optionList = useMemo(() => {
    const base = f.options ?? remoteOptions ?? [];
    if (f.withSearch && typeof f.onSearchChange !== "function") {
      const ql = (debouncedQ || "").toLowerCase().trim();
      if (!ql) return base;
      return base.filter((o) => String(o.label).toLowerCase().includes(ql));
    }
    return base;
  }, [f.options, remoteOptions, debouncedQ, f.withSearch, f.onSearchChange]);

  const displayLabel = useMemo(() => {
    if (!values || values.length === 0) return toUpperCase(t("dataTable.all"));
    const labels = (values ?? [])
      .map((v) => {
        const found = (f.options ?? optionList).find(
          (o) => String(o.value) === String(v)
        );
        return found ? found.label : String(v);
      })
      .slice(0, 3);
    return (
      labels.join(", ") + (values.length > 3 ? ` +${values.length - 3}` : "")
    );
  }, [values, f.options, optionList, t]);

  const toggleValue = (val: string) => {
    setActiveFilters((prev) => {
      const prevArr = Array.isArray(prev[f.key])
        ? [...(prev[f.key] as any[])]
        : [];
      const exists = prevArr.some((p) => String(p) === String(val));
      const nextArr = exists
        ? prevArr.filter((p) => String(p) !== String(val))
        : [...prevArr, val];
      return {
        ...prev,
        ...(nextArr.length ? { [f.key]: nextArr } : { [f.key]: undefined })
      };
    });
  };

  const clearVals = () => {
    setActiveFilters((prev) => {
      const copy = { ...prev };
      delete copy[f.key];
      return copy;
    });
    setQ("");
    if (typeof f.onSearchChange === "function") {
      f.onSearchChange("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm",
            values && values.length ? "bg-muted/5" : ""
          )}
        >
          <span className="truncate">{displayLabel}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{f.label}</div>
            <button
              type="button"
              onClick={clearVals}
              className="text-muted-foreground text-xs"
            >
              {toUpperCase(t("dataTable.clear"))}
            </button>
          </div>

          {f.withSearch && (
            <div className="mb-2">
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder={toUpperCase(t("dataTable.search"))}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}

          <div className="max-h-56 space-y-1 overflow-auto py-1">
            {loading ? (
              <div className="text-muted-foreground px-2 py-2 text-sm">
                {toUpperCase(t("dataTable.loading"))}
              </div>
            ) : optionList.length === 0 ? (
              <div className="text-muted-foreground px-2 py-2 text-sm">
                {toUpperCase(t("dataTable.noData"))}
              </div>
            ) : (
              optionList.map((opt) => {
                const valStr = String(opt.value);
                const checked = (values ?? []).some(
                  (v) => String(v) === valStr
                );
                return (
                  <label
                    key={valStr}
                    className="hover:bg-accent/5 flex items-center gap-2 rounded px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(valStr)}
                      className="h-4 w-4 rounded border"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
