import { clsx, type ClassValue } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

const capitalizeWords = (text: string): string =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export const toUpperCase = (text: string): string => {
  if (typeof text !== "string") {
    throw new TypeError("Text must be a string");
  }
  if (/[ა-ჰ]/.test(text)) {
    return text.toLocaleUpperCase("ka-GE");
  }
  if (/[a-zA-Z]/.test(text)) {
    return capitalizeWords(text);
  }
  return text;
};

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
): string => {
  const paramsString = params?.toString() ?? "";
  return paramsString ? `${pathname}?${paramsString}` : pathname;
};

export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const BASE_URL: string | undefined =
  typeof BASE_API_URL === "string"
    ? BASE_API_URL.replace(/\/api\/v1\/?$/, "")
    : undefined;

export const getFullFilePath = (icon: string | null): string => {
  const PLACEHOLDER = "/placeholder.webp"; // TODO: Add placeholder image

  if (!icon) return PLACEHOLDER;

  const normalized = icon.replace(/\\/g, "/").trim();

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (!BASE_URL) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
  const path = normalized.startsWith("/") ? normalized.slice(1) : normalized;
  return `${BASE_URL.replace(/\/$/, "")}/${path}`;
};
