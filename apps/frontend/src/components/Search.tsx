"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchParams } from "@/hooks/params/use-search-params";
import { toUpperCase } from "@/utils";
import { Input } from "./ui";

export function useSearchController() {
  const [{ search }, setSearchParams] = useQueryStates(searchParams, {
    shallow: false,
    clearOnDefault: true,
  });
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isOnSearchPage = Boolean(pathname && pathname.includes("/search"));
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(search ?? "");
  useEffect(() => {
    setValue(search ?? "");
  }, [search]);
  const containerRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        requestAnimationFrame(() => {
          const root = containerRef.current;
          const el =
            (root &&
              (root.querySelector(
                "input, textarea, [contenteditable]"
              ) as HTMLInputElement | null)) ??
            null;
          if (el) {
            try {
              el.focus();
            } catch {}
            if (el.value) {
              const len = el.value.length;
              try {
                el.setSelectionRange(len, len);
              } catch {}
            }
          }
        });
      }, 50);
      return () => window.clearTimeout(id);
    }
    return;
  }, [isOpen]);
  const handleIconClick = () => {
    setValue(search ?? "");
    setIsOpen(true);
  };
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setIsOpen(false);
      setValue("");
      const root = containerRef.current;
      const el = root?.querySelector(
        "input, textarea, [contenteditable]"
      ) as HTMLElement | null;
      el?.blur();
      return;
    }
    if (isOnSearchPage) {
      setSearchParams({ search: trimmed });
    } else {
      router.push(`/${locale}/search?search=${encodeURIComponent(trimmed)}`);
    }
  };
  const handleBlur = () => {
    setIsOpen(false);
  };
  const handleEscape = () => {
    setIsOpen(false);
    setValue("");
    const root = containerRef.current;
    const el = root?.querySelector(
      "input, textarea, [contenteditable]"
    ) as HTMLElement | null;
    el?.blur();
  };
  return {
    isOpen,
    value,
    setValue,
    containerRef,
    handleIconClick,
    handleSubmit,
    handleBlur,
    handleEscape,
    isOnSearchPage,
  };
}

export function Search() {
  const {
    isOpen,
    value,
    setValue,
    containerRef,
    handleIconClick,
    handleSubmit,
    handleBlur,
    handleEscape,
  } = useSearchController();
  const t = useTranslations("Search");
  return (
    <AnimatePresence mode="wait">
      {!isOpen ? (
        <motion.button
          key="search-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleIconClick}
          className="p-2 rounded-lg transition-colors hover:bg-secondary"
          aria-label="Open search"
        >
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      ) : (
        <motion.form
          ref={containerRef}
          key="search-input"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          onSubmit={(e) => handleSubmit(e)}
          className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border border-primary/10"
        >
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={toUpperCase(t("searchPlaceholder"))}
            className="bg-transparent border-none outline-none text-sm w-full h-min p-0"
            autoFocus
            aria-label="Search input"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleEscape();
                const root = containerRef.current;
                const el = root?.querySelector(
                  "input, textarea, [contenteditable]"
                ) as HTMLElement | null;
                el?.blur();
              }
            }}
          />
        </motion.form>
      )}
    </AnimatePresence>
  );
}
