import { useAuthStore } from "@/store";
import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

interface UseThemeProps {
  defaultTheme?: Theme;
  storageKey?: string;
}

export const useTheme = ({
  defaultTheme = "system",
  storageKey = "medory-theme"
}: UseThemeProps = {}) => {
  const { isLoggedIn } = useAuthStore();

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    if (!isLoggedIn) return "light";

    try {
      const stored = localStorage.getItem(storageKey);
      return (stored as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    const actualTheme = !isLoggedIn
      ? "light"
      : theme === "system"
        ? systemTheme
        : theme;

    root.classList.add(actualTheme);

    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Silent fail if localStorage is not available
    }

    root.classList.remove("theme-loading");
  }, [theme, systemTheme, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = window.document.documentElement;
    root.classList.add("theme-loading");

    const timer = setTimeout(() => {
      root.classList.remove("theme-loading");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const setThemePreference = (newTheme: Theme) => {
    if (!isLoggedIn) return;
    setTheme(newTheme);
  };

  const resolvedTheme = !isLoggedIn
    ? "light"
    : theme === "system"
      ? systemTheme
      : theme;

  const isDarkMode = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (!isLoggedIn) return;
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return {
    theme: !isLoggedIn ? "light" : theme,
    resolvedTheme,
    systemTheme,
    isDarkMode,
    setTheme: setThemePreference,
    toggleTheme
  };
};
