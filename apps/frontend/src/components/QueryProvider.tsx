"use client";

import React, { useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { addToast } from "@heroui/toast";
import { useLocale } from "next-intl";
import { handleError } from "@/lib/handle-error";
import { toUpperCase } from "@/utils";

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

const initQueryClient = (locale: string) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (err: unknown) => {
        const errors = handleError(err, locale);
        if (!errors || !errors.length) return;

        errors.forEach((e) =>
          addToast({
            title: toUpperCase(locale === "en" ? "Error" : "შეცდომა"),
            description: String(e.message),
            color: "danger",
          })
        );
      },
    }),
  });

const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({
  children,
}) => {
  const locale = useLocale();
  const queryClient = useMemo(() => initQueryClient(locale), [locale]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
