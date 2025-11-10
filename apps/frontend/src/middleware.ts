import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const supportedLocales = ["ka", "en"];
const fallbackLocale = "ka";

const handleI18nRouting = createMiddleware(routing);

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/set-password",
  "/about-me",
  "/contact",
  "/blogs",
  "/newses",
  "/pages",
  "/search",
];

function isPublicPathForLocale(pathname: string, locale: string) {
  const path = pathname.replace(/\/+$/g, "");
  if (
    PUBLIC_PATHS.some(
      (p) => `/${locale}${p}` === path || (`/${locale}` === path && p === "/`")
    )
  ) {
    return true;
  }
  if (
    path.startsWith(`/${locale}/blogs`) ||
    path.startsWith(`/${locale}/newses`) ||
    path.startsWith(`/${locale}/pages`)
  ) {
    return true;
  }
  if (path === `/${locale}`) return true;

  return false;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return;
  }

  const segments = pathname.split("/");
  const firstSeg = segments[1];
  const locale = supportedLocales.includes(firstSeg) ? firstSeg : null;

  if (!locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${fallbackLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const normalizedPath = pathname;

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;

  const isPublic = isPublicPathForLocale(normalizedPath, locale);

  if (!isAuthenticated && !isPublic) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(signInUrl);
  }

  const intlResp = handleI18nRouting(request);

  return intlResp;
}

export const config = {
  matcher: ["/", "/(en|ka)/:path*"],
};
