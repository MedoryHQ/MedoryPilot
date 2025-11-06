"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { addToast } from "@heroui/toast";
import { useLocale } from "next-intl";
import { handleError } from "@/lib/handle-error";
import { toUpperCase } from "@/utils";

interface QueryProviderProps {
  children: React.ReactNode;
}

const createQueryClient = (locale: string) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const errors = handleError(error, locale);
        if (errors) {
          errors.forEach((error) => {
            const message =
              typeof error.message === "string"
                ? error.message
                : error.message[locale as "en" | "ka"];
            addToast({
              title: `${toUpperCase(locale === "en" ? "Error" : "შეცდომა")}`,
              description: message,
              color: "danger",
            });
          });
        }
      },
    }),
  });

const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const locale = useLocale();
  const queryClient = createQueryClient(locale);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
