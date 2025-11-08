import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const defaultLocale = "en" as const;
export const locales = ["ka", "en"] as const;

export type pathnames = "/" | "/landing" | "/sign-in" | "/sign-up" | "/[slug]";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: false,

  pathnames: {
    "/": "/",
    "/landing": "/landing",
    "/about-me": "/about-me",
    "/blogs": "/blogs",
    "/newses": "/newses",
    "/contact": "/contact",
    "/sign-in": "/sign-in",
    "/sign-up": "/sign-up",
    "/[slug]": {
      ka: "/[slug]",
      en: "/[slug]",
    },
  },
});

export type AppPathnames = keyof typeof routing.pathnames;

export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
