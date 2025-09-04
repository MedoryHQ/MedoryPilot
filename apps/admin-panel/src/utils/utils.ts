import { useEffect, useState } from "react";

export function cleanKeys(target: Record<string, any>, keysToCheck: string[]) {
  keysToCheck.forEach((key) => {
    const value = target[key];
    if (
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      value === ""
    ) {
      delete target[key];
    }
  });
  return target;
}

type Translation = {
  language: { code: string };
  [key: string]: any;
};

export const transformTranslationToObject = (
  translations?: Translation[]
): Record<string, Translation> => {
  if (!translations || translations.length === 0) return {};

  return translations.reduce<Record<string, Translation>>((acc, curr) => {
    if (curr.language?.code) {
      acc[curr.language.code] = curr;
    }
    return acc;
  }, {});
};

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
