"use client";

import { Locale, usePathname, useRouter } from "@/i18n/routing";
import { useTransition, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";

export function LocaleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [realPath, setRealPath] = useState<string | null>(null);
  useEffect(() => {
    if (!pathname) return;
    if (pathname.includes("[")) {
      setRealPath(
        typeof window !== "undefined" ? window.location.pathname : pathname
      );
    } else {
      setRealPath(pathname);
    }
  }, [pathname]);

  function getUrlWithQuery(): string {
    const path = realPath ?? pathname ?? "/";
    const qs = searchParams?.toString();
    return qs ? `${path}?${qs}` : path ?? "/";
  }

  function onSelectChange(nextLocale: Locale) {
    const url = getUrlWithQuery();

    startTransition(() => {
      (router.replace as unknown as (href: any, opts?: any) => void)(url, {
        locale: nextLocale,
      });
    });
  }

  const nextLocale = locale === "en" ? "ka" : "en";

  return (
    <Button
      onClick={() => onSelectChange(nextLocale)}
      aria-label={`Switch language to ${
        nextLocale === "en" ? "English" : "ქართული"
      }`}
      disabled={isPending}
      className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md p-0 min-w-0 bg-transparent hover:bg-secondary transition-smooth uppercase font-semibold text-sm"
      type="button"
      aria-pressed={isPending}
    >
      {isPending ? (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#025661"
            strokeWidth="3"
            opacity="0.2"
          />
          <path
            d="M22 12a10 10 0 00-10-10"
            stroke="#025661"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <span className="leading-none font-semibold text-primary">
          {locale === "en" ? "EN" : "KA"}
        </span>
      )}
    </Button>
  );
}
